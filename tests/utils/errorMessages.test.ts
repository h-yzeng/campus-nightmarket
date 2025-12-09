/**
 * Error Messages Utilities Tests
 * Comprehensive tests for error handling functions
 */
import {
  ErrorCategory,
  ErrorCode,
  getErrorMessage,
  mapFirebaseError,
  extractFirebaseErrorCode,
  formatErrorMessage,
  AppError,
  getErrorCategory,
  isRetryableError,
  shouldLogout,
} from '../../src/utils/errorMessages';

describe('ErrorCategory', () => {
  it('should have all expected categories', () => {
    expect(ErrorCategory.AUTH).toBe('AUTH');
    expect(ErrorCategory.VALIDATION).toBe('VALIDATION');
    expect(ErrorCategory.NETWORK).toBe('NETWORK');
    expect(ErrorCategory.FIRESTORE).toBe('FIRESTORE');
    expect(ErrorCategory.STORAGE).toBe('STORAGE');
    expect(ErrorCategory.ORDER).toBe('ORDER');
    expect(ErrorCategory.LISTING).toBe('LISTING');
    expect(ErrorCategory.PAYMENT).toBe('PAYMENT');
    expect(ErrorCategory.RATE_LIMIT).toBe('RATE_LIMIT');
    expect(ErrorCategory.PERMISSION).toBe('PERMISSION');
    expect(ErrorCategory.UNKNOWN).toBe('UNKNOWN');
  });
});

describe('ErrorCode', () => {
  it('should have auth error codes', () => {
    expect(ErrorCode.AUTH_INVALID_CREDENTIALS).toBe('AUTH_INVALID_CREDENTIALS');
    expect(ErrorCode.AUTH_USER_NOT_FOUND).toBe('AUTH_USER_NOT_FOUND');
    expect(ErrorCode.AUTH_EMAIL_IN_USE).toBe('AUTH_EMAIL_IN_USE');
    expect(ErrorCode.AUTH_WEAK_PASSWORD).toBe('AUTH_WEAK_PASSWORD');
  });

  it('should have validation error codes', () => {
    expect(ErrorCode.VALIDATION_REQUIRED_FIELD).toBe('VALIDATION_REQUIRED_FIELD');
    expect(ErrorCode.VALIDATION_INVALID_EMAIL).toBe('VALIDATION_INVALID_EMAIL');
  });

  it('should have network error codes', () => {
    expect(ErrorCode.NETWORK_OFFLINE).toBe('NETWORK_OFFLINE');
    expect(ErrorCode.NETWORK_TIMEOUT).toBe('NETWORK_TIMEOUT');
  });
});

describe('getErrorMessage', () => {
  it('should return user-friendly message for known error codes', () => {
    expect(getErrorMessage(ErrorCode.AUTH_INVALID_CREDENTIALS)).toBe(
      'Invalid email or password. Please try again.'
    );
    expect(getErrorMessage(ErrorCode.AUTH_EMAIL_IN_USE)).toBe(
      'This email is already registered. Please sign in instead.'
    );
    expect(getErrorMessage(ErrorCode.NETWORK_OFFLINE)).toBe(
      'You appear to be offline. Please check your internet connection.'
    );
  });

  it('should return unknown error message for unrecognized codes', () => {
    expect(getErrorMessage('SOME_UNKNOWN_CODE' as ErrorCode)).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });

  it('should return appropriate messages for all error categories', () => {
    // Auth
    expect(getErrorMessage(ErrorCode.AUTH_TOO_MANY_REQUESTS)).toContain('Too many attempts');

    // Validation
    expect(getErrorMessage(ErrorCode.VALIDATION_REQUIRED_FIELD)).toContain('required fields');

    // Network
    expect(getErrorMessage(ErrorCode.NETWORK_TIMEOUT)).toContain('timed out');

    // Firestore
    expect(getErrorMessage(ErrorCode.FIRESTORE_PERMISSION_DENIED)).toContain('permission');

    // Storage
    expect(getErrorMessage(ErrorCode.STORAGE_UPLOAD_FAILED)).toContain('upload');

    // Order
    expect(getErrorMessage(ErrorCode.ORDER_EMPTY_CART)).toContain('cart is empty');

    // Listing
    expect(getErrorMessage(ErrorCode.LISTING_NOT_FOUND)).toContain('not found');

    // Payment
    expect(getErrorMessage(ErrorCode.PAYMENT_METHOD_REQUIRED)).toContain('payment method');

    // Rate limit
    expect(getErrorMessage(ErrorCode.RATE_LIMIT_EXCEEDED)).toContain('Too many requests');

    // Permission
    expect(getErrorMessage(ErrorCode.PERMISSION_DENIED)).toContain('permission');
  });
});

