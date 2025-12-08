import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { shouldBypassVerification } from '../config/emailWhitelist';
import { lazy, Suspense, useState, useEffect, type ReactElement } from 'react';
import type { User } from 'firebase/auth';
import LoadingState from '../components/common/LoadingState';
import { useRouteProtection } from '../hooks/useRouteProtection';

type NavigateFn = ReturnType<typeof useNavigate>;

const makeSignOutToHome = (navigate: NavigateFn, handleSignOut: () => Promise<void>) => () => {
  void (async () => {
    await handleSignOut();
    navigate('/');
  })();
};

const makeLogoToBrowse = (navigate: NavigateFn) => () => {
  navigate('/browse');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Lazy load all page components for code splitting
const Home = lazy(() => import('../pages/Home'));
const Signup = lazy(() => import('../pages/Signup'));
const Login = lazy(() => import('../pages/Login'));
const FoodPreview = lazy(() => import('../pages/FoodPreview'));
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
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const VerifyRequired = lazy(() => import('../pages/VerifyRequired'));
import { useSellerProfile } from '../hooks/useSellerProfile';
import type { ProfileData, Order, FoodItem } from '../types';
import { useAuthStore, useCartStore, useNavigationStore } from '../stores';
import { useListingsQuery, useSellerListingsQuery } from '../hooks/queries/useListingsQuery';
import { useBuyerOrdersQuery, useSellerOrdersQuery } from '../hooks/queries/useOrdersQuery';
import {
  useOrderReviewQuery,
  useSellerRatingsQuery,
  useOrderReviewsQuery,
} from '../hooks/queries/useReviewsQuery';

// Simplified interface - data comes from React Query, UI state from Zustand
interface AppRoutesProps {
  // Profile setters (needed for forms)
  setProfileData: (data: ProfileData) => void;

  // Cart actions (still passed from hooks for now)
  addToCart: (item: FoodItem) => void;
  updateCartQuantity: (itemId: number, newQuantity: number) => void;
  removeFromCart: (itemId: number) => void;

  // Auth handlers
  handleCreateProfile: (password: string) => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<boolean>;
  handleSaveProfile: () => Promise<void>;
  handleSignOut: () => Promise<void>;

  // Order handlers
  handlePlaceOrder: (
    paymentMethod: string,
    pickupTimes: Record<string, string>,
    notes?: string
  ) => Promise<void>;
  handleCancelOrder: (orderId: number) => Promise<void>;
  handleUpdateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
  handleSubmitReview: (orderId: number, rating: number, comment: string) => Promise<void>;

  // Listing handlers
  handleCreateListing: () => Promise<void>;
  handleToggleAvailability: (listingId: number | string) => void;
  handleDeleteListing: (listingId: number | string) => void;
  handleUpdateListing: () => Promise<void>;

  // Email verification helpers
  handleResendVerification: () => Promise<void>;
  handleReloadUser: () => Promise<void>;

  // Auth loading state to prevent premature redirects
  authLoading: boolean;
}

// Loading fallback component for lazy loaded routes
const PageLoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B]">
    <LoadingState variant="spinner" size="lg" text="Loading page..." />
  </div>
);

export const RequireAuth = ({
  children,
  user,
  loading,
}: {
  children: ReactElement;
  user: User | null;
  loading: boolean;
}) => {
  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.email && !user.emailVerified && !shouldBypassVerification(user.email)) {
    return <Navigate to="/verify-required" replace />;
  }

  return <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>;
};

const HomeWrapper = () => {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Home
        onGetStarted={() => navigate('/signup')}
        onLogin={() => navigate('/login')}
        onBrowseFood={() => navigate('/preview')}
      />
    </Suspense>
  );
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

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Login onLogin={handleLoginWithNavigation} onGoToSignup={() => navigate('/signup')} />
    </Suspense>
  );
};

