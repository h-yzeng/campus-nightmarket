/**
 * Email addresses that bypass email verification requirement
 * Add emails here for testing or admin accounts
 */
export const VERIFICATION_BYPASS_EMAILS: string[] = [
  // Add your email here for testing
  // Example: 'yourname@hawk.illinoistech.edu',
  'jdoe@hawk.illinoistech.edu',
];

/**
 * Check if an email should bypass verification
 */
export const shouldBypassVerification = (email: string | null): boolean => {
  if (!email) return false;
  return VERIFICATION_BYPASS_EMAILS.includes(email.toLowerCase());
};
