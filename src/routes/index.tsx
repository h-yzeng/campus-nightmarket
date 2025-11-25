import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import type { User } from 'firebase/auth';
import Home from '../pages/Home';
import Signup from '../pages/Signup';
import Login from '../pages/Login';
import Browse from '../pages/buyer/Browse';
import UserProfile from '../pages/UserProfile';
import Cart from '../pages/buyer/Cart';
import Checkout from '../pages/buyer/Checkout';
import UserOrders from '../pages/buyer/UserOrders';
import OrderDetails from '../pages/buyer/OrderDetails';
import SellerDashboard from '../pages/seller/SellerDashboard';
import CreateListing from '../pages/seller/CreateListing';
import EditListing from '../pages/seller/EditListing';
import SellerListings from '../pages/seller/SellerListings';
import SellerOrders from '../pages/seller/SellerOrders';
import ViewProfileWrapper from '../pages/buyer/ViewProfileWrapper';
import { useSellerProfile } from '../hooks/useSellerProfile';
import type { ProfileData, Order, FoodItem } from '../types';
import {
  useAuthStore,
  useCartStore,
  useNavigationStore,
} from '../stores';
import { useListingsQuery, useSellerListingsQuery } from '../hooks/queries/useListingsQuery';
import { useBuyerOrdersQuery, useSellerOrdersQuery } from '../hooks/queries/useOrdersQuery';

// Simplified interface - data comes from React Query, UI state from Zustand
interface AppRoutesProps {
  // Profile setters (needed for forms)
  setProfileData: (data: ProfileData) => void;

  // Cart actions (still passed from hooks for now)
  addToCart: (item: FoodItem) => void;
  updateCartQuantity: (itemId: number, newQuantity: number) => void;
  removeFromCart: (itemId: number) => void;

  // Auth handlers
  handleCreateProfile: () => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<boolean>;
  handleSaveProfile: () => Promise<void>;
  handleSignOut: () => void;

  // Order handlers
  handlePlaceOrder: (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) => Promise<void>;
  handleCancelOrder: (orderId: number) => Promise<void>;
  handleUpdateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;

  // Listing handlers
  handleCreateListing: () => Promise<void>;
  handleToggleAvailability: (listingId: number) => void;
  handleDeleteListing: (listingId: number | string) => void;
  handleUpdateListing: () => Promise<void>;
}

const RequireAuth = ({ children, user }: { children: ReactElement; user: User | null }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const HomeWrapper = () => {
  const navigate = useNavigate();
  return <Home onGetStarted={() => navigate('/signup')} onLogin={() => navigate('/login')} />;
};

const LoginWrapper = (props: Pick<AppRoutesProps, 'handleLogin'>) => {
  const navigate = useNavigate();

  const handleLoginWithNavigation = async (email: string, password: string) => {
    const success = await props.handleLogin(email, password);
    if (success) {
      navigate('/browse');
    }
    return success;
  };

  return <Login onLogin={handleLoginWithNavigation} onGoToSignup={() => navigate('/signup')} />;
};

const SignupWrapper = (props: Pick<AppRoutesProps, 'setProfileData' | 'handleCreateProfile'>) => {
  const navigate = useNavigate();
  const profileData = useAuthStore((state) => state.profileData);

  const handleSignupWithNavigation = async () => {
    await props.handleCreateProfile();
    navigate('/browse');
  };

  return (
    <Signup
      profileData={profileData}
      setProfileData={props.setProfileData}
      onCreateProfile={handleSignupWithNavigation}
      onGoToLogin={() => navigate('/login')}
    />
  );
};

const BrowseWrapper = (props: Pick<AppRoutesProps, 'addToCart'>) => {
  const navigate = useNavigate();

  // Get data from React Query
  const { data: foodItems = [], isLoading: listingsLoading, error: listingsError } = useListingsQuery();

  // Get UI state from stores
  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);
  const searchQuery = useNavigationStore((state) => state.searchQuery);
  const setSearchQuery = useNavigationStore((state) => state.setSearchQuery);
  const selectedLocation = useNavigationStore((state) => state.selectedLocation);
  const setSelectedLocation = useNavigationStore((state) => state.setSelectedLocation);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <Browse
      foodItems={foodItems}
      cart={cart}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedLocation={selectedLocation}
      setSelectedLocation={setSelectedLocation}
      addToCart={props.addToCart}
      profileData={profileData}
      userMode={userMode}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => navigate('/')}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onViewProfile={(sellerId) => navigate(`/seller/${sellerId}`)}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') navigate('/seller/dashboard');
      }}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => navigate('/browse')}
      loading={listingsLoading}
      error={listingsError?.message || null}
    />
  );
};

