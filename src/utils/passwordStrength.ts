/**
 * Password Strength Validation Utility
 *
 * Provides comprehensive password validation including:
 * - Common password detection
 * - Sequential character detection
 * - Repeated character detection
 * - Email similarity detection
 */

// Common weak passwords that should be rejected
const COMMON_PASSWORDS = [
  'password',
  'Password',
  'PASSWORD',
  'qwerty',
  'Qwerty',
  'QWERTY',
  'admin',
  'Admin',
  'ADMIN',
  'welcome',
  'Welcome',
  'WELCOME',
  'login',
  'Login',
  'LOGIN',
  'letmein',
  'Letmein',
  'LETMEIN',
  'monkey',
  'Monkey',
  'MONKEY',
  'dragon',
  'Dragon',
  'DRAGON',
  'master',
  'Master',
  'MASTER',
  'sunshine',
  'Sunshine',
  'SUNSHINE',
  'princess',
  'Princess',
  'PRINCESS',
  'football',
  'Football',
  'FOOTBALL',
  'iloveyou',
  'Iloveyou',
  'ILOVEYOU',
  'trustno1',
  'Trustno1',
  'TRUSTNO1',
  'abc123',
  'Abc123',
  'ABC123',
];

// Sequential patterns to detect
const SEQUENTIAL_PATTERNS = [
  '123',
  '234',
  '345',
  '456',
  '567',
  '678',
  '789',
  '890',
  'abc',
  'bcd',
  'cde',
  'def',
  'efg',
  'fgh',
  'ghi',
  'hij',
  'ijk',
  'jkl',
  'klm',
  'lmn',
  'mno',
  'nop',
  'opq',
  'pqr',
  'qrs',
  'rst',
  'stu',
  'tuv',
  'uvw',
  'vwx',
  'wxy',
  'xyz',
];

export interface PasswordStrengthResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
}

/**
 * Check if password contains common weak passwords
 */
const containsCommonPassword = (password: string): boolean => {
  const lowerPassword = password.toLowerCase();
  return COMMON_PASSWORDS.some((common) => lowerPassword.includes(common.toLowerCase()));
};

/**
 * Check if password contains sequential characters
 */
const containsSequentialChars = (password: string): boolean => {
  const lowerPassword = password.toLowerCase();
  return SEQUENTIAL_PATTERNS.some((pattern) => lowerPassword.includes(pattern));
};

/**
 * Check if password has excessive repeated characters
 */
const hasExcessiveRepeats = (password: string): boolean => {
  // Check for 3+ repeated characters in a row (e.g., "aaa", "111")
  return /(.)\1{2,}/.test(password);
};

/**
 * Check if password is too similar to email
 */
const isSimilarToEmail = (password: string, email?: string): boolean => {
  if (!email) return false;

  const emailLocal = email.split('@')[0].toLowerCase();
  const passwordLower = password.toLowerCase();

  // Check if password contains significant portion of email (4+ chars)
  if (emailLocal.length >= 4 && passwordLower.includes(emailLocal.substring(0, 4))) {
    return true;
  }

  return false;
};

/**
 * Calculate password entropy/strength score
 */
const calculatePasswordScore = (password: string): number => {
  let score = 0;

  // Length score (up to 30 points)
  score += Math.min(password.length * 2, 30);

  // Character variety score (up to 40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

  // Bonus for length over 15 (up to 20 points)
  if (password.length >= 15) score += 10;
  if (password.length >= 20) score += 10;

  // Penalty for common patterns
  if (containsCommonPassword(password)) score -= 30;
  if (containsSequentialChars(password)) score -= 20;
  if (hasExcessiveRepeats(password)) score -= 15;

  return Math.max(0, Math.min(100, score));
};

/**
 * Comprehensive password strength validation
 *
 * @param password - The password to validate
 * @param email - Optional email to check similarity
 * @returns PasswordStrengthResult with validation details
 */
export const validatePasswordStrength = (
  password: string,
  email?: string
): PasswordStrengthResult => {
  const errors: string[] = [];

  // Basic requirements
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Advanced checks
  if (containsCommonPassword(password)) {
    errors.push('Password contains a common weak password pattern');
  }

  if (containsSequentialChars(password)) {
    errors.push('Password contains sequential characters (e.g., "123", "abc")');
  }

  if (hasExcessiveRepeats(password)) {
    errors.push('Password contains too many repeated characters');
  }

  if (isSimilarToEmail(password, email)) {
    errors.push('Password is too similar to your email address');
  }

  const score = calculatePasswordScore(password);

  // Require minimum score
  if (errors.length === 0 && score < 50) {
    errors.push('Password is not strong enough. Try making it longer or more complex.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
};

/**
 * Get password strength level description
 */
export const getPasswordStrengthLevel = (
  score: number
): {
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  label: string;
  color: string;
} => {
  if (score < 30) {
    return { level: 'weak', label: 'Weak', color: 'red' };
  } else if (score < 50) {
    return { level: 'fair', label: 'Fair', color: 'orange' };
  } else if (score < 70) {
    return { level: 'good', label: 'Good', color: 'yellow' };
  } else if (score < 85) {
    return { level: 'strong', label: 'Strong', color: 'lime' };
  } else {
    return { level: 'very-strong', label: 'Very Strong', color: 'green' };
  }
};
