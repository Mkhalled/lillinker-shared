import { NextRequest } from 'next/server';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

// Environment-specific configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

// Create the logger configuration
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
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, ...meta }) => {
          // In development, show more detailed logs
          if (isDevelopment) {
            return `${timestamp} ${level}: ${message} ${JSON.stringify(meta, null, 2)}`;
          }
          // In production, keep logs concise
          return `${timestamp} ${level}: ${message} ${JSON.stringify(meta)}`;
        })
      ),
    }),
  ],
});

// Add file transports in production
if (isProduction) {
  logger.add(
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  logger.add(
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Request-scoped logger class
export class RequestLogger {
  protected context: Record<string, unknown>;

  constructor(request: NextRequest) {
    this.context = {
      requestId: request.headers.get('x-request-id'),
      path: request.url,
      method: request.method,
      environment: process.env.NODE_ENV || 'development',
    };
  }

  withContext(additionalContext: Record<string, unknown>) {
    return new RequestLoggerWithContext({
      ...this.context,
      ...additionalContext,
    });
  }

  error(message: string, error: Error, metadata?: Record<string, unknown>) {
    logger.error(message, {
      ...this.context,
      ...metadata,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    logger.warn(message, { ...this.context, ...metadata });
  }

  info(message: string, metadata?: Record<string, unknown>) {
    logger.info(message, { ...this.context, ...metadata });
  }

  http(message: string, metadata?: Record<string, unknown>) {
    logger.http(message, { ...this.context, ...metadata });
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    logger.debug(message, { ...this.context, ...metadata });
  }
}

// Extended request logger with additional context
class RequestLoggerWithContext extends RequestLogger {
  constructor(context: Record<string, unknown>) {
    super({} as NextRequest);
    this.context = context;
  }
}

export { logger };
