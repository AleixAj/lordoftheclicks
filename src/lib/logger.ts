/**
 * Lightweight logger abstraction.
 *
 * Right now it just proxies to `console`, but having a single entry point
 * means we can swap to Sentry, Datadog or a custom backend in one place
 * without touching call sites.
 *
 * Usage:
 *   logger.info('Player travelled', { from, to });
 *   logger.error('Save failed', { error });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

const isDev = import.meta.env.DEV;

function emit(level: LogLevel, message: string, context?: LogContext): void {
  if (!isDev && level === 'debug') return;

  const payload = context ? [message, context] : [message];
  switch (level) {
    case 'debug':
      console.debug(...payload);
      break;
    case 'info':
      console.info(...payload);
      break;
    case 'warn':
      console.warn(...payload);
      break;
    case 'error':
      console.error(...payload);
      break;
  }

  // TODO: plug Sentry / Datadog / posthog here when ready.
}

export const logger: Logger = {
  debug: (m, c) => emit('debug', m, c),
  info: (m, c) => emit('info', m, c),
  warn: (m, c) => emit('warn', m, c),
  error: (m, c) => emit('error', m, c),
};
