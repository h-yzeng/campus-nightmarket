/**
 * Navigation Store Tests
 */
import { act, renderHook } from '@testing-library/react';
import { useNavigationStore } from '../../src/stores/navigationStore';

describe('navigationStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useNavigationStore());
    act(() => {
      result.current.resetNavigation();
    });
  });

  describe('initial state', () => {
    it('should have empty search query initially', () => {
      const { result } = renderHook(() => useNavigationStore());
      expect(result.current.searchQuery).toBe('');
    });

    it('should have "All Dorms" as default location', () => {
      const { result } = renderHook(() => useNavigationStore());
      expect(result.current.selectedLocation).toBe('All Dorms');
    });

    it('should have "buyer" as default user mode', () => {
      const { result } = renderHook(() => useNavigationStore());
      expect(result.current.userMode).toBe('buyer');
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.setSearchQuery('pizza');
      });

      expect(result.current.searchQuery).toBe('pizza');
    });

    it('should allow empty search query', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.setSearchQuery('test');
        result.current.setSearchQuery('');
      });

      expect(result.current.searchQuery).toBe('');
    });

    it('should update search query multiple times', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.setSearchQuery('pizza');
      });
      expect(result.current.searchQuery).toBe('pizza');

      act(() => {
        result.current.setSearchQuery('burger');
      });
      expect(result.current.searchQuery).toBe('burger');
    });
  });

  describe('setSelectedLocation', () => {
    it('should set selected location', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.setSelectedLocation('North Dorm');
      });

      expect(result.current.selectedLocation).toBe('North Dorm');
    });

    it('should allow setting location back to All Dorms', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.setSelectedLocation('South Dorm');
        result.current.setSelectedLocation('All Dorms');
      });

      expect(result.current.selectedLocation).toBe('All Dorms');
    });
  });

  describe('setUserMode', () => {
    it('should set user mode to seller', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.setUserMode('seller');
      });

      expect(result.current.userMode).toBe('seller');
    });

    it('should set user mode to buyer', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.setUserMode('seller');
        result.current.setUserMode('buyer');
      });

      expect(result.current.userMode).toBe('buyer');
    });
  });

  describe('resetNavigation', () => {
    it('should reset all navigation state', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.setSearchQuery('test search');
        result.current.setSelectedLocation('East Dorm');
        result.current.setUserMode('seller');
        result.current.resetNavigation();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedLocation).toBe('All Dorms');
      expect(result.current.userMode).toBe('buyer');
    });

    it('should work when already in default state', () => {
      const { result } = renderHook(() => useNavigationStore());

      act(() => {
        result.current.resetNavigation();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedLocation).toBe('All Dorms');
      expect(result.current.userMode).toBe('buyer');
    });
  });

  describe('state persistence across components', () => {
    it('should share state between multiple hooks', () => {
      const { result: hook1 } = renderHook(() => useNavigationStore());
      const { result: hook2 } = renderHook(() => useNavigationStore());

      act(() => {
        hook1.current.setSearchQuery('shared search');
      });

      expect(hook2.current.searchQuery).toBe('shared search');
    });
  });
});
