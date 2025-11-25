import { create } from 'zustand';

interface NavigationState {
  // State
  searchQuery: string;
  selectedLocation: string;
  userMode: 'buyer' | 'seller';

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedLocation: (location: string) => void;
  setUserMode: (mode: 'buyer' | 'seller') => void;
  resetNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  // Initial state
  searchQuery: '',
  selectedLocation: 'All Dorms',
  userMode: 'buyer',

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedLocation: (location) => set({ selectedLocation: location }),

  setUserMode: (mode) => set({ userMode: mode }),

  resetNavigation: () =>
    set({
      searchQuery: '',
      selectedLocation: 'All Dorms',
      userMode: 'buyer',
    }),
}));
