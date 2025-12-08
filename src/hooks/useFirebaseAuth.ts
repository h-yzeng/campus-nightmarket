import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import * as Sentry from '@sentry/react';
import { getFirebaseAuth } from '../config/firebase';
import {
  signUp,
  signIn,
  logOut,
  resetPassword,
  resendVerificationEmail,
  reloadUser,
  type SignupData,
  type LoginData,
} from '../services/auth/authService';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  becomeSeller,
} from '../services/auth/userService';
import type { FirebaseUserProfile } from '../types/firebase';
import { logger } from '../utils/logger';

export interface UseFirebaseAuthReturn {
  user: User | null;
  profile: FirebaseUserProfile | null;
  loading: boolean;
  error: string | null;
  handleSignUp: (data: SignupData) => Promise<void>;
  handleSignIn: (data: LoginData) => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleUpdateProfile: (updates: Partial<FirebaseUserProfile>) => Promise<void>;
  handleBecomeSeller: (sellerInfo: FirebaseUserProfile['sellerInfo']) => Promise<void>;
  handleResetPassword: (email: string) => Promise<void>;
  handleResendVerification: () => Promise<void>;
  handleReloadUser: () => Promise<void>;
  clearError: () => void;
}

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FirebaseUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useMemo(() => getFirebaseAuth(), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            const userProfile = await getUserProfile(firebaseUser.uid);
            setProfile(userProfile);
          } catch (err) {
            logger.error('Error loading user profile:', err);
            setError('Failed to load user profile');
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        logger.error('Error in auth state change handler:', err);
        setError('Authentication error occurred');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignUp = async (data: SignupData): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'sign_up_start',
        data: { email: data.email },
        level: 'info',
      });

      const user = await signUp(data);

      await createUserProfile(user.uid, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        studentId: data.studentId,
        bio: '',
        photoURL: null,
        isSeller: false,
      });
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'sign_up_success',
        data: { email: data.email },
        level: 'info',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      Sentry.captureMessage('sign_up_failed', {
        level: 'error',
        extra: { error: errorMessage, email: data.email },
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (data: LoginData): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'sign_in_start',
        data: { email: data.email },
        level: 'info',
      });

      await signIn(data);
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'sign_in_success',
        data: { email: data.email },
        level: 'info',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      Sentry.captureMessage('sign_in_failed', {
        level: 'error',
        extra: { error: errorMessage, email: data.email },
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      Sentry.addBreadcrumb({ category: 'auth', message: 'sign_out_start', level: 'info' });
      await logOut();
      setUser(null);
      setProfile(null);
      Sentry.addBreadcrumb({ category: 'auth', message: 'sign_out_success', level: 'info' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      Sentry.captureMessage('sign_out_failed', {
        level: 'error',
        extra: { error: errorMessage },
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<FirebaseUserProfile>): Promise<void> => {
    if (!user) {
      setError('No user is signed in');
      throw new Error('No user is signed in');
    }

    setError(null);
    setLoading(true);

    try {
      await updateUserProfile(user.uid, updates);

      if (profile) {
        setProfile({ ...profile, ...updates });
      }

      Sentry.addBreadcrumb({
        category: 'profile',
        message: 'profile_update_success',
        data: { uid: user.uid },
        level: 'info',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      Sentry.captureMessage('profile_update_failed', {
        level: 'error',
        extra: { error: errorMessage, uid: user.uid },
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeSeller = async (
    sellerInfo: FirebaseUserProfile['sellerInfo']
  ): Promise<void> => {
    if (!user) {
      setError('No user is signed in');
      throw new Error('No user is signed in');
    }

    setError(null);
    setLoading(true);

    try {
      // Pass email verification status to becomeSeller
      await becomeSeller(user.uid, sellerInfo, user.emailVerified);

      if (profile) {
        setProfile({ ...profile, isSeller: true, sellerInfo });
      }

      Sentry.addBreadcrumb({
        category: 'seller',
        message: 'become_seller_success',
        data: { uid: user.uid },
        level: 'info',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to become seller';
      setError(errorMessage);
      Sentry.captureMessage('become_seller_failed', {
        level: 'error',
        extra: { error: errorMessage, uid: user.uid },
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      Sentry.captureMessage('reset_password_failed', {
        level: 'error',
        extra: { error: errorMessage, email },
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    setError(null);

    try {
      await resendVerificationEmail();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to resend verification email';
      setError(errorMessage);
      Sentry.captureMessage('resend_verification_failed', {
        level: 'error',
        extra: { error: errorMessage },
      });
      throw err;
    }
  };

  const handleReloadUser = async (): Promise<void> => {
    try {
      await reloadUser();
      // Refresh the user object to get latest emailVerified status
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser({ ...currentUser });
      }
    } catch (err) {
      logger.error('Error reloading user:', err);
      Sentry.captureMessage('reload_user_failed', {
        level: 'error',
        extra: { error: err instanceof Error ? err.message : String(err) },
      });
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    profile,
    loading,
    error,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    handleUpdateProfile,
    handleBecomeSeller,
    handleResetPassword,
    handleResendVerification,
    handleReloadUser,
    clearError,
  };
};
