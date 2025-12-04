import { useEffect } from 'react';
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
import ErrorBoundary from './components/ErrorBoundary';
import EmailVerificationBanner from './components/common/EmailVerificationBanner';
import { shouldBypassVerification } from './config/emailWhitelist';
import type { Order, CartItem } from './types';
import { useAuthStore, useNotificationStore, useNavigationStore } from './stores';
import { logger } from './utils/logger';
import { rateLimiter } from './utils/rateLimiter';

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
  const notifications = useNotifications(user?.uid);

  /**
   * State Management Architecture:
   * - Auth state (user, profile): Synced from Firebase to Zustand stores
   * - Server data (listings, orders, reviews): Managed by React Query with caching
   * - Cart: Managed by Zustand with localStorage persistence
   * - Notifications: Custom hook that syncs to Zustand store
   */
  const setUser = useAuthStore((state) => state.setUser);
  const setStoreProfileData = useAuthStore((state) => state.setProfileData);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const setNotificationHandlers = useNotificationStore((state) => state.setHandlers);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    setStoreProfileData(profileData);
  }, [profileData, setStoreProfileData]);

  useEffect(() => {
    setNotifications(notifications.notifications, notifications.unreadCount);
    setNotificationHandlers({
      markAsRead: notifications.markAsRead,
      markAllAsRead: notifications.markAllAsRead,
      clearNotification: notifications.clearNotification,
      clearAll: notifications.clearAll,
    });
  }, [notifications, setNotifications, setNotificationHandlers]);

  /**
   * Enhanced sign out handler that cleans up all application state:
   * 1. Signs out from Firebase Authentication
   * 2. Clears shopping cart
   * 3. Clears auth store (user, profile)
   * 4. Resets navigation state (search queries, filters, etc.)
   */
  const wrappedHandleSignOut = () => {
    handleSignOut();
    clearCart();
    clearAuth();
    resetNavigation();
  };

  // Auto-logout after 10 minutes of inactivity
  useInactivityTimeout({
    onTimeout: wrappedHandleSignOut,
    isAuthenticated: !!user,
  });

  const wrappedHandleCreateListing = async () => {
    queryClient.invalidateQueries({ queryKey: ['listings'], refetchType: 'active' });
  };

  const wrappedHandleUpdateListing = async () => {
    queryClient.invalidateQueries({ queryKey: ['listings'], refetchType: 'active' });
  };

  const wrappedHandleToggleAvailability = async (listingId: number | string) => {
    // Mutations expect Firebase ID (string), convert number to string
    await toggleAvailabilityMutation.mutateAsync(String(listingId));
  };

  const wrappedHandleDeleteListing = async (listingId: number | string) => {
    await deleteListingMutation.mutateAsync(String(listingId));
  };

  /**
   * Place order handler that groups cart items by seller
   * Each seller gets a separate order document in Firestore
   * Clears cart on successful order placement
   */
  const wrappedHandlePlaceOrder = async (
    paymentMethod: string,
    pickupTimes: Record<string, string>,
    notes?: string
  ) => {
    await handlePlaceOrder(cart, paymentMethod, pickupTimes, () => {}, clearCart, notes);
  };

  const wrappedHandleCancelOrder = async (orderId: number) => {
    await handleCancelOrder(orderId, () => {});
  };

  /**
   * Review submission handler
   * Process:
   * 1. Retrieves order from React Query cache
   * 2. Creates review document in Firestore
   * 3. Updates order to mark as reviewed (hasReview: true)
   * 4. Invalidates related queries to refresh UI
   */
  const wrappedHandleSubmitReview = async (orderId: number, rating: number, comment: string) => {
    if (!user || !profileData) {
      throw new Error('User not authenticated');
    }

    try {
      // Get the order from React Query cache
      const ordersData = queryClient.getQueryData<Order[]>(['orders', 'buyer', user.uid]);
      const order = ordersData?.find((o) => o.id === orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      // Create the review
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

      // Mark the order as reviewed
      await updateOrder(order.firebaseId, { hasReview: true });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders', 'buyer', user.uid] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'seller', order.sellerId] });
    } catch (error) {
      logger.error('Error submitting review:', error);
      throw error;
    }
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
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
          />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
