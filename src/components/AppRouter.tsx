import { lazy, Suspense } from 'react';
import type { ProfileData, CartItem, Order, ListingWithFirebaseId, UserMode } from '../types';
import type { PageType } from '../hooks/useNavigation';
import { useSellerProfile } from '../hooks/useSellerProfile';
import type { FoodItem } from '../types';
import LoadingSpinner from './LoadingSpinner';

// Code splitting: Lazy load all page components
const Home = lazy(() => import('../pages/Home'));
const Signup = lazy(() => import('../pages/Signup'));
const Login = lazy(() => import('../pages/Login'));
const Browse = lazy(() => import('../pages/buyer/Browse'));
const UserProfile = lazy(() => import('../pages/UserProfile'));
const Cart = lazy(() => import('../pages/buyer/Cart'));
const Checkout = lazy(() => import('../pages/buyer/Checkout'));
const UserOrders = lazy(() => import('../pages/buyer/UserOrders'));
const OrderDetails = lazy(() => import('../pages/buyer/OrderDetails'));
const SellerDashboard = lazy(() => import('../pages/seller/SellerDashboard'));
const CreateListing = lazy(() => import('../pages/seller/CreateListing'));
const EditListing = lazy(() => import('../pages/seller/EditListing'));
const SellerListings = lazy(() => import('../pages/seller/SellerListings'));
const SellerOrders = lazy(() => import('../pages/seller/SellerOrders'));
const ViewProfileWrapper = lazy(() => import('../pages/buyer/ViewProfileWrapper'));

interface AppRouterProps {
  currentPage: PageType;
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  cart: CartItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedOrderId: number;
  selectedListingId: string;
  selectedSellerId: string;
  userMode: UserMode;
  buyerOrders: Order[];
  sellerOrders: Order[];
  listings: ListingWithFirebaseId[];
  foodItems: FoodItem[];
  listingsLoading: boolean;
  listingsError: string | null;
  buyerOrdersLoading: boolean;
  sellerOrdersLoading: boolean;

  // Navigation handlers
  handleGetStarted: () => void;
  handleGoToLogin: () => void;
  handleGoToSignup: () => void;
  handleGoToProfile: () => void;
  handleBackToBrowse: () => void;
  handleCartClick: () => void;
  handleBackToCart: () => void;
  handleGoToOrders: () => void;
  handleGoToSellerDashboard: () => void;
  handleGoToCreateListing: () => void;
  handleGoToSellerListings: () => void;
  handleGoToSellerOrders: () => void;
  handleBackToSellerListings: () => void;
  handleModeChange: (mode: UserMode) => void;
  handleViewProfile: (sellerName: string) => void;
  handleViewOrderDetails: (orderId: number) => void;

  handleCreateProfile: () => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<boolean>;
  handleSaveProfile: () => Promise<void>;
  handleSignOutWithReset: () => void;
  addToCart: (item: FoodItem) => void;
  updateCartQuantity: (itemId: number, newQuantity: number) => void;
  removeFromCart: (itemId: number) => void;
  handleCheckout: () => void;
  handlePlaceOrder: (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) => Promise<void>;
  handleCancelOrder: (orderId: number) => Promise<void>;
  handleCreateListing: () => Promise<void>;
  handleToggleAvailability: (listingId: number) => void;
  handleDeleteListing: (listingId: number | string) => void;
  handleEditListing: (listingId: number | string) => void;
  handleUpdateListing: () => Promise<void>;
  handleUpdateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
}

