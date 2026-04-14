import { describe, expect, it } from 'vitest'
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { createLogEntry } from '../../src/LogEntry.js'
import { LogLevel } from '../../src/LogLevel.js'
import { FileDriver } from '../../src/drivers/FileDriver.js'
import { LineFormatter } from '../../src/formatters/LineFormatter.js'

describe('FileDriver', () => {
  it('appends lines in order', async () => {
    const dir = join(tmpdir(), `atlex-log-${Date.now()}`)
    const file = join(dir, 't.log')
    const d = new FileDriver(file, new LineFormatter())
    const e1 = createLogEntry(LogLevel.INFO, 'a', 'c', {})
    const e2 = createLogEntry(LogLevel.INFO, 'b', 'c', {})
    d.write(e1)
    d.write(e2)
    await d.close()
    const body = await readFile(file, 'utf8')
    expect(body.split('\n').filter(Boolean)).toHaveLength(2)
    expect(body).toContain('a')
    expect(body).toContain('b')
    await rm(dir, { recursive: true, force: true })
  })
})
