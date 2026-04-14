import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

import type { LogDriver } from '../contracts/LogDriver.js'
import type { LogFormatter } from '../contracts/LogFormatter.js'
import type { LogEntry } from '../LogEntry.js'
import { writeMetaError } from '../writeMetaError.js'

/**
 * Appends to a single log file (queued writes).
 */
export class FileDriver implements LogDriver {
  private writeQueue: Promise<void> = Promise.resolve()

  public constructor(
    private readonly filePath: string,
    private readonly formatter: LogFormatter,
  ) {}

  /**
   * @param entry - Entry to append.
   */
  public write(entry: LogEntry): void {
    this.writeQueue = this.writeQueue
      .then(() => this.doWrite(entry))
      .catch((err: unknown) => {
        writeMetaError('FileDriver', err)
      })
  }

  private async doWrite(entry: LogEntry): Promise<void> {
    const line = `${this.formatter.format(entry)}\n`
    await mkdir(dirname(this.filePath), { recursive: true })
    await appendFile(this.filePath, line, 'utf8')
  }

  /**
   * Wait for queued writes to finish.
   */
  public async close(): Promise<void> {
    await this.writeQueue
  }
}
