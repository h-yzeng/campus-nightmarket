import { useState } from 'react';
import { useAuth } from './hooks/userAuth';
import { useListings } from './hooks/useListings';
import { useOrders } from './hooks/useOrders';
import { useCart } from './hooks/useCart';
import { useNavigation } from './hooks/useNavigation';
import { useOrderManagement } from './hooks/useOrderManagement';
import { useListingManagement } from './hooks/useListingManagement';
import { AppRouter } from './components/AppRouter';

function App() {
  const {
    profileData,
    setProfileData,
    currentPage,
    setCurrentPage,
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

  const {
    selectedSellerId,
    selectedOrderId,
    selectedListingId,
    userMode,
    setUserMode,
    handleModeChange,
    handleViewProfile,
    handleViewOrderDetails,
    handleEditListing: handleEditListingNav,
    handleBackToBrowse,
  } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Dorms');

  const { listings, handleCreateListing, handleToggleAvailability, handleDeleteListing, handleEditListing, refreshSellerListings } =
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

  const handleGetStarted = () => setCurrentPage('signup');
  const handleGoToLogin = () => setCurrentPage('login');
  const handleGoToSignup = () => setCurrentPage('signup');
  const handleGoToProfile = () => setCurrentPage('profile');
  const handleCartClick = () => setCurrentPage('cart');
  const handleBackToCart = () => setCurrentPage('cart');
  const handleGoToOrders = () => setCurrentPage('userOrders');
  const handleCheckout = () => setCurrentPage('checkout');
  const handleGoToCreateListing = () => setCurrentPage('createListing');
  const handleGoToSellerListings = () => setCurrentPage('sellerListings');
  const handleGoToSellerOrders = () => setCurrentPage('sellerOrders');
  const handleBackToSellerListings = () => setCurrentPage('sellerListings');

  const handleGoToSellerDashboard = () => {
    setCurrentPage('sellerDashboard');
    setUserMode('seller');
  };

  const handleSignOutWithReset = () => {
    handleSignOut();
    clearCart();
    setSearchQuery('');
    setSelectedLocation('All Dorms');
    setUserMode('buyer');
  };

  const setPage = (page: typeof currentPage) => setCurrentPage(page);

  const wrappedHandleModeChange = (mode: 'buyer' | 'seller') => handleModeChange(mode, setPage);
  const wrappedHandleViewProfile = (sellerId: string) => handleViewProfile(sellerId, setPage);
  const wrappedHandleViewOrderDetails = (orderId: number) => handleViewOrderDetails(orderId, setPage);
  const wrappedHandleBackToBrowse = () => handleBackToBrowse(setPage);
  const wrappedHandleCreateListing = async () => handleCreateListing(setPage);
  const wrappedHandleEditListing = (listingId: number | string) => {
    handleEditListing(listingId, (id: string) => handleEditListingNav(id, setPage));
  };
  const wrappedHandleUpdateListing = async () => {
    await refreshListings();
    await refreshSellerListings();
    handleBackToSellerListings();
  };
  const wrappedHandlePlaceOrder = async (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) =>
    handlePlaceOrder(cart, paymentMethod, pickupTimes, setPage, clearCart, notes);
  const wrappedHandleCancelOrder = async (orderId: number) => handleCancelOrder(orderId, setPage);

  return (
    <div className="app">
      <AppRouter
        currentPage={currentPage}
        profileData={profileData}
        setProfileData={setProfileData}
        cart={cart}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedOrderId={selectedOrderId}
        selectedListingId={selectedListingId}
        selectedSellerId={selectedSellerId}
        userMode={userMode}
        buyerOrders={buyerOrders}
        sellerOrders={sellerOrders}
        listings={listings}
        foodItems={foodItems}
        listingsLoading={listingsLoading}
        listingsError={listingsError}
        buyerOrdersLoading={buyerOrdersLoading}
        sellerOrdersLoading={sellerOrdersLoading}
        handleGetStarted={handleGetStarted}
        handleGoToLogin={handleGoToLogin}
        handleGoToSignup={handleGoToSignup}
        handleGoToProfile={handleGoToProfile}
        handleBackToBrowse={wrappedHandleBackToBrowse}
        handleCartClick={handleCartClick}
        handleBackToCart={handleBackToCart}
        handleGoToOrders={handleGoToOrders}
        handleGoToSellerDashboard={handleGoToSellerDashboard}
        handleGoToCreateListing={handleGoToCreateListing}
        handleGoToSellerListings={handleGoToSellerListings}
        handleGoToSellerOrders={handleGoToSellerOrders}
        handleModeChange={wrappedHandleModeChange}
        handleViewProfile={wrappedHandleViewProfile}
        handleViewOrderDetails={wrappedHandleViewOrderDetails}
        handleCreateProfile={handleCreateProfile}
        handleLogin={handleLogin}
        handleSaveProfile={handleSaveProfile}
        handleSignOutWithReset={handleSignOutWithReset}
        addToCart={addToCart}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        handleCheckout={handleCheckout}
        handlePlaceOrder={wrappedHandlePlaceOrder}
        handleCancelOrder={wrappedHandleCancelOrder}
        handleCreateListing={wrappedHandleCreateListing}
        handleToggleAvailability={handleToggleAvailability}
        handleDeleteListing={handleDeleteListing}
        handleEditListing={wrappedHandleEditListing}
        handleUpdateListing={wrappedHandleUpdateListing}
        handleBackToSellerListings={handleBackToSellerListings}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}

export default App;