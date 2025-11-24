import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  signUp,
  signIn,
  logOut,
  resetPassword,
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
  clearError: () => void;
}

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FirebaseUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch (err) {
          console.error('Error loading user profile:', err);
          setError('Failed to load user profile');
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = async (data: SignupData): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (data: LoginData): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      await signIn(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      await logOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (
    updates: Partial<FirebaseUserProfile>
  ): Promise<void> => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
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
      await becomeSeller(user.uid, sellerInfo);

      if (profile) {
        setProfile({ ...profile, isSeller: true, sellerInfo });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to become seller';
      setError(errorMessage);
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
      throw err;
    } finally {
      setLoading(false);
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
    clearError,
  };
};
