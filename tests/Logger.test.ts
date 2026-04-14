import { describe, expect, it } from 'vitest'

import type { LogDriver } from '../src/contracts/LogDriver.js'
import type { LogEntry } from '../src/LogEntry.js'
import { Logger } from '../src/Logger.js'
import { LogLevel } from '../src/LogLevel.js'
import { LogContext } from '../src/LogContext.js'

describe('Logger', () => {
  it('filters by minimum level', () => {
    const writes: LogEntry[] = []
    const driver: LogDriver = {
      write(entry: LogEntry) {
        writes.push(entry)
      },
    }
    const logger = new Logger(driver, 'test', LogLevel.WARNING)
    logger.debug('nope')
    logger.info('nope')
    logger.warning('yes')
    expect(writes).toHaveLength(1)
    expect(writes[0]?.message).toBe('yes')
  })

  it('merges manager shared and instance context', () => {
    const writes: LogEntry[] = []
    const driver: LogDriver = {
      write(entry: LogEntry) {
        writes.push(entry)
      },
    }
    const ctx = new LogContext()
    ctx.setInstance({ a: 1 })
    const logger = new Logger(driver, 't', LogLevel.DEBUG, ctx, { b: 2 })
    logger.info('m', { c: 3 })
    expect(writes[0]?.context).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('withContext returns new logger with merged instance context', () => {
    const driver: LogDriver = { write: () => {} }
    const base = new Logger(driver, 't', LogLevel.DEBUG)
    const scoped = base.withContext({ rid: 'x' })
    expect(scoped).not.toBe(base)
    expect(scoped.getContext().rid).toBe('x')
  })

  it('does not throw when driver throws', () => {
    const driver: LogDriver = {
      write() {
        throw new Error('fail')
      },
    }
    const logger = new Logger(driver, 't', LogLevel.DEBUG)
    expect(() => logger.info('x')).not.toThrow()
  })

  it('exception includes stack hint', () => {
    const writes: LogEntry[] = []
    const driver: LogDriver = {
      write(e: LogEntry) {
        writes.push(e)
      },
    }
    const logger = new Logger(driver, 't', LogLevel.DEBUG)
    const err = new Error('boom')
    logger.exception(err)
    expect(writes[0]?.message).toBe('boom')
    expect(String(writes[0]?.context.exception)).toContain('boom')
  })
})
