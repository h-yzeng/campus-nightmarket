/**
 * Centralized Error Message System
 * Provides standardized, user-friendly error messages for common scenarios
 */

// Error categories for better organization
export const ErrorCategory = {
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  FIRESTORE: 'FIRESTORE',
  STORAGE: 'STORAGE',
  ORDER: 'ORDER',
  LISTING: 'LISTING',
  PAYMENT: 'PAYMENT',
  RATE_LIMIT: 'RATE_LIMIT',
  PERMISSION: 'PERMISSION',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory];

// Error codes for specific scenarios
export const ErrorCode = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS : 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND : 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_IN_USE : 'AUTH_EMAIL_IN_USE',
  AUTH_WEAK_PASSWORD : 'AUTH_WEAK_PASSWORD',
  AUTH_NETWORK_FAILED : 'AUTH_NETWORK_FAILED',
  AUTH_TOO_MANY_REQUESTS : 'AUTH_TOO_MANY_REQUESTS',
  AUTH_INVALID_EMAIL : 'AUTH_INVALID_EMAIL',

  // Validation errors
  VALIDATION_REQUIRED_FIELD : 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL : 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_STUDENT_ID : 'VALIDATION_INVALID_STUDENT_ID',
  VALIDATION_INVALID_PASSWORD : 'VALIDATION_INVALID_PASSWORD',
  VALIDATION_PASSWORDS_MISMATCH : 'VALIDATION_PASSWORDS_MISMATCH',
  VALIDATION_IMAGE_TOO_LARGE : 'VALIDATION_IMAGE_TOO_LARGE',
  VALIDATION_INVALID_FILE_TYPE : 'VALIDATION_INVALID_FILE_TYPE',

  // Network errors
  NETWORK_OFFLINE : 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT : 'NETWORK_TIMEOUT',
  NETWORK_CONNECTION_FAILED : 'NETWORK_CONNECTION_FAILED',

  // Firestore errors
  FIRESTORE_PERMISSION_DENIED : 'FIRESTORE_PERMISSION_DENIED',
  FIRESTORE_NOT_FOUND : 'FIRESTORE_NOT_FOUND',
  FIRESTORE_ALREADY_EXISTS : 'FIRESTORE_ALREADY_EXISTS',
  FIRESTORE_WRITE_FAILED : 'FIRESTORE_WRITE_FAILED',

  // Storage errors
  STORAGE_UPLOAD_FAILED : 'STORAGE_UPLOAD_FAILED',
  STORAGE_PERMISSION_DENIED : 'STORAGE_PERMISSION_DENIED',
  STORAGE_QUOTA_EXCEEDED : 'STORAGE_QUOTA_EXCEEDED',

  // Order errors
  ORDER_CREATE_FAILED : 'ORDER_CREATE_FAILED',
  ORDER_NOT_FOUND : 'ORDER_NOT_FOUND',
  ORDER_CANCEL_FAILED : 'ORDER_CANCEL_FAILED',
  ORDER_UPDATE_FAILED : 'ORDER_UPDATE_FAILED',
  ORDER_EMPTY_CART : 'ORDER_EMPTY_CART',

  // Listing errors
  LISTING_CREATE_FAILED : 'LISTING_CREATE_FAILED',
  LISTING_UPDATE_FAILED : 'LISTING_UPDATE_FAILED',
  LISTING_DELETE_FAILED : 'LISTING_DELETE_FAILED',
  LISTING_NOT_FOUND : 'LISTING_NOT_FOUND',

  // Payment errors
  PAYMENT_METHOD_REQUIRED : 'PAYMENT_METHOD_REQUIRED',
  PAYMENT_INFO_MISSING : 'PAYMENT_INFO_MISSING',

  // Rate limit errors
  RATE_LIMIT_EXCEEDED : 'RATE_LIMIT_EXCEEDED',

  // Permission errors
  PERMISSION_DENIED : 'PERMISSION_DENIED',
  PERMISSION_NOT_OWNER : 'PERMISSION_NOT_OWNER',

  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

