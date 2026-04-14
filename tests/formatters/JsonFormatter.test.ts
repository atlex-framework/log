import { describe, expect, it } from 'vitest'

import { createLogEntry } from '../../src/LogEntry.js'
import { LogLevel } from '../../src/LogLevel.js'
import { JsonFormatter } from '../../src/formatters/JsonFormatter.js'

describe('JsonFormatter', () => {
  it('emits compact JSON', () => {
    const f = new JsonFormatter()
    const e = createLogEntry(LogLevel.INFO, 'm', 'c', { x: 1 })
    const s = f.format(e)
    const o = JSON.parse(s) as { level: string; message: string }
    expect(o.level).toBe('info')
    expect(o.message).toBe('m')
  })
})
