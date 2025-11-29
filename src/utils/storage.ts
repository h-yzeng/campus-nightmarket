import type { ProfileData } from '../types';

export type PageType =
  | 'home'
  | 'login'
  | 'signup'
  | 'browse'
  | 'cart'
  | 'checkout'
  | 'profile'
  | 'viewProfile'
  | 'userOrders'
  | 'orderDetails'
  | 'sellerDashboard'
  | 'createListing'
  | 'sellerListings'
  | 'sellerOrders';

export const STORAGE_KEYS = {
  CURRENT_USER: 'nightmarket_current_user',
} as const;

export const getInitialUser = (): { profile: ProfileData; page: PageType } => {
  const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (savedUser) {
    return {
      profile: JSON.parse(savedUser),
      page: 'browse',
    };
  }
  return {
    profile: {
      email: '',
      firstName: '',
      lastName: '',
      studentId: '',
      bio: '',
      photo: null,
      isSeller: false,
    },
    page: 'home',
  };
};

export const saveCurrentUser = (profile: ProfileData): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};
