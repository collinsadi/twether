import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

// Custom JSON stringifier that handles circular references
const safeStringify = (obj: any): string => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  });
};

// Sanitize error objects to remove circular references
const sanitizeError = (error: any): any => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as any).cause && { cause: (error as any).cause }
    };
  }
  return error;
};

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        // Sanitize meta objects to handle circular references
        const sanitizedMeta = Object.keys(meta).reduce((acc, key) => {
            acc[key] = sanitizeError(meta[key]);
            return acc;
        }, {} as any);
        
        const metaString = Object.keys(sanitizedMeta).length ? safeStringify(sanitizedMeta) : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    })
);

// Create the Winston logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console(),  // Logs to console
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),  // Logs errors to a file
        new winston.transports.File({ filename: 'logs/combined.log' }) // Logs all levels to a file
    ]
});

// Asynchronous logging function (similar to Logtail)
export const logAsync = async (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: object
) => {
    logger.log(level, message, context);
};

// Safe error logging utility
export const logError = (message: string, error?: any, context?: any) => {
    const errorInfo = error ? {
        name: error.name || 'Unknown Error',
        message: error.message || String(error),
        stack: error.stack,
        ...(error.cause && { cause: error.cause })
    } : undefined;
    
    logger.error(message, { error: errorInfo, ...context });
};

// Safe error logging with async support
export const logErrorAsync = async (message: string, error?: any, context?: any) => {
    logError(message, error, context);
};

export default logger;