describe('mapFirebaseError', () => {
  it('should map Firebase auth errors correctly', () => {
    expect(mapFirebaseError('auth/invalid-credential')).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    expect(mapFirebaseError('auth/user-not-found')).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
    expect(mapFirebaseError('auth/wrong-password')).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    expect(mapFirebaseError('auth/email-already-in-use')).toBe(ErrorCode.AUTH_EMAIL_IN_USE);
    expect(mapFirebaseError('auth/weak-password')).toBe(ErrorCode.AUTH_WEAK_PASSWORD);
    expect(mapFirebaseError('auth/network-request-failed')).toBe(ErrorCode.AUTH_NETWORK_FAILED);
    expect(mapFirebaseError('auth/too-many-requests')).toBe(ErrorCode.AUTH_TOO_MANY_REQUESTS);
    expect(mapFirebaseError('auth/invalid-email')).toBe(ErrorCode.AUTH_INVALID_EMAIL);
  });

  it('should map Firebase Firestore errors correctly', () => {
    expect(mapFirebaseError('permission-denied')).toBe(ErrorCode.FIRESTORE_PERMISSION_DENIED);
    expect(mapFirebaseError('not-found')).toBe(ErrorCode.FIRESTORE_NOT_FOUND);
    expect(mapFirebaseError('already-exists')).toBe(ErrorCode.FIRESTORE_ALREADY_EXISTS);
  });

  it('should map Firebase Storage errors correctly', () => {
    expect(mapFirebaseError('storage/unauthorized')).toBe(ErrorCode.STORAGE_PERMISSION_DENIED);
    expect(mapFirebaseError('storage/quota-exceeded')).toBe(ErrorCode.STORAGE_QUOTA_EXCEEDED);
  });

  it('should return UNKNOWN_ERROR for unmapped codes', () => {
    expect(mapFirebaseError('some/unknown-error')).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(mapFirebaseError('')).toBe(ErrorCode.UNKNOWN_ERROR);
  });
});

describe('extractFirebaseErrorCode', () => {
  it('should extract code from error object with code property', () => {
    const error = { code: 'auth/invalid-credential', message: 'Invalid' };
    expect(extractFirebaseErrorCode(error)).toBe('auth/invalid-credential');
  });

  it('should return null for objects without code', () => {
    expect(extractFirebaseErrorCode({ message: 'Error' })).toBe(null);
    expect(extractFirebaseErrorCode({})).toBe(null);
  });

  it('should return null for non-objects', () => {
    expect(extractFirebaseErrorCode(null)).toBe(null);
    expect(extractFirebaseErrorCode(undefined)).toBe(null);
    expect(extractFirebaseErrorCode('string')).toBe(null);
    expect(extractFirebaseErrorCode(123)).toBe(null);
  });

  it('should handle empty code property', () => {
    expect(extractFirebaseErrorCode({ code: '' })).toBe(null);
  });
});

