import type { Order, FoodItem, ProfileData } from '../types';

export interface AppRoutesProps {
  // Profile setters (needed for forms)
  setProfileData: (data: ProfileData) => void;

  // Cart actions
  addToCart: (item: FoodItem) => void;
  updateCartQuantity: (itemId: number, newQuantity: number) => void;
  removeFromCart: (itemId: number) => void;

  // Auth handlers
  handleCreateProfile: (password: string) => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<boolean>;
  handleSaveProfile: () => Promise<void>;
  handleSignOut: () => Promise<void>;

  // Order handlers
  handlePlaceOrder: (
    paymentMethod: string,
    pickupTimes: Record<string, string>,
    notes?: string
  ) => Promise<void>;
  handleCancelOrder: (orderId: number) => Promise<void>;
  handleUpdateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
  handleSubmitReview: (orderId: number, rating: number, comment: string) => Promise<void>;

  // Listing handlers
  handleCreateListing: () => Promise<void>;
  handleToggleAvailability: (listingId: number | string) => void;
  handleDeleteListing: (listingId: number | string) => void;
  handleUpdateListing: () => Promise<void>;

  // Email verification helpers
  handleResendVerification: () => Promise<void>;
  handleReloadUser: () => Promise<void>;

  // Auth loading state to prevent premature redirects
  authLoading: boolean;
}
