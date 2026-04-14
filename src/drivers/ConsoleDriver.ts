import type { LogDriver } from '../contracts/LogDriver.js'
import type { LogFormatter } from '../contracts/LogFormatter.js'
import type { LogEntry } from '../LogEntry.js'
import { LogLevel, getSeverity } from '../LogLevel.js'

/**
 * Writes to stdout (lower severity) or stderr (warning+).
 */
export class ConsoleDriver implements LogDriver {
  public constructor(private readonly formatter: LogFormatter) {}

  /**
   * @param entry - Entry to print.
   */
  public write(entry: LogEntry): void {
    const line = this.formatter.format(entry) + '\n'
    const useStderr = getSeverity(entry.level) >= getSeverity(LogLevel.WARNING)
    const stream = useStderr ? process.stderr : process.stdout
    stream.write(line)
  }
}