const SignupWrapper = (props: Pick<AppRoutesProps, 'setProfileData' | 'handleCreateProfile'>) => {
  const navigate = useNavigate();

  // Use local state initialized with empty data for new signups
  const [localProfileData, setLocalProfileData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    studentId: '',
    bio: '',
    photo: null,
    isSeller: false,
  });

  // Sync local changes to parent state for profile creation
  useEffect(() => {
    props.setProfileData(localProfileData);
  }, [localProfileData, props]);

  const handleSignupWithNavigation = async (password: string) => {
    await props.handleCreateProfile(password);
    navigate('/browse');
  };

  const handleProfileDataChange = (data: ProfileData) => {
    setLocalProfileData(data as typeof localProfileData);
  };

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Signup
        profileData={localProfileData as ProfileData}
        setProfileData={handleProfileDataChange}
        onCreateProfile={handleSignupWithNavigation}
        onGoToLogin={() => navigate('/login')}
        onBrowseFood={() => navigate('/preview')}
      />
    </Suspense>
  );
};

const FoodPreviewWrapper = () => {
  const navigate = useNavigate();

  // Get data from React Query (no auth required)
  const {
    data: foodItems = [],
    isLoading: listingsLoading,
    error: listingsError,
  } = useListingsQuery();

  // Get unique seller IDs and fetch their ratings
  const sellerIds = [...new Set(foodItems.map((item) => item.sellerId))];
  const { data: sellerRatings = {} } = useSellerRatingsQuery(sellerIds);

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <FoodPreview
        foodItems={foodItems}
        sellerRatings={sellerRatings}
        loading={listingsLoading}
        error={listingsError?.message || null}
        onSignUp={() => navigate('/signup')}
        onLogin={() => navigate('/login')}
        onBack={() => navigate('/')}
      />
    </Suspense>
  );
};

const BrowseWrapper = (props: Pick<AppRoutesProps, 'addToCart' | 'handleSignOut'>) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from React Query
  const {
    data: foodItems = [],
    isLoading: listingsLoading,
    error: listingsError,
  } = useListingsQuery();

  // Get unique seller IDs and fetch their ratings
  const sellerIds = [...new Set(foodItems.map((item) => item.sellerId))];
  const { data: sellerRatings = {} } = useSellerRatingsQuery(sellerIds);

  // Get UI state from stores
  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);
  const searchQuery = useNavigationStore((state) => state.searchQuery);
  const setSearchQuery = useNavigationStore((state) => state.setSearchQuery);
  const selectedLocation = useNavigationStore((state) => state.selectedLocation);
  const setSelectedLocation = useNavigationStore((state) => state.setSelectedLocation);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  return (
    <Browse
      foodItems={foodItems}
      sellerRatings={sellerRatings}
      cart={cart}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedLocation={selectedLocation}
      setSelectedLocation={setSelectedLocation}
      addToCart={props.addToCart}
      profileData={profileData}
      userMode={userMode}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onViewProfile={(sellerId) => navigate(`/seller/${sellerId}`)}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') {
          navigate('/seller/dashboard');
        }
      }}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => {
        logoToBrowse();
      }}
      loading={listingsLoading}
      error={listingsError?.message || null}
    />
  );
};

const UserProfileWrapper = (
  props: Pick<AppRoutesProps, 'setProfileData' | 'handleSaveProfile' | 'handleSignOut'>
) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

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
        signOutToHome();
      }}
      onBack={() => navigate('/browse')}
      userMode={userMode}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') {
          navigate('/seller/dashboard');
        }
      }}
      onLogoClick={() => {
        logoToBrowse();
      }}
    />
  );
};

const ViewSellerProfileWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const navigate = useNavigate();
  const { sellerId } = useParams<{ sellerId: string }>();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  return (
    <ViewProfileWrapper
      sellerId={sellerId || ''}
      currentUserProfile={profileData}
      cart={cart}
      userMode={userMode}
      onBack={() => navigate('/browse')}
      onSignOut={() => {
        signOutToHome();
      }}
      onCartClick={() => navigate('/cart')}
      onProfileClick={() => navigate('/profile')}
      onLogoClick={() => {
        logoToBrowse();
      }}
    />
  );
};

const CartWrapper = (
  props: Pick<AppRoutesProps, 'updateCartQuantity' | 'removeFromCart' | 'handleSignOut'>
) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from stores
  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  return (
    <Cart
      cart={cart}
      profileData={profileData}
      onUpdateQuantity={props.updateCartQuantity}
      onRemoveItem={props.removeFromCart}
      onCheckout={() => navigate('/checkout')}
      onContinueShopping={() => navigate('/browse')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') {
          navigate('/seller/dashboard');
        }
      }}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      userMode={userMode}
      onLogoClick={() => {
        logoToBrowse();
      }}
    />
  );
};

