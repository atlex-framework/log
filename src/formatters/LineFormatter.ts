import type { LogFormatter } from '../contracts/LogFormatter.js'
import type { LogEntry } from '../LogEntry.js'

/**
 * Single-line human-readable log lines.
 */
export class LineFormatter implements LogFormatter {
  /**
   * @param entry - Entry to format.
   * @returns `[timestamp] channel.LEVEL: message {json context}`.
   */
  public format(entry: LogEntry): string {
    const ts = this.formatDate(entry.timestamp)
    const lvl = entry.level.toUpperCase()
    const ctx = Object.keys(entry.context).length > 0 ? ` ${JSON.stringify(entry.context)}` : ''
    let line = `[${ts}] ${entry.channel}.${lvl}: ${entry.message}${ctx}`
    if (entry.exception !== undefined) {
      const stack = entry.exception.stack ?? entry.exception.message
      line += `\n${stack}`
    }
    return line
  }

  private formatDate(date: Date): string {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
  }
}
