import type { LogLevel } from './LogLevel.js'

/**
 * One log record passed to drivers and formatters.
 */
export interface LogEntry {
  /** RFC 5424 log level. */
  level: LogLevel
  /** Message text. */
  message: string
  /** Structured context (merged from manager, logger, and call site). */
  context: Record<string, unknown>
  /** Creation time. */
  timestamp: Date
  /** Channel name. */
  channel: string
  /** Optional primary exception. */
  exception?: Error
  /** Processor / driver extensions. */
  extra: Record<string, unknown>
}

/**
 * Build a {@link LogEntry}.
 *
 * @param level - Severity.
 * @param message - Message text.
 * @param channel - Channel name.
 * @param context - Context object.
 * @param exception - Optional error.
 * @param extra - Extra metadata.
 * @returns New entry.
 */
export function createLogEntry(
  level: LogLevel,
  message: string,
  channel: string,
  context: Record<string, unknown> = {},
  exception?: Error,
  extra: Record<string, unknown> = {},
): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date(),
    channel,
    exception,
    extra,
  }
}
