import { afterEach, describe, expect, it } from 'vitest'

import { Application, resetApplicationContextForTests } from '@atlex/core'
import { ConfigRepository } from '@atlex/config'

import { Log } from '../src/helpers/Log.js'
import { LogManager } from '../src/LogManager.js'

describe('Log facade', () => {
  afterEach(() => {
    resetApplicationContextForTests()
  })

  it('logs via container after boot', () => {
    const app = new Application()
    const repo = new ConfigRepository({
      logging: {
        default: 'null',
        channels: { null: { driver: 'null', level: 'debug' } },
      },
    })
    app.container.instance('config', repo)
    app.container.instance('log', new LogManager(repo, process.cwd()))
    app.boot()
    expect(() => Log.info('ok')).not.toThrow()
  })

  it('throws when log missing', () => {
    const app = new Application()
    app.boot()
    expect(() => Log.info('x')).toThrow(/not registered/)
  })
})
