import type { LogProcessor } from '../contracts/LogProcessor.js'
import type { LogEntry } from '../LogEntry.js'

/**
 * Merges fixed fields into {@link LogEntry.context}.
 */
export class ContextProcessor implements LogProcessor {
  public constructor(private readonly fields: Record<string, unknown>) {}

  /**
   * @param entry - Incoming entry.
   * @returns Clone with merged context.
   */
  public process(entry: LogEntry): LogEntry {
    return {
      ...entry,
      context: { ...this.fields, ...entry.context },
    }
  }
}
