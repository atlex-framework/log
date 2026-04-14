/**
 * One channel under `logging.channels.*`.
 */
export interface LoggingChannelConfig {
  readonly driver: string
  readonly level?: string
  readonly formatter?: string
  readonly path?: string
  readonly days?: number
  readonly channels?: readonly string[]
  readonly colors?: boolean
}
