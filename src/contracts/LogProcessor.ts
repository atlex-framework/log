import type { LogEntry } from '../LogEntry.js'

/**
 * Transforms a {@link LogEntry} before it reaches the driver.
 */
export interface LogProcessor {
  /**
   * @param entry - Incoming entry.
   * @returns Possibly modified entry.
   */
  process(entry: LogEntry): LogEntry
}
