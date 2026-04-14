import { describe, expect, it } from 'vitest'

import { createLogEntry } from '../src/LogEntry.js'
import { LogLevel } from '../src/LogLevel.js'
import { ContextProcessor } from '../src/processors/ContextProcessor.js'

describe('ContextProcessor', () => {
  it('merges fields into context', () => {
    const p = new ContextProcessor({ a: 1 })
    const e = createLogEntry(LogLevel.INFO, 'm', 'c', { b: 2 })
    const out = p.process(e)
    expect(out.context).toEqual({ a: 1, b: 2 })
  })
})
