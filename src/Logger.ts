import type { LogDriver } from './contracts/LogDriver.js'
import { LogContext } from './LogContext.js'
import { createLogEntry, type LogEntry } from './LogEntry.js'
import { LogLevel, shouldLog } from './LogLevel.js'
import { writeMetaError } from './writeMetaError.js'

/**
 * Channel-scoped logger with RFC 5424 methods.
 */
export class Logger {
  public readonly channelKey: string

  public constructor(
    private readonly driver: LogDriver,
    channel: string,
    private readonly minLevel: LogLevel,
    private readonly context: LogContext = new LogContext(),
    private readonly managerShared: Record<string, unknown> = {},
  ) {
    this.channelKey = channel
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public emergency(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.EMERGENCY, message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public alert(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ALERT, message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public critical(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.CRITICAL, message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public warning(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARNING, message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public notice(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.NOTICE, message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * @param level - Severity.
   * @param message - Text.
   * @param context - Optional context.
   */
  public log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!shouldLog(level, this.minLevel)) {
      return
    }
    const mergedContext = {
      ...this.context.merge(this.managerShared),
      ...context,
    }
    const entry = createLogEntry(level, message, this.channelKey, mergedContext)
    this.writeEntry(entry)
  }

  /**
   * Async variant when the driver returns a promise.
   *
   * @param level - Severity.
   * @param message - Text.
   * @param context - Optional context.
   */
  public async logAsync(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): Promise<void> {
    if (!shouldLog(level, this.minLevel)) {
      return
    }
    const mergedContext = {
      ...this.context.merge(this.managerShared),
      ...context,
    }
    const entry = createLogEntry(level, message, this.channelKey, mergedContext)
    try {
      const result = this.driver.write(entry)
      if (result instanceof Promise) {
        await result
      }
    } catch (error: unknown) {
      writeMetaError(`Logger:${this.channelKey}`, error)
    }
  }

  /**
   * Forward a pre-built entry (used by {@link FanoutLoggerDriver}); applies level filter and channel relabel.
   *
   * @param entry - Source entry.
   */
  public emit(entry: LogEntry): void {
    if (!shouldLog(entry.level, this.minLevel)) {
      return
    }
    const relabeled = createLogEntry(
      entry.level,
      entry.message,
      this.channelKey,
      { ...entry.context },
      entry.exception,
      { ...entry.extra },
    )
    relabeled.timestamp = entry.timestamp
    this.writeEntry(relabeled)
  }

  /**
   * @param context - Extra instance context.
   * @returns New logger sharing the same driver.
   */
  public withContext(context: Record<string, unknown>): Logger {
    const nc = new LogContext()
    nc.setInstance(this.context.getInstance())
    nc.setInstance(context)
    return new Logger(this.driver, this.channelKey, this.minLevel, nc, this.managerShared)
  }

  /**
   * @returns Instance-only context.
   */
  public getContext(): Record<string, unknown> {
    return this.context.getInstance()
  }

  /**
   * @param error - Caught error.
   * @param level - Severity (default error).
   * @param context - Extra fields.
   */
  public exception(
    error: Error,
    level: LogLevel = LogLevel.ERROR,
    context?: Record<string, unknown>,
  ): void {
    this.log(level, error.message, {
      ...context,
      exception: error.stack,
      exceptionType: error.constructor.name,
    })
  }

  /**
   * Flush the underlying driver when supported.
   */
  public async closeDriver(): Promise<void> {
    await Promise.resolve(this.driver.close?.())
  }

  private writeEntry(entry: LogEntry): void {
    try {
      const result = this.driver.write(entry)
      if (result instanceof Promise) {
        void result.catch((error: unknown) => {
          writeMetaError(`Logger:${this.channelKey}`, error)
        })
      }
    } catch (error: unknown) {
      writeMetaError(`Logger:${this.channelKey}`, error)
    }
  }
}
