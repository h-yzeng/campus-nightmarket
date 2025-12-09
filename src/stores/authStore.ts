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
