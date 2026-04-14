import { describe, expect, it, vi } from 'vitest'

import type { LogDriver } from '../../src/contracts/LogDriver.js'
import type { LogEntry } from '../../src/LogEntry.js'
import { createLogEntry } from '../../src/LogEntry.js'
import { LogLevel } from '../../src/LogLevel.js'
import { StackDriver } from '../../src/drivers/StackDriver.js'

describe('StackDriver', () => {
  it('writes to all drivers', () => {
    const a = vi.fn()
    const b = vi.fn()
    const da: LogDriver = { write: (e: LogEntry) => a(e.message) }
    const db: LogDriver = { write: (e: LogEntry) => b(e.message) }
    const s = new StackDriver([da, db])
    const e = createLogEntry(LogLevel.ERROR, 'e', 'c', {})
    s.write(e)
    expect(a).toHaveBeenCalledWith('e')
    expect(b).toHaveBeenCalledWith('e')
  })
})