const UserProfileWrapper = (props: Pick<AppRoutesProps, 'setProfileData' | 'handleSaveProfile' | 'handleSignOut'>) => {
  const navigate = useNavigate();

  // Get data from stores
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <UserProfile
      profileData={profileData}
      setProfileData={props.setProfileData}
      onSaveProfile={props.handleSaveProfile}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onBack={() => navigate('/browse')}
      userMode={userMode}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') navigate('/seller/dashboard');
      }}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const ViewSellerProfileWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const navigate = useNavigate();
  const { sellerId } = useParams<{ sellerId: string }>();

  // Get data from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);

  return (
    <ViewProfileWrapper
      sellerId={sellerId || ''}
      currentUserProfile={profileData}
      cart={cart}
      userMode={userMode}
      onBack={() => navigate('/browse')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onCartClick={() => navigate('/cart')}
      onProfileClick={() => navigate('/profile')}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const CartWrapper = (props: Pick<AppRoutesProps, 'updateCartQuantity' | 'removeFromCart' | 'handleSignOut'>) => {
  const navigate = useNavigate();

  // Get data from stores
  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <Cart
      cart={cart}
      profileData={profileData}
      onUpdateQuantity={props.updateCartQuantity}
      onRemoveItem={props.removeFromCart}
      onCheckout={() => navigate('/checkout')}
      onContinueShopping={() => navigate('/browse')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') navigate('/seller/dashboard');
      }}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      userMode={userMode}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const CheckoutWrapper = (props: Pick<AppRoutesProps, 'handlePlaceOrder' | 'handleSignOut'>) => {
  const navigate = useNavigate();

  // Get data from stores
  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);

  return (
    <Checkout
      cart={cart}
      profileData={profileData}
      onBackToCart={() => navigate('/cart')}
      onPlaceOrder={async (paymentMethod, pickupTimes, notes) => {
        await props.handlePlaceOrder(paymentMethod, pickupTimes, notes);
        navigate('/orders');
      }}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      userMode={userMode}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const UserOrdersWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const navigate = useNavigate();

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: buyerOrders = [], isLoading: buyerOrdersLoading } = useBuyerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <UserOrders
      orders={buyerOrders}
      profileData={profileData}
      cart={cart}
      userMode={userMode}
      onViewOrderDetails={(orderId) => navigate(`/orders/${orderId}`)}
      onBackToBrowse={() => navigate('/browse')}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') navigate('/seller/dashboard');
      }}
      onLogoClick={() => navigate('/browse')}
      loading={buyerOrdersLoading}
    />
  );
};

const OrderDetailsWrapper = (props: Pick<AppRoutesProps, 'handleSignOut' | 'handleCancelOrder'>) => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: buyerOrders = [] } = useBuyerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);

  const order = buyerOrders.find(o => o.id === parseInt(orderId || '0'));
  const { sellerProfile } = useSellerProfile(order?.sellerId);

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <OrderDetails
      order={order}
      sellerPhone={sellerProfile?.sellerInfo?.phone}
      sellerEmail={sellerProfile?.email}
      sellerCashApp={sellerProfile?.sellerInfo?.paymentMethods?.cashApp}
      sellerVenmo={sellerProfile?.sellerInfo?.paymentMethods?.venmo}
      sellerZelle={sellerProfile?.sellerInfo?.paymentMethods?.zelle}
      profileData={profileData}
      cart={cart}
      onBackToOrders={() => navigate('/orders')}
      onCancelOrder={async (orderId) => {
        await props.handleCancelOrder(orderId);
        navigate('/orders');
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      userMode={userMode}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const SellerDashboardWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const navigate = useNavigate();

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: listings = [] } = useSellerListingsQuery(user?.uid);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <SellerDashboard
      profileData={profileData}
      cart={cart}
      listings={listings}
      incomingOrders={sellerOrders}
      userMode={userMode}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'buyer') navigate('/browse');
      }}
      onCreateListing={() => navigate('/seller/listings/create')}
      onViewListings={() => navigate('/seller/listings')}
      onViewOrders={() => navigate('/seller/orders')}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const CreateListingWrapper = (props: Pick<AppRoutesProps, 'handleSignOut' | 'handleCreateListing'>) => {
  const navigate = useNavigate();

  // Get data from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <CreateListing
      profileData={profileData}
      cart={cart}
      userMode={userMode}
      onBackToDashboard={() => navigate('/seller/dashboard')}
      onCreateListing={async () => {
        await props.handleCreateListing();
        navigate('/seller/listings');
      }}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'buyer') navigate('/browse');
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const EditListingWrapper = (props: Pick<AppRoutesProps, 'handleSignOut' | 'handleUpdateListing'>) => {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();

  // Get data from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <EditListing
      listingId={listingId || ''}
      profileData={profileData}
      cart={cart}
      userMode={userMode}
      onBackToListings={() => navigate('/seller/listings')}
      onUpdateListing={async () => {
        await props.handleUpdateListing();
        navigate('/seller/listings');
      }}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'buyer') navigate('/browse');
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const SellerListingsWrapper = (props: Pick<AppRoutesProps, 'handleSignOut' | 'handleToggleAvailability' | 'handleDeleteListing'>) => {
  const navigate = useNavigate();

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: listings = [] } = useSellerListingsQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <SellerListings
      profileData={profileData}
      cart={cart}
      listings={listings}
      userMode={userMode}
      onBackToDashboard={() => navigate('/seller/dashboard')}
      onToggleAvailability={props.handleToggleAvailability}
      onDeleteListing={props.handleDeleteListing}
      onEditListing={(listingId) => navigate(`/seller/listings/${listingId}/edit`)}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'buyer') navigate('/browse');
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const SellerOrdersWrapper = (props: Pick<AppRoutesProps, 'handleSignOut' | 'handleUpdateOrderStatus'>) => {
  const navigate = useNavigate();

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: sellerOrders = [], isLoading: sellerOrdersLoading } = useSellerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  return (
    <SellerOrders
      profileData={profileData}
      cart={cart}
      incomingOrders={sellerOrders}
      userMode={userMode}
      onBackToDashboard={() => navigate('/seller/dashboard')}
      onUpdateOrderStatus={props.handleUpdateOrderStatus}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'buyer') navigate('/browse');
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => navigate('/browse')}
      loading={sellerOrdersLoading}
    />
  );
};

