# @atlex/log

> Multi-channel structured logging with console, file, and daily rotation drivers.

[![npm](https://img.shields.io/npm/v/@atlex/log.svg?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@atlex/log)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-7c3aed.svg?style=flat-square)](https://www.typescriptlang.org/)

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=flat-square&logo=buy-me-a-coffee)](https://buymeacoffee.com/khamazaspyan)

## Installation

```bash
npm install @atlex/log
# or
yarn add @atlex/log
```

## Quick Start

```typescript
import { LogManager } from '@atlex/log'
import { ConsoleDriver } from '@atlex/log'

const manager = new LogManager()
manager.channel('default', new ConsoleDriver())

const logger = manager.channel('default')

logger.info('Application started')
logger.error('Something went wrong', { error: 'details' })
```

## Features

- **Multi-Channel Logging**: Configure different drivers for different channels
- **Structured Logging**: Log with contextual data and metadata
- **Multiple Log Levels**: Debug, info, notice, warning, error, critical, alert, emergency
- **File Rotation**: Automatic daily log file rotation
- **Multiple Drivers**: Console, file, daily rotation, stack, fanout, and null drivers
- **Custom Formatters**: Line, JSON, and pretty-print formatters
- **Context Preservation**: Attach context to all logs within a scope
- **Async Flushing**: Flush pending logs before shutdown

## Basic Logging

### Log Levels

```typescript
import { LogManager } from '@atlex/log'
import { ConsoleDriver } from '@atlex/log'

const manager = new LogManager()
const logger = manager.channel('default', new ConsoleDriver())

// Different log levels
logger.debug('Debug information', { userId: 123 })
logger.info('User logged in', { email: 'user@example.com' })
logger.notice('Configuration reloaded')
logger.warning('Cache miss for key', { key: 'user:456' })
logger.error('Database query failed', { query: 'SELECT ...', error: 'Connection lost' })
logger.critical('Payment processing failed', { orderId: 'ORD-123' })
logger.alert('Security: Suspicious login attempt', { ip: '192.168.1.1' })
logger.emergency('System is shutting down', { reason: 'OOM' })
```

### Generic Logging

```typescript
import { LogLevel } from '@atlex/log'

const logger =
  /* ... */

  // Log at a specific level
  logger.log(LogLevel.Warning, 'Custom message', { custom: 'data' })
```

## Console Driver

```typescript
import { LogManager } from '@atlex/log'
import { ConsoleDriver } from '@atlex/log'
import { LineFormatter, PrettyFormatter, JsonFormatter } from '@atlex/log'

const manager = new LogManager()

// With default formatter (LineFormatter)
const driver = new ConsoleDriver()

// With custom formatter
const prettyDriver = new ConsoleDriver({
  formatter: new PrettyFormatter(),
})

const jsonDriver = new ConsoleDriver({
  formatter: new JsonFormatter(),
})

manager.channel('default', driver)
manager.channel('json-logs', jsonDriver)
```

## File Driver

```typescript
import { LogManager } from '@atlex/log'
import { FileDriver } from '@atlex/log'
import path from 'path'

const manager = new LogManager()

const fileDriver = new FileDriver({
  path: path.join(__dirname, '../logs/application.log'),
  mode: 'append', // or 'truncate'
})

manager.channel('file', fileDriver)
const logger = manager.channel('file')

logger.info('This will be written to file')
```

## Daily Driver

```typescript
import { LogManager } from '@atlex/log'
import { DailyDriver } from '@atlex/log'
import path from 'path'

const manager = new LogManager()

// Automatically creates logs/application-2024-03-15.log
const dailyDriver = new DailyDriver({
  directory: path.join(__dirname, '../logs'),
  filename: 'application',
  days: 7, // Keep logs for 7 days
})

manager.channel('daily', dailyDriver)
const logger = manager.channel('daily')

logger.info('Logged to daily file')
```

## Stack Driver

Stack driver sends logs to multiple drivers simultaneously:

```typescript
import { LogManager } from '@atlex/log'
import { StackDriver, ConsoleDriver, FileDriver } from '@atlex/log'
import path from 'path'

const manager = new LogManager()

const stackDriver = new StackDriver([
  new ConsoleDriver(),
  new FileDriver({
    path: path.join(__dirname, '../logs/app.log'),
  }),
])

manager.channel('stack', stackDriver)
const logger = manager.channel('stack')

// Logs to both console and file
logger.info('Log to all drivers')
```

## Fanout Logger Driver

```typescript
import { LogManager } from '@atlex/log'
import { FanoutLoggerDriver, ConsoleDriver } from '@atlex/log'

const manager = new LogManager()

// Route different channels through a fanout driver
const fanoutDriver = new FanoutLoggerDriver({
  default: new ConsoleDriver(),
  error: new ConsoleDriver(),
})

manager.channel('fanout', fanoutDriver)
```

## Context Management

```typescript
import { LogManager } from '@atlex/log'
import { ConsoleDriver } from '@atlex/log'

const manager = new LogManager()
const logger = manager.channel('default', new ConsoleDriver())

// Add context to logger instance
const contextLogger = logger.withContext({
  requestId: 'req-12345',
  userId: 'user-67890',
})

// All logs from this instance include the context
contextLogger.info('Processing request')
contextLogger.error('Request failed')

// Original logger is unaffected
logger.info('This has no context')
```

## Formatters

### Line Formatter (Default)

```typescript
import { LineFormatter } from '@atlex/log'

const formatter = new LineFormatter()

// Output: [2024-03-15 14:30:45] INFO - User logged in
```

### JSON Formatter

```typescript
import { JsonFormatter } from '@atlex/log'

const formatter = new JsonFormatter()

// Output: {"timestamp":"2024-03-15T14:30:45.000Z","level":"info","message":"User logged in"}
```

### Pretty Formatter

```typescript
import { PrettyFormatter } from '@atlex/log'

const formatter = new PrettyFormatter()

// Output: Colorized, formatted output with context
```

## Advanced Configuration

### Multi-Channel Setup

```typescript
import { LogManager, LogLevel } from '@atlex/log'
import { ConsoleDriver, FileDriver, DailyDriver } from '@atlex/log'
import { LineFormatter, JsonFormatter } from '@atlex/log'
import path from 'path'

const manager = new LogManager()

// Console channel for development
manager.channel(
  'default',
  new ConsoleDriver({
    formatter: new LineFormatter(),
  }),
)

// File channel for application logs
manager.channel(
  'app',
  new FileDriver({
    path: path.join(__dirname, '../logs/app.log'),
  }),
)

// Daily channel for archival
manager.channel(
  'daily',
  new DailyDriver({
    directory: path.join(__dirname, '../logs'),
    filename: 'application',
    days: 30,
  }),
)

// JSON channel for log aggregation services
manager.channel(
  'json',
  new ConsoleDriver({
    formatter: new JsonFormatter(),
  }),
)

// Error-only channel
const errorLogger = manager.channel('default').withContext({ channel: 'errors' })

export const logger = manager.channel('default')
export const fileLogger = manager.channel('app')
export const jsonLogger = manager.channel('json')
```

### Using LogManager in Services

```typescript
import { LogManager } from '@atlex/log'
import { ConsoleDriver } from '@atlex/log'

class UserService {
  constructor(private logger: Logger) {}

  async createUser(email: string) {
    this.logger.info('Creating user', { email })

    try {
      // Create user logic
      this.logger.info('User created', { email, userId: 'user-123' })
    } catch (error) {
      this.logger.error('Failed to create user', {
        email,
        error: error.message,
      })
      throw error
    }
  }
}

// Dependency injection
const manager = new LogManager()
const logger = manager.channel('default', new ConsoleDriver())

const userService = new UserService(logger)
```

## Null Driver

```typescript
import { LogManager } from '@atlex/log'
import { NullDriver } from '@atlex/log'

const manager = new LogManager()

// Disable logging for a channel
manager.channel('disabled', new NullDriver())
```

## Flushing Logs

```typescript
import { LogManager } from '@atlex/log'
import { ConsoleDriver } from '@atlex/log'

const manager = new LogManager()
const logger = manager.channel('default', new ConsoleDriver())

logger.info('Important message')

// Flush pending logs before exit
await logger.flush()

process.exit(0)
```

## Complete Application Example

```typescript
import { LogManager, LogLevel } from '@atlex/log'
import { ConsoleDriver, DailyDriver, StackDriver, LineFormatter, JsonFormatter } from '@atlex/log'
import path from 'path'

class Application {
  private manager: LogManager
  private logger: Logger
  private errorLogger: Logger

  constructor() {
    this.manager = new LogManager()
    this.setupLogging()
  }

  private setupLogging() {
    const env = process.env.NODE_ENV || 'development'

    // Daily file logging
    const dailyDriver = new DailyDriver({
      directory: path.join(__dirname, '../logs'),
      filename: 'application',
      days: 30,
    })

    // Console logging (always on)
    const consoleDriver = new ConsoleDriver({
      formatter: env === 'production' ? new JsonFormatter() : new LineFormatter(),
    })

    // Stack: both console and file
    const stackDriver = new StackDriver([consoleDriver, dailyDriver])

    this.manager.channel('default', stackDriver)
    this.manager.channel(
      'error',
      new StackDriver([
        consoleDriver,
        new DailyDriver({
          directory: path.join(__dirname, '../logs'),
          filename: 'error',
          days: 7,
        }),
      ]),
    )

    this.logger = this.manager.channel('default')
    this.errorLogger = this.manager.channel('error')
  }

  async start() {
    this.logger.info('Application starting', {
      env: process.env.NODE_ENV,
      version: '1.0.0',
    })

    try {
      // Application logic
      this.logger.info('Application ready', {
        port: 3000,
      })
    } catch (error) {
      this.errorLogger.critical('Fatal error', {
        error: error.message,
        stack: error.stack,
      })
      await this.logger.flush()
      process.exit(1)
    }
  }

  async shutdown() {
    this.logger.info('Application shutting down')
    await this.logger.flush()
  }
}

// Bootstrap
const app = new Application()
app.start()

process.on('SIGTERM', () => app.shutdown())
process.on('SIGINT', () => app.shutdown())
```

## API Overview

### LogManager

| Method                   | Description                 |
| ------------------------ | --------------------------- |
| `channel(name, driver?)` | Get or set a logger channel |
| `extend(name, driver)`   | Add a new logging channel   |

### Logger

| Method                          | Description                |
| ------------------------------- | -------------------------- |
| `debug(message, context?)`      | Log debug message          |
| `info(message, context?)`       | Log info message           |
| `notice(message, context?)`     | Log notice message         |
| `warning(message, context?)`    | Log warning message        |
| `error(message, context?)`      | Log error message          |
| `critical(message, context?)`   | Log critical message       |
| `alert(message, context?)`      | Log alert message          |
| `emergency(message, context?)`  | Log emergency message      |
| `log(level, message, context?)` | Log at specific level      |
| `withContext(context)`          | Create logger with context |
| `flush()`                       | Flush pending logs         |

### Drivers

| Driver               | Description                      |
| -------------------- | -------------------------------- |
| `ConsoleDriver`      | Output to console/stdout         |
| `FileDriver`         | Write to a single file           |
| `DailyDriver`        | Rotate logs daily                |
| `StackDriver`        | Send to multiple drivers         |
| `NullDriver`         | Discard all logs                 |
| `FanoutLoggerDriver` | Route logs to different channels |

### Formatters

| Formatter         | Description                |
| ----------------- | -------------------------- |
| `LineFormatter`   | Human-readable line format |
| `JsonFormatter`   | Structured JSON format     |
| `PrettyFormatter` | Colorized pretty format    |

## Documentation

For complete documentation, visit [https://atlex.dev/guide/log](https://atlex.dev/guide/log)

## License

MIT
