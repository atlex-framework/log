import { describe, expect, it } from 'vitest'
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { createLogEntry } from '../../src/LogEntry.js'
import { LogLevel } from '../../src/LogLevel.js'
import { DailyDriver } from '../../src/drivers/DailyDriver.js'
import { LineFormatter } from '../../src/formatters/LineFormatter.js'

describe('DailyDriver', () => {
  it('writes to a date-suffixed file', async () => {
    const dir = join(tmpdir(), `atlex-daily-${Date.now()}`)
    const base = join(dir, 'app.log')
    const d = new DailyDriver(base, new LineFormatter(), 365)
    d.write(createLogEntry(LogLevel.INFO, 'line', 'c', {}))
    await d.close()
    const today = new Date().toISOString().slice(0, 10)
    const todayFile = join(dir, `app-${today}.log`)
    const body = await readFile(todayFile, 'utf8')
    expect(body).toContain('line')
    await rm(dir, { recursive: true, force: true })
  })
})
