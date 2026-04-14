import type { LogFormatter } from '../contracts/LogFormatter.js'
import type { LogEntry } from '../LogEntry.js'
import { LogLevel } from '../LogLevel.js'

/**
 * Multi-line, optionally colorized output for terminals.
 */
export class PrettyFormatter implements LogFormatter {
  public constructor(private readonly colors: boolean = process.stdout.isTTY) {}

  /**
   * @param entry - Entry to format.
   * @returns Multi-line block.
   */
  public format(entry: LogEntry): string {
    const levelTag = entry.level.toUpperCase()
    const cOpen = this.colorForLevel(entry.level)
    const reset = this.reset()
    const head = this.colors
      ? `${cOpen}[${levelTag}]${reset} ${entry.channel} • ${entry.message}`
      : `[${levelTag}] ${entry.channel} • ${entry.message}`
    const lines = [head]
    if (Object.keys(entry.context).length > 0) {
      lines.push(
        `  └─ context: ${JSON.stringify(entry.context, null, 2).split('\n').join('\n     ')}`,
      )
    }
    lines.push(`  └─ timestamp: ${entry.timestamp.toISOString()}`)
    if (entry.exception !== undefined) {
      const stack = entry.exception.stack ?? entry.exception.message
      lines.push(
        `  └─ exception:\n${stack
          .split('\n')
          .map((l) => `     ${l}`)
          .join('\n')}`,
      )
    }
    return lines.join('\n')
  }

  private colorForLevel(level: LogLevel): string {
    if (!this.colors) return ''
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[90m'
      case LogLevel.INFO:
      case LogLevel.NOTICE:
        return '\x1b[37m'
      case LogLevel.WARNING:
        return '\x1b[33m'
      case LogLevel.ERROR:
        return '\x1b[31m'
      case LogLevel.CRITICAL:
      case LogLevel.ALERT:
        return '\x1b[91m'
      case LogLevel.EMERGENCY:
        return '\x1b[101m\x1b[30m'
      default:
        return ''
    }
  }

  private reset(): string {
    return this.colors ? '\x1b[0m' : ''
  }
}
