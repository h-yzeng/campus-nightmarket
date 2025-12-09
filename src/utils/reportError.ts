import * as Sentry from '@sentry/react';
import { toast } from 'sonner';
import { toUserMessage } from './firebaseErrorMapper';
import { logger } from './logger';

/**
 * Centralized error reporter that logs, captures to Sentry, and surfaces a toast-friendly message.
 */
export const reportError = (error: unknown, fallbackMessage?: string) => {
  const message = toUserMessage(error, fallbackMessage);
  logger.error(error);
  Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  toast.error(message);
  return message;
};