const CheckoutWrapper = (props: Pick<AppRoutesProps, 'handlePlaceOrder' | 'handleSignOut'>) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from stores
  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

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
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      userMode={userMode}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/browse');
        }
      }}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => {
        logoToBrowse();
      }}
    />
  );
};

const UserOrdersWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: buyerOrders = [], isLoading: buyerOrdersLoading } = useBuyerOrdersQuery(user?.uid);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  // Calculate pending orders count for seller mode
  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'pending').length;

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
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') {
          navigate('/seller/dashboard');
        }
      }}
      onLogoClick={() => {
        logoToBrowse();
      }}
      loading={buyerOrdersLoading}
      onAddToCart={addToCart}
      pendingOrdersCount={pendingOrdersCount}
    />
  );
};

const OrderDetailsWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleCancelOrder' | 'handleSubmitReview'>
) => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: buyerOrders = [], isLoading: buyerOrdersLoading } = useBuyerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const userMode = useNavigationStore((state) => state.userMode);

  const order = buyerOrders.find((o) => o.id === parseInt(orderId || '0'));
  const { sellerProfile } = useSellerProfile(order?.sellerId);

  // Fetch the review if order has been reviewed
  const { data: review } = useOrderReviewQuery(order?.hasReview ? order.firebaseId : undefined);

  if (buyerOrdersLoading) {
    return <PageLoadingFallback />;
  }

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <OrderDetails
      order={order}
      review={review || undefined}
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
      onSubmitReview={props.handleSubmitReview}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      userMode={userMode}
      onLogoClick={() => {
        logoToBrowse();
      }}
      onAddToCart={addToCart}
    />
  );
};

const SellerDashboardWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: listings = [], isLoading: listingsLoading } = useSellerListingsQuery(user?.uid);
  const { data: sellerOrders = [], isLoading: sellerOrdersLoading } = useSellerOrdersQuery(
    user?.uid
  );

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  // Calculate pending orders count
  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'pending').length;

  if (listingsLoading || sellerOrdersLoading) {
    return <PageLoadingFallback />;
  }

  return (
    <SellerDashboard
      profileData={profileData}
      cart={cart}
      listings={listings}
      incomingOrders={sellerOrders}
      userMode={userMode}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'buyer') {
          navigate('/browse');
        }
      }}
      onCreateListing={() => navigate('/seller/listings/create')}
      onViewListings={() => navigate('/seller/listings')}
      onViewOrders={() => navigate('/seller/orders')}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => {
        logoToBrowse();
      }}
      pendingOrdersCount={pendingOrdersCount}
    />
  );
};

const CreateListingWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleCreateListing'>
) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  // Calculate pending orders count
  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'pending').length;

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
        if (mode === 'buyer') {
          navigate('/browse');
        }
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => {
        logoToBrowse();
      }}
      pendingOrdersCount={pendingOrdersCount}
    />
  );
};

const EditListingWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleUpdateListing'>
) => {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  // Calculate pending orders count
  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'pending').length;

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
        if (mode === 'buyer') {
          navigate('/browse');
        }
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => {
        logoToBrowse();
      }}
      pendingOrdersCount={pendingOrdersCount}
    />
  );
};

const SellerListingsWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleToggleAvailability' | 'handleDeleteListing'>
) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: listings = [] } = useSellerListingsQuery(user?.uid);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  // Calculate pending orders count
  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'pending').length;

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
        if (mode === 'buyer') {
          navigate('/browse');
        }
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => {
        logoToBrowse();
      }}
      pendingOrdersCount={pendingOrdersCount}
    />
  );
};

const SellerOrdersWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleUpdateOrderStatus'>
) => {
  const navigate = useNavigate();
  const signOutToHome = makeSignOutToHome(navigate, props.handleSignOut);
  const logoToBrowse = makeLogoToBrowse(navigate);

  // Get data from React Query
  const user = useAuthStore((state) => state.user);
  const { data: sellerOrders = [], isLoading: sellerOrdersLoading } = useSellerOrdersQuery(
    user?.uid
  );

  // Extract order IDs that have reviews
  const orderIdsWithReviews = sellerOrders
    .filter((order) => order.status === 'completed' && order.hasReview)
    .map((order) => order.firebaseId);

  // Fetch reviews for completed orders
  const { data: orderReviews = {} } = useOrderReviewsQuery(orderIdsWithReviews);

  // Get UI state from stores
  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Protect route and auto-switch mode
  useRouteProtection(userMode, setUserMode);

  // Calculate pending orders count
  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'pending').length;

  return (
    <SellerOrders
      profileData={profileData}
      cart={cart}
      incomingOrders={sellerOrders}
      orderReviews={orderReviews}
      userMode={userMode}
      onBackToDashboard={() => navigate('/seller/dashboard')}
      onUpdateOrderStatus={props.handleUpdateOrderStatus}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'buyer') {
          navigate('/browse');
        }
      }}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => {
        logoToBrowse();
      }}
      loading={sellerOrdersLoading}
      pendingOrdersCount={pendingOrdersCount}
    />
  );
};

export const AppRoutes = (props: AppRoutesProps) => {
  const user = useAuthStore((state) => state.user);

  // Prefetch the most commonly visited routes after auth to smooth navigation
  useEffect(() => {
    if (!user) return;

    void Promise.all([
      import('../pages/buyer/Browse'),
      import('../pages/buyer/Cart'),
      import('../pages/buyer/Checkout'),
      import('../pages/buyer/UserOrders'),
      import('../pages/seller/SellerDashboard'),
    ]);
  }, [user]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeWrapper />} />
      <Route path="/preview" element={<FoodPreviewWrapper />} />
      <Route path="/login" element={<LoginWrapper handleLogin={props.handleLogin} />} />
      <Route
        path="/signup"
        element={
          <SignupWrapper
            setProfileData={props.setProfileData}
            handleCreateProfile={props.handleCreateProfile}
          />
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/verify-required"
        element={
          <VerifyRequired
            onResend={props.handleResendVerification}
            onReload={props.handleReloadUser}
          />
        }
      />

      {/* Buyer routes */}
      <Route
        path="/browse"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <BrowseWrapper addToCart={props.addToCart} handleSignOut={props.handleSignOut} />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <UserProfileWrapper
              setProfileData={props.setProfileData}
              handleSaveProfile={props.handleSaveProfile}
              handleSignOut={props.handleSignOut}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/:sellerId"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <ViewSellerProfileWrapper handleSignOut={props.handleSignOut} />
          </RequireAuth>
        }
      />
      <Route
        path="/cart"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <CartWrapper
              updateCartQuantity={props.updateCartQuantity}
              removeFromCart={props.removeFromCart}
              handleSignOut={props.handleSignOut}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/checkout"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <CheckoutWrapper
              handlePlaceOrder={props.handlePlaceOrder}
              handleSignOut={props.handleSignOut}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/orders"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <UserOrdersWrapper handleSignOut={props.handleSignOut} />
          </RequireAuth>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <OrderDetailsWrapper
              handleSignOut={props.handleSignOut}
              handleCancelOrder={props.handleCancelOrder}
              handleSubmitReview={props.handleSubmitReview}
            />
          </RequireAuth>
        }
      />

      {/* Seller routes */}
      <Route
        path="/seller/dashboard"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <SellerDashboardWrapper handleSignOut={props.handleSignOut} />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/listings/create"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <CreateListingWrapper
              handleSignOut={props.handleSignOut}
              handleCreateListing={props.handleCreateListing}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/listings/:listingId/edit"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <EditListingWrapper
              handleSignOut={props.handleSignOut}
              handleUpdateListing={props.handleUpdateListing}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/listings"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <SellerListingsWrapper
              handleSignOut={props.handleSignOut}
              handleToggleAvailability={props.handleToggleAvailability}
              handleDeleteListing={props.handleDeleteListing}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <RequireAuth user={user} loading={props.authLoading}>
            <SellerOrdersWrapper
              handleSignOut={props.handleSignOut}
              handleUpdateOrderStatus={props.handleUpdateOrderStatus}
            />
          </RequireAuth>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={user ? '/browse' : '/'} replace />} />
    </Routes>
  );
};
