import type { LogEntry } from '../LogEntry.js'

/**
 * Writes formatted log output to a destination.
 */
export interface LogDriver {
  /**
   * Persist one entry (sync or async).
   *
   * @param entry - Entry to write.
   * @returns Optionally a promise when I/O is async.
   */
  write(entry: LogEntry): void | Promise<void>

  /**
   * Flush and release resources when implemented.
   */
  close?(): void | Promise<void>
}
