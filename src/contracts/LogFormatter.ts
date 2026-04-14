import type { LogEntry } from '../LogEntry.js'

/**
 * Turns a {@link LogEntry} into a line or blob for storage.
 */
export interface LogFormatter {
  /**
   * @param entry - Entry to render.
   * @returns Serialized form (often one line).
   */
  format(entry: LogEntry): string
}
