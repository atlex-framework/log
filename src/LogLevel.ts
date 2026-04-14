import { AtlexError } from '@atlex/core'

/**
 * RFC 5424 severity levels (string values are lowercase for config interchange).
 */
export enum LogLevel {
  EMERGENCY = 'emergency',
  ALERT = 'alert',
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}

const LEVEL_PARSE: Record<string, LogLevel> = {
  emergency: LogLevel.EMERGENCY,
  alert: LogLevel.ALERT,
  critical: LogLevel.CRITICAL,
  error: LogLevel.ERROR,
  warning: LogLevel.WARNING,
  notice: LogLevel.NOTICE,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
}

const SEVERITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.NOTICE]: 2,
  [LogLevel.WARNING]: 3,
  [LogLevel.ERROR]: 4,
  [LogLevel.CRITICAL]: 5,
  [LogLevel.ALERT]: 6,
  [LogLevel.EMERGENCY]: 7,
}

/**
 * Parse a config string into {@link LogLevel}.
 *
 * @param level - Case-insensitive level name.
 * @returns Matching enum member.
 * @throws AtlexError when the level is unknown.
 */
export function parseLogLevel(level: string): LogLevel {
  const key = level.trim().toLowerCase()
  const found = LEVEL_PARSE[key]
  if (found === undefined) {
    throw new AtlexError(`Invalid log level: ${level}`, 'E_INVALID_LOG_LEVEL')
  }
  return found
}

/**
 * Numeric severity for comparisons (higher = more severe).
 *
 * @param level - Log level.
 * @returns Severity score.
 */
export function getSeverity(level: LogLevel): number {
  return SEVERITY[level]
}

/**
 * Whether an entry at `entryLevel` should be emitted when the channel minimum is `channelLevel`.
 *
 * @param entryLevel - Message level.
 * @param channelLevel - Channel threshold.
 * @returns True when the entry is at least as severe as the threshold.
 */
export function shouldLog(entryLevel: LogLevel, channelLevel: LogLevel): boolean {
  return getSeverity(entryLevel) >= getSeverity(channelLevel)
}
