/**
 * Structured Logger for MestreDoPC V7
 * 
 * Uses Pino for high-performance structured logging with
 * timestamps, levels, and request tracking.
 */

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

/**
 * Create a logger instance with optional request ID
 * 
 * @param requestId - Optional request identifier for tracing
 * @returns Pino logger instance
 * 
 * @example
 * const logger = createLogger('req-123');
 * logger.info('Processing command');
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
 * 
 * @example
 * app.use(requestLoggerMiddleware());
 */
export function requestLoggerMiddleware() {
  return (req: any, res: any, next: () => void) => {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    (req as any).logger = createLogger(requestId);
    res.setHeader('X-Request-ID', requestId);
    next();
  };
}
