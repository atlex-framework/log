import type { LogDriver } from '../contracts/LogDriver.js'
import type { LogEntry } from '../LogEntry.js'

/**
 * Drops all entries (tests / silencing).
 */
export class NullDriver implements LogDriver {
  /**
   * @param _entry - Ignored.
   */
  public write(_entry: LogEntry): void {
    // intentionally empty
  }
}
