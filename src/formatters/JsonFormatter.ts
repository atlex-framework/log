import type { LogFormatter } from '../contracts/LogFormatter.js'
import type { LogEntry } from '../LogEntry.js'

/**
 * One JSON object per line (NDJSON).
 */
export class JsonFormatter implements LogFormatter {
  /**
   * @param entry - Entry to format.
   * @returns Compact JSON string.
   */
  public format(entry: LogEntry): string {
    const payload: Record<string, unknown> = {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      channel: entry.channel,
      message: entry.message,
      context: entry.context,
      extra: entry.extra,
    }
    if (entry.exception !== undefined) {
      payload.exception = {
        name: entry.exception.name,
        message: entry.exception.message,
        stack: entry.exception.stack,
      }
    }
    return JSON.stringify(payload)
  }
}
