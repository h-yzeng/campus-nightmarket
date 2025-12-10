/**
 * Auth Store (Zustand)
 *
 * Manages authentication state across the application.
 *
 * State:
 * - user: Firebase User object (contains uid, email, emailVerified, etc.)
 * - profileData: User profile from Firestore (name, bio, seller info, etc.)
 *
 * Why Zustand?
 * - Lightweight state management (no boilerplate like Redux)
 * - Easy to use with hooks
 * - Built-in persistence via middleware
 * - Good TypeScript support
 *
 * Persistence Strategy:
 * - Only profileData is persisted to localStorage
 * - Firebase User object is NOT persisted (non-serializable, comes from Firebase Auth)
 * - On app load, Firebase Auth automatically restores user session
 *
 * Usage:
 * const user = useAuthStore((state) => state.user);
 * const setUser = useAuthStore((state) => state.setUser);
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProfileData } from '../types';
import type { User } from 'firebase/auth';

interface AuthState {
  // State
  user: User | null;
  profileData: ProfileData;

  // Actions
  setUser: (user: User | null) => void;
  setProfileData: (data: ProfileData) => void;
  updateProfileData: (updates: Partial<ProfileData>) => void;
  clearAuth: () => void;
}

const initialProfileData: ProfileData = {
  email: '',
  firstName: '',
  lastName: '',
  studentId: '',
  bio: '',
  photo: null,
  isSeller: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      profileData: initialProfileData,

      // Actions
      setUser: (user) => set({ user }),

      setProfileData: (data) => set({ profileData: data }),

      updateProfileData: (updates) =>
        set((state) => ({
          profileData: { ...state.profileData, ...updates },
        })),

      clearAuth: () =>
        set({
          user: null,
          profileData: initialProfileData,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      // Do not persist Firebase user object; it is non-serializable and comes from Firebase
      partialize: (state) => ({ profileData: state.profileData }),
    }
  )
);
