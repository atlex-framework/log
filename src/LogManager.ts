import { join } from 'node:path'

import type { ConfigRepository } from '@atlex/config'
import { AtlexError } from '@atlex/core'

import type { LogDriver } from './contracts/LogDriver.js'
import type { LogFormatter } from './contracts/LogFormatter.js'
import { ConsoleDriver } from './drivers/ConsoleDriver.js'
import { DailyDriver } from './drivers/DailyDriver.js'
import { FanoutLoggerDriver } from './drivers/FanoutLoggerDriver.js'
import { FileDriver } from './drivers/FileDriver.js'
import { NullDriver } from './drivers/NullDriver.js'
import { JsonFormatter } from './formatters/JsonFormatter.js'
import { LineFormatter } from './formatters/LineFormatter.js'
import { PrettyFormatter } from './formatters/PrettyFormatter.js'
import { LogContext } from './LogContext.js'
import { Logger } from './Logger.js'
import type { LoggingChannelConfig } from './loggingTypes.js'
import { LogLevel, parseLogLevel } from './LogLevel.js'

type CustomDriverFactory = (
  channelName: string,
  cfg: LoggingChannelConfig,
  visited: ReadonlySet<string>,
) => LogDriver

/**
 * Resolves logging channels from config and exposes convenience methods.
 */
export class LogManager {
  private readonly loggers = new Map<string, Logger>()

  private readonly customDrivers = new Map<string, CustomDriverFactory>()

  public constructor(
    private readonly config: ConfigRepository,
    private readonly basePath: string,
    private readonly shared: Record<string, unknown> = {},
  ) {}

  /**
   * @param name - Channel key in `logging.channels`.
   * @returns Cached {@link Logger}.
   */
  public channel(name: string): Logger {
    return this.resolveChannel(name, new Set())
  }

  private resolveChannel(name: string, visiting: Set<string>): Logger {
    const hit = this.loggers.get(name)
    if (hit !== undefined) {
      return hit
    }
    if (visiting.has(name)) {
      throw new AtlexError(
        `Circular logging stack involving channel '${name}'.`,
        'E_LOG_STACK_CYCLE',
      )
    }
    visiting.add(name)
    try {
      const cfg = this.getChannelConfig(name)
      let logger: Logger
      if (cfg.driver === 'stack') {
        const subs = cfg.channels ?? []
        const children = subs.map((n) => this.resolveChannel(n, visiting))
        const driver = new FanoutLoggerDriver(children)
        const min = parseLogLevel(cfg.level ?? 'debug')
        logger = new Logger(driver, name, min, new LogContext(), this.shared)
      } else {
        const driver = this.buildDriver(name, cfg, new Set())
        const min = parseLogLevel(cfg.level ?? 'debug')
        logger = new Logger(driver, name, min, new LogContext(), this.shared)
      }
      this.loggers.set(name, logger)
      return logger
    } finally {
      visiting.delete(name)
    }
  }

  /**
   * @param channelNames - Channels to fan out to.
   * @returns Logger writing to all listed channels.
   */
  public stack(channelNames: readonly string[]): Logger {
    const loggers = channelNames.map((n) => this.channel(n))
    return new Logger(
      new FanoutLoggerDriver(loggers),
      channelNames.join('+'),
      LogLevel.DEBUG,
      new LogContext(),
      this.shared,
    )
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public emergency(message: string, context?: Record<string, unknown>): void {
    this.channel(this.getDefaultChannel()).emergency(message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public alert(message: string, context?: Record<string, unknown>): void {
    this.channel(this.getDefaultChannel()).alert(message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public critical(message: string, context?: Record<string, unknown>): void {
    this.channel(this.getDefaultChannel()).critical(message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public error(message: string, context?: Record<string, unknown>): void {
    this.channel(this.getDefaultChannel()).error(message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public warning(message: string, context?: Record<string, unknown>): void {
    this.channel(this.getDefaultChannel()).warning(message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public notice(message: string, context?: Record<string, unknown>): void {
    this.channel(this.getDefaultChannel()).notice(message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.channel(this.getDefaultChannel()).info(message, context)
  }

  /**
   * @param message - Text.
   * @param context - Optional context.
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.channel(this.getDefaultChannel()).debug(message, context)
  }

  /**
   * @param context - Shared fields merged into subsequent entries.
   * @returns New manager (custom {@link extend} registrations are copied).
   */
  public withContext(context: Record<string, unknown>): LogManager {
    const next = new LogManager(this.config, this.basePath, { ...this.shared, ...context })
    for (const [k, v] of this.customDrivers) {
      next.customDrivers.set(k, v)
    }
    return next
  }

  /**
   * @param name - Custom driver key.
   * @param factory - Builds a {@link LogDriver} for matching channels.
   */
  public extend(name: string, factory: CustomDriverFactory): void {
    this.customDrivers.set(name, factory)
  }

  /**
   * Flush all cached channel drivers.
   */
  public async close(): Promise<void> {
    await Promise.all([...this.loggers.values()].map((l) => l.closeDriver()))
  }

  private getDefaultChannel(): string {
    const v = this.config.get<string>('logging.default', 'stdout')
    return typeof v === 'string' ? v : 'stdout'
  }

  private getChannelConfig(name: string): LoggingChannelConfig {
    const raw = this.config.get(`logging.channels.${name}`)
    if (
      raw === undefined ||
      typeof raw !== 'object' ||
      raw === null ||
      !('driver' in raw) ||
      typeof (raw as { driver: unknown }).driver !== 'string'
    ) {
      throw new AtlexError(
        `Channel '${name}' not found in logging config.`,
        'E_LOG_CHANNEL_NOT_FOUND',
      )
    }
    return raw as LoggingChannelConfig
  }

  private createFormatter(
    name: string | undefined,
    channelConfig: LoggingChannelConfig,
  ): LogFormatter {
    const fmt = name ?? 'line'
    if (fmt === 'json') {
      return new JsonFormatter()
    }
    if (fmt === 'pretty') {
      return new PrettyFormatter(channelConfig.colors ?? process.stdout.isTTY)
    }
    return new LineFormatter()
  }

  private buildDriver(
    channelName: string,
    cfg: LoggingChannelConfig,
    visited: Set<string>,
  ): LogDriver {
    if (visited.has(channelName)) {
      throw new AtlexError(
        `Circular logging stack involving channel '${channelName}'.`,
        'E_LOG_STACK_CYCLE',
      )
    }
    visited.add(channelName)

    const driverName = cfg.driver
    const custom = this.customDrivers.get(driverName)
    if (custom !== undefined) {
      return custom(channelName, cfg, visited)
    }

    const formatter = this.createFormatter(cfg.formatter, cfg)

    switch (driverName) {
      case 'console':
        return new ConsoleDriver(formatter)
      case 'file': {
        const p = cfg.path ?? 'storage/logs/atlex.log'
        return new FileDriver(join(this.basePath, p), formatter)
      }
      case 'daily': {
        const p = cfg.path ?? 'storage/logs/atlex.log'
        const days = cfg.days ?? 14
        return new DailyDriver(join(this.basePath, p), formatter, days)
      }
      case 'null':
        return new NullDriver()
      default:
        throw new AtlexError(`Driver '${driverName}' not found.`, 'E_LOG_DRIVER_NOT_FOUND')
    }
  }
}