// User-friendly error messages
const errorMessages: Record<string, string> = {
  // Auth
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'No account found with this email address.',
  [ErrorCode.AUTH_EMAIL_IN_USE]: 'This email is already registered. Please sign in instead.',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Password must be at least 8 characters with uppercase, lowercase, and a number.',
  [ErrorCode.AUTH_NETWORK_FAILED]: 'Network error. Please check your connection and try again.',
  [ErrorCode.AUTH_TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',
  [ErrorCode.AUTH_INVALID_EMAIL]: 'Please enter a valid @hawk.illinoistech.edu email address.',

  // Validation
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'Please fill out all required fields.',
  [ErrorCode.VALIDATION_INVALID_EMAIL]: 'Please use your @hawk.illinoistech.edu email address.',
  [ErrorCode.VALIDATION_INVALID_STUDENT_ID]: 'Student ID must start with "A" followed by numbers.',
  [ErrorCode.VALIDATION_INVALID_PASSWORD]: 'Password must be 8+ characters with uppercase, lowercase, and number.',
  [ErrorCode.VALIDATION_PASSWORDS_MISMATCH]: 'Passwords do not match.',
  [ErrorCode.VALIDATION_IMAGE_TOO_LARGE]: 'Image must be less than 5MB.',
  [ErrorCode.VALIDATION_INVALID_FILE_TYPE]: 'Please select a valid image file (PNG, JPG, JPEG).',

  // Network
  [ErrorCode.NETWORK_OFFLINE]: 'You appear to be offline. Please check your internet connection.',
  [ErrorCode.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCode.NETWORK_CONNECTION_FAILED]: 'Unable to connect. Please check your internet connection.',

  // Firestore
  [ErrorCode.FIRESTORE_PERMISSION_DENIED]: 'You don\'t have permission to perform this action.',
  [ErrorCode.FIRESTORE_NOT_FOUND]: 'The requested item was not found.',
  [ErrorCode.FIRESTORE_ALREADY_EXISTS]: 'This item already exists.',
  [ErrorCode.FIRESTORE_WRITE_FAILED]: 'Failed to save changes. Please try again.',

  // Storage
  [ErrorCode.STORAGE_UPLOAD_FAILED]: 'Failed to upload image. Please try again.',
  [ErrorCode.STORAGE_PERMISSION_DENIED]: 'You don\'t have permission to upload files.',
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded. Please contact support.',

  // Order
  [ErrorCode.ORDER_CREATE_FAILED]: 'Failed to place order. Please try again.',
  [ErrorCode.ORDER_NOT_FOUND]: 'Order not found.',
  [ErrorCode.ORDER_CANCEL_FAILED]: 'Failed to cancel order. Please try again.',
  [ErrorCode.ORDER_UPDATE_FAILED]: 'Failed to update order. Please try again.',
  [ErrorCode.ORDER_EMPTY_CART]: 'Your cart is empty. Add items before checking out.',

  // Listing
  [ErrorCode.LISTING_CREATE_FAILED]: 'Failed to create listing. Please try again.',
  [ErrorCode.LISTING_UPDATE_FAILED]: 'Failed to update listing. Please try again.',
  [ErrorCode.LISTING_DELETE_FAILED]: 'Failed to delete listing. Please try again.',
  [ErrorCode.LISTING_NOT_FOUND]: 'Listing not found.',

  // Payment
  [ErrorCode.PAYMENT_METHOD_REQUIRED]: 'Please select a payment method.',
  [ErrorCode.PAYMENT_INFO_MISSING]: 'Payment information is missing. Please update your profile.',

  // Rate limit
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',

  // Permission
  [ErrorCode.PERMISSION_DENIED]: 'You don\'t have permission to perform this action.',
  [ErrorCode.PERMISSION_NOT_OWNER]: 'You can only modify your own items.',

  // Unknown
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

// Firebase error code mapping to our error codes
const firebaseErrorMapping: Record<string, ErrorCode> = {
  // Auth errors
  'auth/invalid-credential': ErrorCode.AUTH_INVALID_CREDENTIALS,
  'auth/user-not-found': ErrorCode.AUTH_USER_NOT_FOUND,
  'auth/wrong-password': ErrorCode.AUTH_INVALID_CREDENTIALS,
  'auth/email-already-in-use': ErrorCode.AUTH_EMAIL_IN_USE,
  'auth/weak-password': ErrorCode.AUTH_WEAK_PASSWORD,
  'auth/network-request-failed': ErrorCode.AUTH_NETWORK_FAILED,
  'auth/too-many-requests': ErrorCode.AUTH_TOO_MANY_REQUESTS,
  'auth/invalid-email': ErrorCode.AUTH_INVALID_EMAIL,

  // Firestore errors
  'permission-denied': ErrorCode.FIRESTORE_PERMISSION_DENIED,
  'not-found': ErrorCode.FIRESTORE_NOT_FOUND,
  'already-exists': ErrorCode.FIRESTORE_ALREADY_EXISTS,

  // Storage errors
  'storage/unauthorized': ErrorCode.STORAGE_PERMISSION_DENIED,
  'storage/quota-exceeded': ErrorCode.STORAGE_QUOTA_EXCEEDED,
};

/**
 * Get user-friendly error message from error code
 */
export const getErrorMessage = (code: ErrorCode): string => {
  return errorMessages[code] || errorMessages[ErrorCode.UNKNOWN_ERROR];
};

/**
 * Map Firebase error to our error code
 */
export const mapFirebaseError = (firebaseCode: string): ErrorCode => {
  return firebaseErrorMapping[firebaseCode] || ErrorCode.UNKNOWN_ERROR;
};

/**
 * Extract error code from Firebase error
 */
export const extractFirebaseErrorCode = (error: unknown): string | null => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as { code?: string }).code || null;
  }
  return null;
};

