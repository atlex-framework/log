import { appendFile, mkdir, readdir, unlink } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

import type { LogDriver } from '../contracts/LogDriver.js'
import type { LogFormatter } from '../contracts/LogFormatter.js'
import type { LogEntry } from '../LogEntry.js'
import { writeMetaError } from '../writeMetaError.js'

/**
 * Daily log files `{base}-{YYYY-MM-DD}.log` with optional retention cleanup.
 */
export class DailyDriver implements LogDriver {
  private writeQueue: Promise<void> = Promise.resolve()

  private lastCleanupIsoDay = ''

  public constructor(
    private readonly basePath: string,
    private readonly formatter: LogFormatter,
    private readonly retentionDays = 14,
  ) {}

  /**
   * @param entry - Entry to append to today's file.
   */
  public write(entry: LogEntry): void {
    const date = this.formatUtcDate(entry.timestamp)
    this.writeQueue = this.writeQueue
      .then(async () => {
        if (date !== this.lastCleanupIsoDay) {
          this.lastCleanupIsoDay = date
          void this.cleanup().catch((err: unknown) => {
            writeMetaError('DailyDriver.cleanup', err)
          })
        }
        await this.doWrite(entry, date)
      })
      .catch((err: unknown) => {
        writeMetaError('DailyDriver', err)
      })
  }

  private formatUtcDate(d: Date): string {
    return d.toISOString().slice(0, 10)
  }

  private getDirectory(): string {
    return dirname(this.basePath)
  }

  private getFilepath(date: string): string {
    const dir = this.getDirectory()
    const base = basename(this.basePath, '.log')
    return join(dir, `${base}-${date}.log`)
  }

  private async doWrite(entry: LogEntry, date: string): Promise<void> {
    const target = this.getFilepath(date)
    const line = `${this.formatter.format(entry)}\n`
    await mkdir(dirname(target), { recursive: true })
    await appendFile(target, line, 'utf8')
  }

  private async cleanup(): Promise<void> {
    const dir = this.getDirectory()
    const prefix = `${basename(this.basePath, '.log')}-`
    const suffix = '.log'
    let names: string[]
    try {
      names = await readdir(dir)
    } catch {
      return
    }
    const cutoff = Date.now() - this.retentionDays * 86_400_000
    for (const name of names) {
      if (!name.startsWith(prefix) || !name.endsWith(suffix)) continue
      const mid = name.slice(prefix.length, -suffix.length)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(mid)) continue
      const t = Date.parse(`${mid}T00:00:00.000Z`)
      if (Number.isNaN(t) || t >= cutoff) continue
      try {
        await unlink(join(dir, name))
      } catch (err: unknown) {
        writeMetaError('DailyDriver.unlink', err)
      }
    }
  }

  /**
   * Flush queue and run a final cleanup pass.
   */
  public async close(): Promise<void> {
    await this.writeQueue
    await this.cleanup()
  }
}
