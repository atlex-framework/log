import type { LogDriver } from '../contracts/LogDriver.js'
import type { LogEntry } from '../LogEntry.js'
import type { Logger } from '../Logger.js'

/**
 * Forwards the same entry to several {@link Logger} instances (each applies its own level filter).
 */
export class FanoutLoggerDriver implements LogDriver {
  public constructor(private readonly loggers: readonly Logger[]) {}

  /**
   * @param entry - Entry to forward.
   */
  public write(entry: LogEntry): void {
    for (const logger of this.loggers) {
      logger.emit(entry)
    }
  }

  /**
   * Close all nested loggers' drivers.
   */
  public async close(): Promise<void> {
    await Promise.all(this.loggers.map((l) => l.closeDriver()))
  }
}
