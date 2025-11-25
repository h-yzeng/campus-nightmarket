import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './hooks/userAuth';
import { useListings } from './hooks/useListings';
import { useOrders } from './hooks/useOrders';
import { useCart } from './hooks/useCart';
import { useOrderManagement } from './hooks/useOrderManagement';
import { useListingManagement } from './hooks/useListingManagement';
import { AppRoutes } from './routes';
import {
  useAuthStore,
  useCartStore,
  useOrdersStore,
  useListingsStore,
} from './stores';

function App() {
  // Get data from hooks
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

  // Get store actions
  const setUser = useAuthStore((state) => state.setUser);
  const setStoreProfileData = useAuthStore((state) => state.setProfileData);
  const setCart = useCartStore((state) => state.setCart);
  const setBuyerOrders = useOrdersStore((state) => state.setBuyerOrders);
  const setSellerOrders = useOrdersStore((state) => state.setSellerOrders);
  const setBuyerOrdersLoading = useOrdersStore((state) => state.setBuyerOrdersLoading);
  const setSellerOrdersLoading = useOrdersStore((state) => state.setSellerOrdersLoading);
  const setFoodItems = useListingsStore((state) => state.setFoodItems);
  const setSellerListings = useListingsStore((state) => state.setSellerListings);
  const setListingsLoading = useListingsStore((state) => state.setListingsLoading);
  const setListingsError = useListingsStore((state) => state.setListingsError);

  // Sync hook data into Zustand stores
  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    setStoreProfileData(profileData);
  }, [profileData, setStoreProfileData]);

  useEffect(() => {
    setCart(cart);
  }, [cart, setCart]);

  useEffect(() => {
    setBuyerOrders(buyerOrders);
  }, [buyerOrders, setBuyerOrders]);

  useEffect(() => {
    setSellerOrders(sellerOrders);
  }, [sellerOrders, setSellerOrders]);

  useEffect(() => {
    setBuyerOrdersLoading(buyerOrdersLoading);
  }, [buyerOrdersLoading, setBuyerOrdersLoading]);

  useEffect(() => {
    setSellerOrdersLoading(sellerOrdersLoading);
  }, [sellerOrdersLoading, setSellerOrdersLoading]);

  useEffect(() => {
    setFoodItems(foodItems);
  }, [foodItems, setFoodItems]);

  useEffect(() => {
    setSellerListings(listings);
  }, [listings, setSellerListings]);

  useEffect(() => {
    setListingsLoading(listingsLoading);
  }, [listingsLoading, setListingsLoading]);

  useEffect(() => {
    setListingsError(listingsError);
  }, [listingsError, setListingsError]);

  // Dummy navigation function - navigation is now handled by React Router in the routes
  const noOpNavigation = () => {};

  const wrappedHandleSignOut = () => {
    handleSignOut();
    clearCart();
  };

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
          setProfileData={setProfileData}
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
          addToCart={addToCart}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