describe('formatErrorMessage', () => {
  it('should return string errors as-is', () => {
    expect(formatErrorMessage('Custom error message')).toBe('Custom error message');
  });

  it('should extract message from Error objects', () => {
    const error = new Error('Something went wrong');
    expect(formatErrorMessage(error)).toBe('Something went wrong');
  });

  it('should map Firebase errors to user-friendly messages', () => {
    const firebaseError = { code: 'auth/invalid-credential', message: 'Firebase error' };
    Object.setPrototypeOf(firebaseError, Error.prototype);
    expect(formatErrorMessage(firebaseError)).toBe('Invalid email or password. Please try again.');
  });

  it('should use fallback message when provided', () => {
    expect(formatErrorMessage({}, 'Custom fallback')).toBe('Custom fallback');
  });

  it('should return unknown error for null/undefined', () => {
    expect(formatErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    expect(formatErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
  });

  it('should truncate very long error messages', () => {
    const longError = new Error('a'.repeat(300));
    expect(formatErrorMessage(longError)).toBe('An unexpected error occurred. Please try again.');
  });
});

describe('AppError', () => {
  it('should create error with code and category', () => {
    const error = new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, ErrorCategory.AUTH);
    expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    expect(error.category).toBe(ErrorCategory.AUTH);
    expect(error.name).toBe('AppError');
    expect(error.message).toBe('Invalid email or password. Please try again.');
  });

  it('should use custom message when provided', () => {
    const error = new AppError(
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      ErrorCategory.AUTH,
      'Custom message'
    );
    expect(error.message).toBe('Custom message');
  });

  it('should be instanceof Error', () => {
    const error = new AppError(ErrorCode.UNKNOWN_ERROR, ErrorCategory.UNKNOWN);
    expect(error instanceof Error).toBe(true);
  });
});

describe('getErrorCategory', () => {
  it('should return AUTH for auth error codes', () => {
    expect(getErrorCategory(ErrorCode.AUTH_INVALID_CREDENTIALS)).toBe(ErrorCategory.AUTH);
    expect(getErrorCategory(ErrorCode.AUTH_EMAIL_IN_USE)).toBe(ErrorCategory.AUTH);
  });

  it('should return VALIDATION for validation error codes', () => {
    expect(getErrorCategory(ErrorCode.VALIDATION_REQUIRED_FIELD)).toBe(ErrorCategory.VALIDATION);
    expect(getErrorCategory(ErrorCode.VALIDATION_INVALID_EMAIL)).toBe(ErrorCategory.VALIDATION);
  });

  it('should return NETWORK for network error codes', () => {
    expect(getErrorCategory(ErrorCode.NETWORK_OFFLINE)).toBe(ErrorCategory.NETWORK);
    expect(getErrorCategory(ErrorCode.NETWORK_TIMEOUT)).toBe(ErrorCategory.NETWORK);
  });

  it('should return FIRESTORE for firestore error codes', () => {
    expect(getErrorCategory(ErrorCode.FIRESTORE_PERMISSION_DENIED)).toBe(ErrorCategory.FIRESTORE);
  });

  it('should return STORAGE for storage error codes', () => {
    expect(getErrorCategory(ErrorCode.STORAGE_UPLOAD_FAILED)).toBe(ErrorCategory.STORAGE);
  });

  it('should return ORDER for order error codes', () => {
    expect(getErrorCategory(ErrorCode.ORDER_CREATE_FAILED)).toBe(ErrorCategory.ORDER);
  });

  it('should return LISTING for listing error codes', () => {
    expect(getErrorCategory(ErrorCode.LISTING_NOT_FOUND)).toBe(ErrorCategory.LISTING);
  });

  it('should return PAYMENT for payment error codes', () => {
    expect(getErrorCategory(ErrorCode.PAYMENT_METHOD_REQUIRED)).toBe(ErrorCategory.PAYMENT);
  });

  it('should return RATE_LIMIT for rate limit error codes', () => {
    expect(getErrorCategory(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(ErrorCategory.RATE_LIMIT);
  });

  it('should return PERMISSION for permission error codes', () => {
    expect(getErrorCategory(ErrorCode.PERMISSION_DENIED)).toBe(ErrorCategory.PERMISSION);
  });

  it('should return UNKNOWN for unknown error codes', () => {
    expect(getErrorCategory(ErrorCode.UNKNOWN_ERROR)).toBe(ErrorCategory.UNKNOWN);
  });
});

describe('isRetryableError', () => {
  it('should return true for network-related errors', () => {
    expect(isRetryableError(ErrorCode.NETWORK_OFFLINE)).toBe(true);
    expect(isRetryableError(ErrorCode.NETWORK_TIMEOUT)).toBe(true);
    expect(isRetryableError(ErrorCode.NETWORK_CONNECTION_FAILED)).toBe(true);
    expect(isRetryableError(ErrorCode.AUTH_NETWORK_FAILED)).toBe(true);
  });

  it('should return false for non-retryable errors', () => {
    expect(isRetryableError(ErrorCode.AUTH_INVALID_CREDENTIALS)).toBe(false);
    expect(isRetryableError(ErrorCode.VALIDATION_INVALID_EMAIL)).toBe(false);
    expect(isRetryableError(ErrorCode.FIRESTORE_PERMISSION_DENIED)).toBe(false);
    expect(isRetryableError(ErrorCode.UNKNOWN_ERROR)).toBe(false);
  });
});

describe('shouldLogout', () => {
  it('should return true for permission-denied errors', () => {
    expect(shouldLogout(ErrorCode.FIRESTORE_PERMISSION_DENIED)).toBe(true);
    expect(shouldLogout(ErrorCode.STORAGE_PERMISSION_DENIED)).toBe(true);
  });

  it('should return false for other errors', () => {
    expect(shouldLogout(ErrorCode.AUTH_INVALID_CREDENTIALS)).toBe(false);
    expect(shouldLogout(ErrorCode.NETWORK_OFFLINE)).toBe(false);
    expect(shouldLogout(ErrorCode.PERMISSION_DENIED)).toBe(false);
    expect(shouldLogout(ErrorCode.UNKNOWN_ERROR)).toBe(false);
  });
});
