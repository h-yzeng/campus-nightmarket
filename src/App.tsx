import { useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useOrderManagement } from './hooks/useOrderManagement';
import { useNotifications } from './hooks/useNotifications';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
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
import { useAppStateSync } from './hooks/useAppStateSync';

function App() {
  const queryClient = useQueryClient();

  // Clear rate limits on page refresh in development mode
  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      rateLimiter.clearAll();
      logger.info('Rate limits cleared for development mode');
    }
  }, []);

  // Auth and cart still use hooks
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

  const { cart, addToCart, updateCartQuantity, removeFromCart, clearCart } = useCart();

  // Listing mutations
  const deleteListingMutation = useDeleteListingMutation();
  const toggleAvailabilityMutation = useToggleListingAvailabilityMutation();

  // Order management now uses React Query mutations
  const { handlePlaceOrder, handleCancelOrder, handleUpdateOrderStatus } = useOrderManagement({
    user,
    profileData,
  });

  // Notifications
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
   * 2. Clears shopping cart
   * 3. Clears auth store (user, profile)
   * 4. Resets navigation state (search queries, filters, etc.)
   */
  const wrappedHandleSignOut = useCallback(async () => {
    await handleSignOut();
    queryClient.clear();
    clearCart();
    clearAllAppState();
  }, [clearAllAppState, clearCart, handleSignOut, queryClient]);

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
