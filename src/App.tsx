/**
 * App.tsx - Main Application Component
 *
 * This is the root component of the Campus Nightmarket application.
 * It orchestrates the entire application's state management, authentication,
 * and business logic.
 *
 * Key Responsibilities:
 * 1. Initialize and manage authentication state (user, profile)
 * 2. Coordinate cart operations and sync across devices
 * 3. Handle notifications (push notifications via Firebase Cloud Messaging)
 * 4. Manage order placement, updates, and cancellations
 * 5. Provide global state to child components via context/props
 *
 * Architecture Overview:
 * - Authentication: Firebase Auth → useAuth hook → Zustand authStore
 * - Server Data: Firebase Firestore → TanStack Query (caching & mutations)
 * - Local State: Zustand stores (cart, notifications, navigation)
 * - Cart Sync: localStorage + Firebase (cross-device support)
 */

import { useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/auth/useAuth';
import { useCart } from './hooks/features/useCart';
import { useCartSync } from './hooks/features/useCartSync';
import { useOrderManagement } from './hooks/data/useOrderManagement';
import { useNotifications } from './hooks/features/useNotifications';
import { useInactivityTimeout } from './hooks/auth/useInactivityTimeout';
import {
  useDeleteListingMutation,
  useToggleListingAvailabilityMutation,
} from './hooks/mutations/useListingMutations';
import { createReview } from './services/reviews/reviewService';
import { updateOrder } from './services/orders/orderService';
import { AppRoutes } from './routes';
import EmailVerificationBanner from './components/common/EmailVerificationBanner';
import { SkipNavigation } from './components/common/SkipNavigation';
import { shouldBypassVerification } from './config/emailWhitelist';
import type { Order, CartItem } from './types';
import { logger } from './utils/logger';
import { rateLimiter } from './utils/rateLimiter';
import { queryKeys } from './utils/queryKeys';
import { useAppStateSync } from './hooks/features/useAppStateSync';

function App() {
  const queryClient = useQueryClient();

  /**
   * Development Helper: Clear Rate Limits
   *
   * In development mode (localhost), clear all rate limits on mount.
   * This prevents rate limiting from blocking rapid testing/development.
   * In production, rate limits persist to prevent abuse.
   */
  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      rateLimiter.clearAll();
      logger.info('Rate limits cleared for development mode');
    }
  }, []);

  /**
   * Authentication Hook (useAuth)
   *
   * Provides:
   * - user: Firebase User object (null if signed out)
   * - profileData: User profile from Firestore (name, email, bio, etc.)
   * - Auth actions: login, signup, signout, update profile, etc.
   * - loading: Boolean indicating auth state is being determined
   *
   * Data Flow:
   * Firebase Auth → useFirebaseAuth → useAuth → Zustand authStore → UI
   */
  const {
    profileData,
    setProfileData,
    handleCreateProfile,
    handleLogin,
    handleSaveProfile,
    handleSignOut,
    handleResendVerification,
    handleReloadUser,
    user,
    loading,
  } = useAuth();

  /**
   * Shopping Cart Hook (useCart)
   *
   * Manages shopping cart state via Zustand store.
   * Cart is automatically persisted to localStorage.
   *
   * Actions:
   * - addToCart: Add item or increment quantity if exists
   * - updateCartQuantity: Change item quantity (removes if <= 0)
   * - removeFromCart: Remove item from cart
   * - clearCart: Empty entire cart
   */
  const { cart, addToCart, updateCartQuantity, removeFromCart, clearCart } = useCart();

  /**
   * Cart Cloud Sync (useCartSync)
   *
   * Syncs cart to Firestore for cross-device access.
   * When user logs in on a different device, their cart is restored.
   * Uses debouncing to avoid excessive writes to Firestore.
   */
  const { clearCloudCart } = useCartSync(user?.uid);

  /**
   * Listing Mutations (TanStack Query)
   *
   * These mutations handle seller actions on their food listings:
   * - deleteListingMutation: Permanently remove a listing
   * - toggleAvailabilityMutation: Mark listing as available/unavailable
   *
   * Mutations automatically:
   * 1. Update Firestore
   * 2. Invalidate affected queries (listings, seller dashboard)
   * 3. Show success/error toasts
   */
  const deleteListingMutation = useDeleteListingMutation();
  const toggleAvailabilityMutation = useToggleListingAvailabilityMutation();

  /**
   * Order Management Hook (useOrderManagement)
   *
   * Handles all order-related operations using TanStack Query mutations.
   *
   * Key Features:
   * - handlePlaceOrder: Create order(s) from cart, supports multi-seller checkout
   * - handleCancelOrder: Buyer/seller can cancel orders
   * - handleUpdateOrderStatus: Seller updates order status (confirmed, ready, completed)
   *
   * Order Lifecycle:
   * pending → confirmed → ready → completed
   * (can be cancelled at any point)
   */
  const { handlePlaceOrder, handleCancelOrder, handleUpdateOrderStatus } = useOrderManagement({
    user,
    profileData,
  });

  /**
   * Notifications Hook (useNotifications)
   *
   * Manages push notifications via Firebase Cloud Messaging (FCM).
   *
   * Features:
   * - Real-time notifications for order updates
   * - Foreground & background notification support
   * - Permission management (request, check status)
   * - Notification actions (mark read, clear, etc.)
   * - Sound effects for new notifications
   *
   * Notifications are stored in Zustand and persisted to localStorage.
   */
  const {
    notifications,
    unreadCount,
    permissionState,
    isRequestingPermission,
    requestPermission,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications(user?.uid);

  /**
   * State Management Architecture:
   * - Auth state (user, profile): Synced from Firebase to Zustand stores
   * - Server data (listings, orders, reviews): Managed by React Query with caching
   * - Cart: Managed by Zustand with localStorage persistence
   * - Notifications: Custom hook that syncs to Zustand store
   */
  const { clearAllAppState } = useAppStateSync({
    user,
    profileData,
    notifications,
    unreadCount,
    handlers: { markAsRead, markAllAsRead, clearNotification, clearAll },
    permission: {
      permissionState,
      isRequestingPermission,
      requestPermission,
      refreshNotifications,
    },
  });

  /**
   * Enhanced sign out handler that cleans up all application state:
   * 1. Signs out from Firebase Authentication
   * 2. Clears shopping cart (local and cloud)
   * 3. Clears auth store (user, profile)
   * 4. Resets navigation state (search queries, filters, etc.)
   */
  const wrappedHandleSignOut = useCallback(async () => {
    await clearCloudCart();
    await handleSignOut();
    queryClient.clear();
    clearCart();
    clearAllAppState();
  }, [clearAllAppState, clearCart, clearCloudCart, handleSignOut, queryClient]);

  // Auto-logout after 10 minutes of inactivity
  useInactivityTimeout({
    onTimeout: () => {
      void wrappedHandleSignOut();
    },
    isAuthenticated: !!user,
  });

  const wrappedHandleCreateListing = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.listings.all,
      refetchType: 'active',
    });
  }, [queryClient]);

  const wrappedHandleUpdateListing = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.listings.all,
      refetchType: 'active',
    });
  }, [queryClient]);

  const wrappedHandleToggleAvailability = useCallback(
    async (listingId: number | string) => {
      await toggleAvailabilityMutation.mutateAsync(String(listingId));
    },
    [toggleAvailabilityMutation]
  );

  const wrappedHandleDeleteListing = useCallback(
    async (listingId: number | string) => {
      await deleteListingMutation.mutateAsync(String(listingId));
    },
    [deleteListingMutation]
  );

  /**
   * Place order handler that groups cart items by seller
   * Each seller gets a separate order document in Firestore
   * Clears cart on successful order placement
   */
  const wrappedHandlePlaceOrder = useCallback(
    async (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) => {
      await handlePlaceOrder(cart, paymentMethod, pickupTimes, clearCart, notes);
    },
    [cart, clearCart, handlePlaceOrder]
  );

  const wrappedHandleCancelOrder = useCallback(
    async (orderId: number) => {
      await handleCancelOrder(orderId);
    },
    [handleCancelOrder]
  );

  /**
   * Review submission handler
   * Process:
   * 1. Retrieves order from React Query cache
   * 2. Creates review document in Firestore
   * 3. Updates order to mark as reviewed (hasReview: true)
   * 4. Invalidates related queries to refresh UI
   */
  const wrappedHandleSubmitReview = useCallback(
    async (orderId: number, rating: number, comment: string) => {
      if (!user || !profileData) {
        throw new Error('User not authenticated');
      }

      try {
        const ordersData = queryClient.getQueryData<Order[]>(queryKeys.orders.buyer(user.uid));
        const order = ordersData?.find((o) => o.id === orderId);

        if (!order) {
          throw new Error('Order not found');
        }

        await createReview({
          orderId: order.firebaseId,
          buyerId: user.uid,
          buyerName: `${profileData.firstName} ${profileData.lastName}`,
          sellerId: order.sellerId,
          sellerName: order.sellerName,
          rating,
          comment: comment || undefined,
          itemNames: order.items.map((item: CartItem) => item.name),
          listingIds: order.items.map((item: CartItem) => String(item.id)),
        });

        await updateOrder(order.firebaseId, { hasReview: true });

        queryClient.invalidateQueries({ queryKey: queryKeys.orders.buyer(user.uid) });
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.seller(order.sellerId) });
      } catch (error) {
        logger.error('Error submitting review:', error);
        throw error;
      }
    },
    [profileData, queryClient, user]
  );

  return (
    <BrowserRouter>
      <SkipNavigation />
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <div className="app">
        {/* Show email verification banner if user is logged in but email is not verified and not whitelisted */}
        {user && !user.emailVerified && !shouldBypassVerification(user.email) && (
          <EmailVerificationBanner
            userEmail={user.email}
            onResendEmail={handleResendVerification}
            onReloadUser={handleReloadUser}
          />
        )}
        <AppRoutes
          setProfileData={setProfileData}
          handleCreateProfile={handleCreateProfile}
          handleLogin={handleLogin}
          handleSaveProfile={handleSaveProfile}
          handleSignOut={wrappedHandleSignOut}
          handlePlaceOrder={wrappedHandlePlaceOrder}
          handleCancelOrder={wrappedHandleCancelOrder}
          handleCreateListing={wrappedHandleCreateListing}
          handleToggleAvailability={wrappedHandleToggleAvailability}
          handleDeleteListing={wrappedHandleDeleteListing}
          handleUpdateListing={wrappedHandleUpdateListing}
          handleUpdateOrderStatus={handleUpdateOrderStatus}
          handleSubmitReview={wrappedHandleSubmitReview}
          addToCart={addToCart}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          handleResendVerification={handleResendVerification}
          handleReloadUser={handleReloadUser}
          authLoading={loading}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
