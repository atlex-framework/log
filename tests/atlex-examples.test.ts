import { describe, expect, it } from 'vitest'

import { LogLevel, parseLogLevel, shouldLog } from '../src/LogLevel.js'

describe('@atlex/log examples', () => {
  it('parseLogLevel info', () => {
    expect(parseLogLevel('info')).toBe(LogLevel.INFO)
  })

  it('shouldLog respects min', () => {
    expect(shouldLog(LogLevel.ERROR, LogLevel.WARNING)).toBe(true)
  })

  it('shouldLog blocks debug when min warning', () => {
    expect(shouldLog(LogLevel.DEBUG, LogLevel.WARNING)).toBe(false)
  })

  it('LogLevel enum values', () => {
    expect(LogLevel.CRITICAL).toBe('critical')
  })

  it('parseLogLevel debug', () => {
    expect(parseLogLevel('debug')).toBe(LogLevel.DEBUG)
  })
})
