/**
 * Logger utility that conditionally logs based on environment
 * In production, only errors are logged and sent to Sentry
 * In development, all logs are shown
 */

import * as Sentry from '@sentry/react';

// Safely detect development environment (works in Node/Jest and Vite/browser without import.meta)
let isDevelopment = false;
try {
  const maybeProcess =
    typeof globalThis !== 'undefined'
      ? (globalThis as { process?: { env?: { NODE_ENV?: unknown } } }).process
      : undefined;

  const nodeEnv =
    typeof maybeProcess?.env?.NODE_ENV === 'string' ? maybeProcess.env.NODE_ENV : undefined;

  if (nodeEnv) {
    isDevelopment = nodeEnv === 'development' || nodeEnv === 'test';
  } else {
    // Fallback for browser globals if process is not available
    const globalEnv = (globalThis as Record<string, unknown>).__ENV__ as
      | 'development'
      | 'test'
      | 'production'
      | undefined;
    isDevelopment = globalEnv === 'development' || globalEnv === 'test';
  }
} catch {
  isDevelopment = false;
}

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, ...args: unknown[]): void {
    if (isDevelopment) {
      console[level](...args);
    } else if (level === 'error' || level === 'warn') {
      // In production, only log errors and warnings
      console[level](...args);

      // Send to Sentry in production
      if (level === 'error') {
        // If first argument is an Error object, capture it
        const firstArg = args[0];
        if (firstArg instanceof Error) {
          Sentry.captureException(firstArg, {
            extra: { additionalContext: args.slice(1) },
          });
        } else {
          // Otherwise capture as a message
          Sentry.captureMessage(args.join(' '), 'error');
        }
      } else if (level === 'warn') {
        Sentry.captureMessage(args.join(' '), 'warning');
      }
    }
  }

  debug(...args: unknown[]): void {
    this.log('debug', '[DEBUG]', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', '[INFO]', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', '[WARN]', ...args);
  }

  error(...args: unknown[]): void {
    this.log('error', '[ERROR]', ...args);
  }

  // For general logging
  general(...args: unknown[]): void {
    this.log('log', ...args);
  }
}

export const logger = new Logger();
