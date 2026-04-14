import type { ConfigRepository } from '@atlex/config'
import type { Application } from '@atlex/core'
import { AtlexError, ServiceProvider } from '@atlex/core'

import { LogManager } from './LogManager.js'
import { readAtlexErrorCode } from './readAtlexErrorCode.js'

function resolveBasePath(app: Application): string {
  try {
    return app.make<string>('paths.base')
  } catch (err: unknown) {
    if (readAtlexErrorCode(err) === 'E_BINDING_NOT_FOUND') {
      return process.cwd()
    }
    throw err
  }
}

/**
 * Binds `log` to a {@link LogManager} backed by `config`.
 */
export class LogServiceProvider extends ServiceProvider {
  /**
   * @param app - Application instance.
   */
  public register(app: Application): void {
    app.container.singleton('log', () => {
      let cfg: ConfigRepository
      try {
        cfg = app.make<ConfigRepository>('config')
      } catch (err: unknown) {
        if (readAtlexErrorCode(err) === 'E_BINDING_NOT_FOUND') {
          throw new AtlexError(
            'ConfigRepository must be registered before LogServiceProvider (register ConfigServiceProvider first).',
            'E_LOG_CONFIG_MISSING',
          )
        }
        throw err
      }
      const base = resolveBasePath(app)
      return new LogManager(cfg, base)
    })
  }

  /**
   * @param _app - Application instance.
   */
  public boot(_app: Application): void {
    // reserved
  }
}
