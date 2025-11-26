import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './hooks/userAuth';
import { useCart } from './hooks/useCart';
import { useOrderManagement } from './hooks/useOrderManagement';
import { useNotifications } from './hooks/useNotifications';
import { useDeleteListingMutation, useToggleListingAvailabilityMutation } from './hooks/mutations/useListingMutations';
import { AppRoutes } from './routes';
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

  return (
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
          addToCart={addToCart}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