export const AppRouter = ({
  currentPage,
  profileData,
  setProfileData,
  cart,
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  selectedOrderId,
  selectedListingId,
  selectedSellerId,
  userMode,
  buyerOrders,
  sellerOrders,
  listings,
  foodItems,
  listingsLoading,
  listingsError,
  buyerOrdersLoading,
  sellerOrdersLoading,
  handleGetStarted,
  handleGoToLogin,
  handleGoToSignup,
  handleGoToProfile,
  handleBackToBrowse,
  handleCartClick,
  handleBackToCart,
  handleGoToOrders,
  handleGoToSellerDashboard,
  handleGoToCreateListing,
  handleGoToSellerListings,
  handleGoToSellerOrders,
  handleBackToSellerListings,
  handleModeChange,
  handleViewProfile,
  handleViewOrderDetails,
  handleCreateProfile,
  handleLogin,
  handleSaveProfile,
  handleSignOutWithReset,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  handleCheckout,
  handlePlaceOrder,
  handleCancelOrder,
  handleCreateListing,
  handleToggleAvailability,
  handleDeleteListing,
  handleEditListing,
  handleUpdateListing,
  handleUpdateOrderStatus,
}: AppRouterProps) => {
  // Get the current order if viewing order details
  const currentOrder = currentPage === 'orderDetails'
    ? buyerOrders.find(o => o.id === selectedOrderId)
    : undefined;

  // Fetch seller profile for order details page
  const { sellerProfile } = useSellerProfile(currentOrder?.sellerId);

  return (
    <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
      {currentPage === 'home' && <Home onGetStarted={handleGetStarted} onLogin={handleGoToLogin} />}

      {currentPage === 'login' && <Login onLogin={handleLogin} onGoToSignup={handleGoToSignup} />}

      {currentPage === 'signup' && (
        <Signup
          profileData={profileData}
          setProfileData={setProfileData}
          onCreateProfile={handleCreateProfile}
          onGoToLogin={handleGoToLogin}
        />
      )}

      {currentPage === 'profile' && (
        <UserProfile
          profileData={profileData}
          setProfileData={setProfileData}
          onSaveProfile={handleSaveProfile}
          onSignOut={handleSignOutWithReset}
          onBack={handleBackToBrowse}
          userMode={userMode}
          onOrdersClick={handleGoToOrders}
          onSellerDashboardClick={handleGoToSellerDashboard}
          onModeChange={handleModeChange}
        />
      )}

      {currentPage === 'viewProfile' && (
        <ViewProfileWrapper
          sellerId={selectedSellerId}
          currentUserProfile={profileData}
          cart={cart}
          userMode={userMode}
          onBack={handleBackToBrowse}
          onSignOut={handleSignOutWithReset}
          onCartClick={handleCartClick}
          onProfileClick={handleGoToProfile}
          onLogoClick={handleBackToBrowse}
        />
      )}

      {currentPage === 'browse' && (
        <Browse
          foodItems={foodItems}
          cart={cart}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          addToCart={addToCart}
          profileData={profileData}
          userMode={userMode}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          onOrdersClick={handleGoToOrders}
          onViewProfile={handleViewProfile}
          onModeChange={handleModeChange}
          onSellerDashboardClick={handleGoToSellerDashboard}
          onLogoClick={handleBackToBrowse}
          loading={listingsLoading}
          error={listingsError}
        />
      )}

      {currentPage === 'userOrders' && (
        <UserOrders
          orders={buyerOrders}
          profileData={profileData}
          cart={cart}
          userMode={userMode}
          onViewOrderDetails={handleViewOrderDetails}
          onBackToBrowse={handleBackToBrowse}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          onOrdersClick={handleGoToOrders}
          onSellerDashboardClick={handleGoToSellerDashboard}
          onModeChange={handleModeChange}
          onLogoClick={handleBackToBrowse}
          loading={buyerOrdersLoading}
        />
      )}

      {currentPage === 'cart' && (
        <Cart
          cart={cart}
          profileData={profileData}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          onContinueShopping={handleBackToBrowse}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          userMode={userMode}
          onLogoClick={handleBackToBrowse}
        />
      )}

      {currentPage === 'checkout' && (
        <Checkout
          cart={cart}
          profileData={profileData}
          onBackToCart={handleBackToCart}
          onPlaceOrder={handlePlaceOrder}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          userMode={userMode}
          onLogoClick={handleBackToBrowse}
        />
      )}

      {currentPage === 'orderDetails' && currentOrder && (
        <OrderDetails
          order={currentOrder}
          sellerPhone={sellerProfile?.sellerInfo?.phone}
          sellerEmail={sellerProfile?.email}
          sellerCashApp={sellerProfile?.sellerInfo?.paymentMethods?.cashApp}
          sellerVenmo={sellerProfile?.sellerInfo?.paymentMethods?.venmo}
          sellerZelle={sellerProfile?.sellerInfo?.paymentMethods?.zelle}
          profileData={profileData}
          cart={cart}
          onBackToOrders={handleGoToOrders}
          onCancelOrder={handleCancelOrder}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          userMode={userMode}
          onLogoClick={handleBackToBrowse}
        />
      )}

      {currentPage === 'sellerDashboard' && (
        <SellerDashboard
          profileData={profileData}
          cart={cart}
          listings={listings}
          incomingOrders={sellerOrders}
          userMode={userMode}
          onModeChange={handleModeChange}
          onCreateListing={handleGoToCreateListing}
          onViewListings={handleGoToSellerListings}
          onViewOrders={handleGoToSellerOrders}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          onOrdersClick={handleGoToOrders}
          onSellerDashboardClick={handleGoToSellerDashboard}
          onLogoClick={handleBackToBrowse}
        />
      )}

      {currentPage === 'createListing' && (
        <CreateListing
          profileData={profileData}
          cart={cart}
          userMode={userMode}
          onBackToDashboard={handleGoToSellerDashboard}
          onCreateListing={handleCreateListing}
          onModeChange={handleModeChange}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          onOrdersClick={handleGoToOrders}
          onSellerDashboardClick={handleGoToSellerDashboard}
          onLogoClick={handleBackToBrowse}
        />
      )}

      {currentPage === 'editListing' && (
        <EditListing
          listingId={selectedListingId}
          profileData={profileData}
          cart={cart}
          userMode={userMode}
          onBackToListings={handleBackToSellerListings}
          onUpdateListing={handleUpdateListing}
          onModeChange={handleModeChange}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          onOrdersClick={handleGoToOrders}
          onSellerDashboardClick={handleGoToSellerDashboard}
          onLogoClick={handleBackToBrowse}
        />
      )}

      {currentPage === 'sellerListings' && (
        <SellerListings
          profileData={profileData}
          cart={cart}
          listings={listings}
          userMode={userMode}
          onBackToDashboard={handleGoToSellerDashboard}
          onToggleAvailability={handleToggleAvailability}
          onDeleteListing={handleDeleteListing}
          onEditListing={handleEditListing}
          onModeChange={handleModeChange}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          onOrdersClick={handleGoToOrders}
          onSellerDashboardClick={handleGoToSellerDashboard}
          onLogoClick={handleBackToBrowse}
        />
      )}

      {currentPage === 'sellerOrders' && (
        <SellerOrders
          profileData={profileData}
          cart={cart}
          incomingOrders={sellerOrders}
          userMode={userMode}
          onBackToDashboard={handleGoToSellerDashboard}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onModeChange={handleModeChange}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          onOrdersClick={handleGoToOrders}
          onSellerDashboardClick={handleGoToSellerDashboard}
          onLogoClick={handleBackToBrowse}
          loading={sellerOrdersLoading}
        />
      )}
    </Suspense>
  );
};