/**
 * Format error for user display
 * Converts any error into a user-friendly message
 */
export const formatErrorMessage = (error: unknown, fallbackMessage?: string): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object
  if (error instanceof Error) {
    // Check for Firebase error code
    const firebaseCode = extractFirebaseErrorCode(error);
    if (firebaseCode) {
      const errorCode = mapFirebaseError(firebaseCode);
      return getErrorMessage(errorCode);
    }

    // Return error message if it's user-friendly
    if (error.message && error.message.length < 200) {
      return error.message;
    }
  }

  // Return fallback or unknown error
  return fallbackMessage || getErrorMessage(ErrorCode.UNKNOWN_ERROR);
};

/**
 * Create a custom error with code and category
 */
export class AppError extends Error {
  code: ErrorCode;
  category: ErrorCategory;

  constructor(code: ErrorCode, category: ErrorCategory, customMessage?: string) {
    super(customMessage || getErrorMessage(code));
    this.code = code;
    this.category = category;
    this.name = 'AppError';
  }
}

/**
 * Determine error category from error code
 */
export const getErrorCategory = (code: ErrorCode): ErrorCategory => {
  const codeStr = code.toString();

  if (codeStr.startsWith('AUTH_')) return ErrorCategory.AUTH;
  if (codeStr.startsWith('VALIDATION_')) return ErrorCategory.VALIDATION;
  if (codeStr.startsWith('NETWORK_')) return ErrorCategory.NETWORK;
  if (codeStr.startsWith('FIRESTORE_')) return ErrorCategory.FIRESTORE;
  if (codeStr.startsWith('STORAGE_')) return ErrorCategory.STORAGE;
  if (codeStr.startsWith('ORDER_')) return ErrorCategory.ORDER;
  if (codeStr.startsWith('LISTING_')) return ErrorCategory.LISTING;
  if (codeStr.startsWith('PAYMENT_')) return ErrorCategory.PAYMENT;
  if (codeStr.startsWith('RATE_LIMIT_')) return ErrorCategory.RATE_LIMIT;
  if (codeStr.startsWith('PERMISSION_')) return ErrorCategory.PERMISSION;

  return ErrorCategory.UNKNOWN;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (code: ErrorCode): boolean => {
  const retryableCodes: ErrorCode[] = [
    ErrorCode.NETWORK_OFFLINE,
    ErrorCode.NETWORK_TIMEOUT,
    ErrorCode.NETWORK_CONNECTION_FAILED,
    ErrorCode.AUTH_NETWORK_FAILED,
  ];

  return retryableCodes.includes(code);
};

/**
 * Check if error should trigger a logout
 */
export const shouldLogout = (code: ErrorCode): boolean => {
  const logoutCodes: ErrorCode[] = [
    ErrorCode.FIRESTORE_PERMISSION_DENIED,
    ErrorCode.STORAGE_PERMISSION_DENIED,
  ];

  return logoutCodes.includes(code);
};
