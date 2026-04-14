import { describe, expect, it } from 'vitest'

import { LogLevel, getSeverity, parseLogLevel, shouldLog } from '../src/LogLevel.js'

describe('LogLevel', () => {
  it('parses case-insensitive names', () => {
    expect(parseLogLevel('DEBUG')).toBe(LogLevel.DEBUG)
    expect(parseLogLevel('warning')).toBe(LogLevel.WARNING)
  })

  it('shouldLog respects severity', () => {
    expect(shouldLog(LogLevel.ERROR, LogLevel.WARNING)).toBe(true)
    expect(shouldLog(LogLevel.DEBUG, LogLevel.INFO)).toBe(false)
  })

  it('getSeverity orders correctly', () => {
    expect(getSeverity(LogLevel.EMERGENCY)).toBeGreaterThan(getSeverity(LogLevel.DEBUG))
  })
})
