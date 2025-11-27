import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './hooks/userAuth';
import { useCart } from './hooks/useCart';
import { useOrderManagement } from './hooks/useOrderManagement';
import { useNotifications } from './hooks/useNotifications';
import { useDeleteListingMutation, useToggleListingAvailabilityMutation } from './hooks/mutations/useListingMutations';
import { createReview } from './services/reviews/reviewService';
import { updateOrder } from './services/orders/orderService';
import { AppRoutes } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import type { Order, CartItem } from './types';
import {
  useAuthStore,
  useNotificationStore,
} from './stores';

function App() {
  const queryClient = useQueryClient();

  // Auth and cart still use hooks
  const {
    profileData,
    setProfileData,
    handleCreateProfile,
    handleLogin,
    handleSaveProfile,
    handleSignOut,
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

  // Sync only auth and notifications to stores (data now comes from React Query, cart uses Zustand directly)
  const setUser = useAuthStore((state) => state.setUser);
  const setStoreProfileData = useAuthStore((state) => state.setProfileData);
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

  const wrappedHandleSignOut = () => {
    handleSignOut();
    clearCart();
  };

  const wrappedHandleCreateListing = async () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
  };

  const wrappedHandleUpdateListing = async () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
  };

  const wrappedHandleToggleAvailability = async (listingId: number) => {
    // Mutations expect Firebase ID (string), convert number to string
    await toggleAvailabilityMutation.mutateAsync(String(listingId));
  };

  const wrappedHandleDeleteListing = async (listingId: number | string) => {
    await deleteListingMutation.mutateAsync(String(listingId));
  };

  const wrappedHandlePlaceOrder = async (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) => {
    await handlePlaceOrder(cart, paymentMethod, pickupTimes, () => {}, clearCart, notes);
  };

  const wrappedHandleCancelOrder = async (orderId: number) => {
    await handleCancelOrder(orderId, () => {});
  };

  const wrappedHandleSubmitReview = async (orderId: number, rating: number, comment: string) => {
    if (!user || !profileData) {
      throw new Error('User not authenticated');
    }

    try {
      // Get the order from React Query cache
      const ordersData = queryClient.getQueryData<Order[]>(['orders', 'buyer', user.uid]);
      const order = ordersData?.find(o => o.id === orderId);

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
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app">
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
