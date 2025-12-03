import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
  type AuthError,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { logger } from '../../utils/logger';

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const signUp = async (data: SignupData): Promise<User> => {
  try {
    const { email, password } = data;

    if (!email.endsWith('@hawk.illinoistech.edu')) {
      throw new Error('Please use your IIT student email (@hawk.illinoistech.edu)');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Send email verification with proper action code settings
    try {
      const actionCodeSettings = {
        // URL to redirect to after email verification
        url: window.location.origin + '/browse',
        handleCodeInApp: false, // Let Firebase handle verification on their servers
      };

      await sendEmailVerification(userCredential.user, actionCodeSettings);
      logger.info('Verification email sent to:', email);
    } catch (verificationError) {
      logger.error('Failed to send verification email:', verificationError);
      // Don't throw - allow signup to continue even if verification email fails
    }

    return userCredential.user;
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

/**
 * Resend email verification to the current user
 */
export const resendVerificationEmail = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    const actionCodeSettings = {
      // URL to redirect to after email verification
      url: window.location.origin + '/browse',
      handleCodeInApp: false, // Let Firebase handle verification on their servers
    };

    await sendEmailVerification(user, actionCodeSettings);
    logger.info('Verification email resent to:', user.email);
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

/**
 * Check if current user's email is verified
 */
export const isEmailVerified = (): boolean => {
  const user = auth.currentUser;
  return user?.emailVerified ?? false;
};

/**
 * Reload user data to check latest email verification status
 */
export const reloadUser = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    await user.reload();
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const signIn = async (data: LoginData): Promise<User> => {
  try {
    const { email, password } = data;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user is currently signed in');
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const changeEmail = async (newEmail: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    await updateEmail(user, newEmail);
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

const handleAuthError = (error: AuthError): Error => {
  let message = 'An authentication error occurred';

  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'An account with this email already exists';
      break;
    case 'auth/invalid-email':
      message = 'Invalid email address';
      break;
    case 'auth/operation-not-allowed':
      message = 'Email/password accounts are not enabled';
      break;
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters';
      break;
    case 'auth/user-disabled':
      message = 'This account has been disabled';
      break;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      message = 'Invalid email or password';
      break;
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later';
      break;
    case 'auth/requires-recent-login':
      message = 'Please sign in again to complete this action';
      break;
    default:
      message = error.message || 'An authentication error occurred';
  }

  return new Error(message);
};
