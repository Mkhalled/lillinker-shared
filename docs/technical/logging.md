# Logging Configuration

## Overview

Our application uses Winston for logging with a custom configuration that adapts to different environments. The logging system provides structured logging with proper error handling and context.

## Environment-Specific Configuration

### Development

- Log level: `debug`
- Detailed console output with pretty-printed JSON
- No file logging
- Full stack traces for errors

### Test

- Log level: `warn`
- Minimal console output
- No file logging
- Error details included

### Production

- Log level: `info`
- Concise console output
- File logging enabled:
  - `logs/error.log`: Error-level logs only
  - `logs/combined.log`: All logs
- Log rotation:
  - Max file size: 5MB
  - Max files: 5
  - Compressed archives

## Usage

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Info level
logger.info('User action completed', { userId: '123', action: 'login' });

// Debug level
logger.debug('Processing request', { requestId: 'abc', method: 'POST' });

// Warning level
logger.warn('Rate limit approaching', { userId: '123', requests: 95 });

// Error level
logger.error('Database connection failed', new Error('Connection timeout'));
```

### Request-Scoped Logging

```typescript
import { RequestLogger } from '@/lib/logger';

// In your API route
export async function POST(req: Request) {
  const requestLogger = new RequestLogger(req);

  try {
    requestLogger.info('Processing request');
    // ... your code ...
  } catch (error) {
    requestLogger.error('Request failed', error as Error);
    throw error;
  }
}
```

### Adding Context

```typescript
const loggerWithContext = requestLogger.withContext({
  userId: '123',
  companyId: '456',
});

loggerWithContext.info('User action', { action: 'update' });
```

## Best Practices

1. **Use Appropriate Log Levels**

   - `error`: For errors that need immediate attention
   - `warn`: For potentially harmful situations
   - `info`: For important business events
   - `debug`: For detailed debugging information

2. **Include Context**

   - Always include relevant context in log messages
   - Use structured data instead of string concatenation
   - Include request IDs for request tracing

3. **Error Handling**

   - Always pass Error objects to error logs
   - Include stack traces in development
   - Sanitize sensitive data before logging

4. **Performance**
   - Use appropriate log levels to control verbosity
   - Avoid logging large objects
   - Use log rotation in production

## Configuration

The logging configuration is defined in `src/lib/logger.ts`. Key settings:

```typescript
const logger = createLogger({
  level: isDevelopment ? 'debug' : isTest ? 'warn' : 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: {
    service: 'lillinker-platform',
    environment: process.env.NODE_ENV,
  },
});
```

## Monitoring

In production, logs are written to files and can be collected by your logging infrastructure (e.g., ELK Stack, CloudWatch, etc.). The structured JSON format makes it easy to parse and analyze logs.
