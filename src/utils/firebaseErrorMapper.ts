import {
  AppError,
  ErrorCategory,
  ErrorCode,
  getErrorCategory,
  getErrorMessage,
  extractFirebaseErrorCode,
  mapFirebaseError,
} from './errorMessages';

/**
 * Normalize Firebase errors into AppError so UI can show consistent messages.
 */
export const toAppError = (
  error: unknown,
  fallbackCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  category?: ErrorCategory,
  fallbackMessage?: string
): AppError => {
  // Preserve existing AppError instances
  if (error instanceof AppError) {
    return error;
  }

  // Detect firebase error code if present
  const firebaseCode = extractFirebaseErrorCode(error);
  const mappedCode = firebaseCode ? mapFirebaseError(firebaseCode) : fallbackCode;
  const resolvedCategory = category || getErrorCategory(mappedCode);

  // Prefer the original message when it's explicit and no firebase code is present
  const customMessage =
    fallbackMessage ||
    (!firebaseCode && error instanceof Error && error.message ? error.message : undefined);

  return new AppError(mappedCode, resolvedCategory, customMessage || getErrorMessage(mappedCode));
};

/**
 * Convert unknown errors into user-facing messages without throwing.
 */
export const toUserMessage = (error: unknown, fallbackMessage?: string): string => {
  const firebaseCode = extractFirebaseErrorCode(error);
  if (firebaseCode) {
    const code = mapFirebaseError(firebaseCode);
    return getErrorMessage(code);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage || getErrorMessage(ErrorCode.UNKNOWN_ERROR);
};
