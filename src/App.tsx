import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './hooks/userAuth';
import { useListings } from './hooks/useListings';
import { useOrders } from './hooks/useOrders';
import { useCart } from './hooks/useCart';
import { useOrderManagement } from './hooks/useOrderManagement';
import { useListingManagement } from './hooks/useListingManagement';
import { AppRoutes } from './routes';

function App() {
  const {
    profileData,
    setProfileData,
    handleCreateProfile,
    handleLogin,
    handleSaveProfile,
    handleSignOut,
    user,
  } = useAuth();

  const { foodItems, loading: listingsLoading, error: listingsError, refreshListings } = useListings();

  const { orders: buyerOrders, loading: buyerOrdersLoading, createOrder, cancelOrder } = useOrders(user?.uid, 'buyer');

  const { orders: sellerOrders, loading: sellerOrdersLoading, updateStatus } = useOrders(user?.uid, 'seller');

  const { cart, addToCart, updateCartQuantity, removeFromCart, clearCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Dorms');
  const [userMode, setUserMode] = useState<'buyer' | 'seller'>('buyer');

  const { listings, handleCreateListing, handleToggleAvailability, handleDeleteListing, refreshSellerListings } =
    useListingManagement(user?.uid, refreshListings);

  const { handlePlaceOrder, handleCancelOrder, handleUpdateOrderStatus } = useOrderManagement({
    createOrder,
    cancelOrder,
    updateStatus,
    user,
    profileData,
    buyerOrders,
    sellerOrders,
  });

  const wrappedHandleSignOut = () => {
    handleSignOut();
    clearCart();
    setSearchQuery('');
    setSelectedLocation('All Dorms');
    setUserMode('buyer');
  };

  // Dummy navigation function - navigation is now handled by React Router in the routes
  const noOpNavigation = () => {};

  const wrappedHandleCreateListing = async () => {
    await handleCreateListing(noOpNavigation);
    await refreshSellerListings();
  };

  const wrappedHandleUpdateListing = async () => {
    await refreshListings();
    await refreshSellerListings();
  };

  const wrappedHandlePlaceOrder = async (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) => {
    await handlePlaceOrder(cart, paymentMethod, pickupTimes, noOpNavigation, clearCart, notes);
  };

  const wrappedHandleCancelOrder = async (orderId: number) => {
    await handleCancelOrder(orderId, noOpNavigation);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <AppRoutes
          profileData={profileData}
          setProfileData={setProfileData}
          user={user}
          cart={cart}
          addToCart={addToCart}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          userMode={userMode}
          setUserMode={setUserMode}
          buyerOrders={buyerOrders}
          sellerOrders={sellerOrders}
          buyerOrdersLoading={buyerOrdersLoading}
          sellerOrdersLoading={sellerOrdersLoading}
          listings={listings}
          foodItems={foodItems}
          listingsLoading={listingsLoading}
          listingsError={listingsError}
          handleCreateProfile={handleCreateProfile}
          handleLogin={handleLogin}
          handleSaveProfile={handleSaveProfile}
          handleSignOut={wrappedHandleSignOut}
          handlePlaceOrder={wrappedHandlePlaceOrder}
          handleCancelOrder={wrappedHandleCancelOrder}
          handleCreateListing={wrappedHandleCreateListing}
          handleToggleAvailability={handleToggleAvailability}
          handleDeleteListing={handleDeleteListing}
          handleUpdateListing={wrappedHandleUpdateListing}
          handleUpdateOrderStatus={handleUpdateOrderStatus}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;