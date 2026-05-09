/**
 * Structured Logger for MestreDoPC V7
 *
 * Uses Pino for high-performance structured logging with
 * timestamps, levels, and request tracking.
 */

import { randomUUID } from 'crypto';
import pino from 'pino';

/**
 * Logger configuration
 */
const loggerOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  base: {
    service: 'mestredopc-v7-mcp',
    version: '7.0.0',
  },
};

export function generateCorrelationId(prefix = 'req'): string {
  return `${prefix}-${randomUUID()}`;
}

/**
 * Create a logger instance with optional request ID
 *
 * @param requestId - Optional request identifier for tracing
 * @returns Pino logger instance
 */
export function createLogger(requestId?: string): pino.Logger {
  const baseLogger = pino(loggerOptions);

  if (requestId) {
    return baseLogger.child({ requestId });
  }

  return baseLogger;
}

/**
 * Default logger instance for general use
 */
export const logger = createLogger();

/**
 * Logger middleware for adding request IDs to context
 *
 * @returns Middleware function that adds requestId to child logger
 */
export function requestLoggerMiddleware() {
  return (req: any, res: any, next: () => void) => {
    const requestId = generateCorrelationId();
    (req as any).logger = createLogger(requestId);
    res.setHeader('X-Request-ID', requestId);
    next();
  };
}
