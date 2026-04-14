import { describe, expect, it } from 'vitest'

import { ConfigRepository } from '@atlex/config'

import { LogManager } from '../src/LogManager.js'

function repo(): ConfigRepository {
  return new ConfigRepository({
    logging: {
      default: 'stdout',
      channels: {
        stdout: { driver: 'console', level: 'debug', formatter: 'line' },
        null: { driver: 'null', level: 'debug' },
        stack: { driver: 'stack', level: 'debug', channels: ['null', 'stdout'] },
      },
    },
  })
}

describe('LogManager', () => {
  it('throws when channel missing', () => {
    const m = new LogManager(repo(), process.cwd())
    expect(() => m.channel('nope')).toThrow(/not found/)
  })

  it('caches channel loggers', () => {
    const m = new LogManager(repo(), process.cwd())
    expect(m.channel('stdout')).toBe(m.channel('stdout'))
  })

  it('proxies to default channel', () => {
    const m = new LogManager(repo(), process.cwd())
    expect(() => m.info('hello')).not.toThrow()
  })

  it('stack fans out', () => {
    const m = new LogManager(repo(), process.cwd())
    expect(() => m.stack(['null', 'stdout']).info('x')).not.toThrow()
  })

  it('detects circular stack', () => {
    const r = new ConfigRepository({
      logging: {
        default: 'stdout',
        channels: {
          stdout: { driver: 'console', level: 'debug', formatter: 'line' },
          a: { driver: 'stack', level: 'debug', channels: ['b'] },
          b: { driver: 'stack', level: 'debug', channels: ['a'] },
        },
      },
    })
    const m = new LogManager(r, process.cwd())
    expect(() => m.channel('a')).toThrow(/Circular/)
  })

  it('withContext returns new manager', () => {
    const m = new LogManager(repo(), process.cwd())
    const n = m.withContext({ x: 1 })
    expect(n).not.toBe(m)
  })
})
