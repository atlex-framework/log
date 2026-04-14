import { AtlexError, getApplicationContext } from '@atlex/core'

import type { LogManager } from '../LogManager.js'
import { readAtlexErrorCode } from '../readAtlexErrorCode.js'

function manager(): LogManager {
  let app
  try {
    app = getApplicationContext()
  } catch {
    throw new AtlexError(
      'Log is not available: application context is not set. Call application.boot() after registering LogServiceProvider.',
      'E_LOG_NO_APPLICATION',
    )
  }
  try {
    return app.make<LogManager>('log')
  } catch (err: unknown) {
    if (readAtlexErrorCode(err) === 'E_BINDING_NOT_FOUND') {
      throw new AtlexError(
        'LogManager is not registered. Register LogServiceProvider and bind the "log" singleton.',
        'E_LOG_NOT_REGISTERED',
      )
    }
    throw err
  }
}

/**
 * Facade for the default `log` container binding (requires booted application context).
 */
export const Log = {
  emergency: (message: string, context?: Record<string, unknown>): void => {
    manager().emergency(message, context)
  },
  alert: (message: string, context?: Record<string, unknown>): void => {
    manager().alert(message, context)
  },
  critical: (message: string, context?: Record<string, unknown>): void => {
    manager().critical(message, context)
  },
  error: (message: string, context?: Record<string, unknown>): void => {
    manager().error(message, context)
  },
  warning: (message: string, context?: Record<string, unknown>): void => {
    manager().warning(message, context)
  },
  notice: (message: string, context?: Record<string, unknown>): void => {
    manager().notice(message, context)
  },
  info: (message: string, context?: Record<string, unknown>): void => {
    manager().info(message, context)
  },
  debug: (message: string, context?: Record<string, unknown>): void => {
    manager().debug(message, context)
  },
  channel: (name: string) => manager().channel(name),
  stack: (names: readonly string[]) => manager().stack(names),
  withContext: (ctx: Record<string, unknown>) => manager().withContext(ctx),
}
