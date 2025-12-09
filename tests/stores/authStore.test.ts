/**
 * Auth Store Tests
 */
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../../src/stores/authStore';
import type { ProfileData } from '../../src/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockUser = {
  uid: 'test-uid',
  email: 'test@hawk.illinoistech.edu',
  emailVerified: true,
} as unknown as import('firebase/auth').User;

const mockProfileData: ProfileData = {
  email: 'test@hawk.illinoistech.edu',
  firstName: 'John',
  lastName: 'Doe',
  studentId: 'A12345678',
  bio: 'Test bio',
  photo: 'https://example.com/photo.jpg',
  isSeller: false,
};

describe('authStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.clearAuth();
    });
    localStorageMock.clear();
  });

  describe('setUser', () => {
    it('should set user', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toBe(mockUser);
    });

    it('should allow setting user to null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('setProfileData', () => {
    it('should set profile data', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setProfileData(mockProfileData);
      });

      expect(result.current.profileData).toEqual(mockProfileData);
    });

    it('should replace existing profile data', () => {
      const { result } = renderHook(() => useAuthStore());

      const newProfile: ProfileData = {
        email: 'new@hawk.illinoistech.edu',
        firstName: 'Jane',
        lastName: 'Smith',
        studentId: 'A87654321',
        bio: 'New bio',
        photo: null,
        isSeller: true,
      };

      act(() => {
        result.current.setProfileData(mockProfileData);
        result.current.setProfileData(newProfile);
      });

      expect(result.current.profileData).toEqual(newProfile);
    });
  });

  describe('updateProfileData', () => {
    it('should update partial profile data', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setProfileData(mockProfileData);
        result.current.updateProfileData({ firstName: 'Updated', isSeller: true });
      });

      expect(result.current.profileData.firstName).toBe('Updated');
      expect(result.current.profileData.isSeller).toBe(true);
      expect(result.current.profileData.lastName).toBe('Doe'); // Unchanged
    });

    it('should preserve other fields when updating', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setProfileData(mockProfileData);
        result.current.updateProfileData({ bio: 'New bio' });
      });

      expect(result.current.profileData.email).toBe(mockProfileData.email);
      expect(result.current.profileData.firstName).toBe(mockProfileData.firstName);
      expect(result.current.profileData.bio).toBe('New bio');
    });
  });

  describe('clearAuth', () => {
    it('should clear user and reset profile data', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setProfileData(mockProfileData);
        result.current.clearAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.profileData.email).toBe('');
      expect(result.current.profileData.firstName).toBe('');
      expect(result.current.profileData.isSeller).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => {
        result.current.clearAuth();
      });
      expect(result.current.user).toBeNull();
    });

    it('should have empty profile data initially', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => {
        result.current.clearAuth();
      });
      expect(result.current.profileData.email).toBe('');
      expect(result.current.profileData.firstName).toBe('');
      expect(result.current.profileData.lastName).toBe('');
    });
  });
});
