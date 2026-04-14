import { describe, expect, it } from 'vitest'

import { createLogEntry } from '../../src/LogEntry.js'
import { LogLevel } from '../../src/LogLevel.js'
import { LineFormatter } from '../../src/formatters/LineFormatter.js'

describe('LineFormatter', () => {
  it('includes channel, level, message', () => {
    const f = new LineFormatter()
    const e = createLogEntry(LogLevel.INFO, 'hi', 'app', { id: 1 })
    const s = f.format(e)
    expect(s).toContain('app.INFO')
    expect(s).toContain('hi')
    expect(s).toContain('"id":1')
  })
})
