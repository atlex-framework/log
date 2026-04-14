import type { LogDriver } from '../contracts/LogDriver.js'
import type { LogEntry } from '../LogEntry.js'
import { writeMetaError } from '../writeMetaError.js'

/**
 * Fan-out to multiple drivers.
 */
export class StackDriver implements LogDriver {
  public constructor(private readonly drivers: readonly LogDriver[]) {}

  /**
   * @param entry - Entry to replicate.
   */
  public write(entry: LogEntry): void {
    for (const driver of this.drivers) {
      try {
        const result = driver.write(entry)
        if (result instanceof Promise) {
          void result.catch((err: unknown) => {
            writeMetaError('StackDriver', err)
          })
        }
      } catch (err: unknown) {
        writeMetaError('StackDriver', err)
      }
    }
  }

  /**
   * Close all nested drivers.
   */
  public async close(): Promise<void> {
    await Promise.all(this.drivers.map((d) => Promise.resolve(d.close?.()).then(() => undefined)))
  }
}
