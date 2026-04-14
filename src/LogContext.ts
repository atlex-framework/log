/**
 * Per-logger context merged with manager-level shared context at log time.
 */
export class LogContext {
  private readonly instanceContext = new Map<string, unknown>()

  /**
   * Merge keys into the instance context.
   *
   * @param context - Key/value pairs.
   */
  public setInstance(context: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(context)) {
      this.instanceContext.set(key, value)
    }
  }

  /**
   * @returns Shallow copy of instance-only context.
   */
  public getInstance(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of this.instanceContext.entries()) {
      result[key] = value
    }
    return result
  }

  /**
   * Merge manager shared context with instance context (instance wins on key clash).
   *
   * @param shared - Context from {@link LogManager}.
   * @returns Merged plain object.
   */
  public merge(shared: Record<string, unknown>): Record<string, unknown> {
    return {
      ...shared,
      ...this.getInstance(),
    }
  }

  /**
   * Clear instance context.
   */
  public clear(): void {
    this.instanceContext.clear()
  }
}