export const AppRoutes = (props: AppRoutesProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeWrapper />} />
      <Route path="/login" element={<LoginWrapper handleLogin={props.handleLogin} />} />
      <Route path="/signup" element={<SignupWrapper setProfileData={props.setProfileData} handleCreateProfile={props.handleCreateProfile} />} />

      {/* Buyer routes */}
      <Route path="/browse" element={<RequireAuth user={user}><BrowseWrapper addToCart={props.addToCart} /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth user={user}><UserProfileWrapper setProfileData={props.setProfileData} handleSaveProfile={props.handleSaveProfile} handleSignOut={props.handleSignOut} /></RequireAuth>} />
      <Route path="/seller/:sellerId" element={<RequireAuth user={user}><ViewSellerProfileWrapper handleSignOut={props.handleSignOut} /></RequireAuth>} />
      <Route path="/cart" element={<RequireAuth user={user}><CartWrapper updateCartQuantity={props.updateCartQuantity} removeFromCart={props.removeFromCart} handleSignOut={props.handleSignOut} /></RequireAuth>} />
      <Route path="/checkout" element={<RequireAuth user={user}><CheckoutWrapper handlePlaceOrder={props.handlePlaceOrder} handleSignOut={props.handleSignOut} /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth user={user}><UserOrdersWrapper handleSignOut={props.handleSignOut} /></RequireAuth>} />
      <Route path="/orders/:orderId" element={<RequireAuth user={user}><OrderDetailsWrapper handleSignOut={props.handleSignOut} handleCancelOrder={props.handleCancelOrder} /></RequireAuth>} />

      {/* Seller routes */}
      <Route path="/seller/dashboard" element={<RequireAuth user={user}><SellerDashboardWrapper handleSignOut={props.handleSignOut} /></RequireAuth>} />
      <Route path="/seller/listings/create" element={<RequireAuth user={user}><CreateListingWrapper handleSignOut={props.handleSignOut} handleCreateListing={props.handleCreateListing} /></RequireAuth>} />
      <Route path="/seller/listings/:listingId/edit" element={<RequireAuth user={user}><EditListingWrapper handleSignOut={props.handleSignOut} handleUpdateListing={props.handleUpdateListing} /></RequireAuth>} />
      <Route path="/seller/listings" element={<RequireAuth user={user}><SellerListingsWrapper handleSignOut={props.handleSignOut} handleToggleAvailability={props.handleToggleAvailability} handleDeleteListing={props.handleDeleteListing} /></RequireAuth>} />
      <Route path="/seller/orders" element={<RequireAuth user={user}><SellerOrdersWrapper handleSignOut={props.handleSignOut} handleUpdateOrderStatus={props.handleUpdateOrderStatus} /></RequireAuth>} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={user ? "/browse" : "/"} replace />} />
    </Routes>
  );
};
