import { lazy, useState } from 'react';
import { Route, useParams, Navigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { RequireAuth, PageLoadingFallback, useNavBasics } from './shared';
import type { AppRoutesProps } from './types';
import { useRouteProtection } from '../hooks/auth/useRouteProtection';
import { useSellerProfile } from '../hooks/data/useSellerProfile';
import { useInfiniteListingsQuery } from '../hooks/queries/useListingsQuery';
import { useSellerRatingsQuery } from '../hooks/queries/useReviewsQuery';
import { useBuyerOrdersQuery, useSellerOrdersQuery } from '../hooks/queries/useOrdersQuery';
import { useOrderReviewQuery } from '../hooks/queries/useReviewsQuery';
import { useCartStore, useAuthStore, useNavigationStore } from '../stores';
import SellerOnboarding from '../components/onboarding/SellerOnboarding';
import { updateUserProfile } from '../services/auth/userService';
import { logger } from '../utils/logger';

const Browse = lazy(() => import('../pages/buyer/Browse'));
const UserProfile = lazy(() => import('../pages/shared/UserProfile'));
const ViewProfileWrapper = lazy(() => import('../pages/buyer/ViewProfileWrapper'));
const Cart = lazy(() => import('../pages/buyer/Cart'));
const Checkout = lazy(() => import('../pages/buyer/Checkout'));
const UserOrders = lazy(() => import('../pages/buyer/UserOrders'));
const OrderDetails = lazy(() => import('../pages/buyer/OrderDetails'));
const Favorites = lazy(() => import('../pages/buyer/Favorites'));

// eslint-disable-next-line react-refresh/only-export-components
const BrowseWrapper = (
  props: Pick<AppRoutesProps, 'addToCart' | 'handleSignOut' | 'setProfileData'>
) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);
  const [showSellerOnboarding, setShowSellerOnboarding] = useState(false);

  const {
    data: listingsData,
    isLoading: listingsLoading,
    error: listingsError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteListingsQuery(20);

  // Flatten paginated results into single array
  const foodItems = listingsData?.pages.flatMap((page) => page.listings) ?? [];

  const sellerIds = [...new Set(foodItems.map((item) => item.sellerId))];
  const { data: sellerRatings = {} } = useSellerRatingsQuery(sellerIds);

  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const setProfileData = useAuthStore((state) => state.setProfileData);
  const user = useAuthStore((state) => state.user);
  const userMode = useNavigationStore((state) => state.userMode);
  const searchQuery = useNavigationStore((state) => state.searchQuery);
  const setSearchQuery = useNavigationStore((state) => state.setSearchQuery);
  const selectedLocation = useNavigationStore((state) => state.selectedLocation);
  const setSelectedLocation = useNavigationStore((state) => state.setSelectedLocation);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  useRouteProtection(userMode, setUserMode);

  const handleSellerOnboardingComplete = async (sellerInfo: {
    phone: string;
    paymentMethods: {
      cashApp?: string;
      venmo?: string;
      zelle?: string;
    };
    preferredLocations: string[];
  }) => {
    if (!user) return;

    try {
      const updatedProfile = {
        ...profileData,
        isSeller: true,
        sellerInfo,
      };

      await updateUserProfile(user.uid, {
        isSeller: true,
        sellerInfo,
      });

      setProfileData(updatedProfile);
      props.setProfileData(updatedProfile);
      setShowSellerOnboarding(false);
      setUserMode('seller');
      navigate('/seller/dashboard');
    } catch (error) {
      logger.error('Error completing seller onboarding:', error);
    }
  };

  return (
    <>
      {showSellerOnboarding && (
        <SellerOnboarding
          onComplete={handleSellerOnboardingComplete}
          onCancel={() => setShowSellerOnboarding(false)}
        />
      )}
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
        onFavoritesClick={() => navigate('/favorites')}
        onViewProfile={(sellerId) => navigate(`/seller/${sellerId}`)}
        onModeChange={(mode) => {
          setUserMode(mode);
          if (mode === 'seller') {
            navigate('/seller/dashboard');
          }
        }}
        onShowSellerOnboarding={() => setShowSellerOnboarding(true)}
        onSellerDashboardClick={() => navigate('/seller/dashboard')}
        onLogoClick={() => {
          logoToBrowse();
        }}
        loading={listingsLoading}
        error={listingsError?.message || null}
        onRefresh={refetch}
        onLoadMore={() => void fetchNextPage()}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
      />
    </>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const UserProfileWrapper = (
  props: Pick<AppRoutesProps, 'setProfileData' | 'handleSaveProfile' | 'handleSignOut'>
) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

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

// eslint-disable-next-line react-refresh/only-export-components
const FavoritesWrapper = (props: Pick<AppRoutesProps, 'addToCart' | 'handleSignOut'>) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  // Get all listings for favorites
  const { data: listingsData } = useInfiniteListingsQuery(1000); // Get a large number to include all listings

  const allListings = listingsData?.pages.flatMap((page) => page.listings) ?? [];

  useRouteProtection(userMode, setUserMode);

  return (
    <Favorites
      profileData={profileData}
      cart={cart}
      userMode={userMode}
      allListings={allListings}
      onBackToBrowse={() => navigate('/browse')}
      onAddToCart={props.addToCart}
      onViewProfile={(sellerId) => navigate(`/seller/${sellerId}`)}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onFavoritesClick={() => navigate('/favorites')}
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
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const ViewSellerProfileWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);
  const { sellerId } = useParams<{ sellerId: string }>();

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

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

// eslint-disable-next-line react-refresh/only-export-components
const CartWrapper = (
  props: Pick<AppRoutesProps, 'updateCartQuantity' | 'removeFromCart' | 'handleSignOut'>
) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

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

// eslint-disable-next-line react-refresh/only-export-components
const CheckoutWrapper = (props: Pick<AppRoutesProps, 'handlePlaceOrder' | 'handleSignOut'>) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

  const cart = useCartStore((state) => state.cart);
  const profileData = useAuthStore((state) => state.profileData);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

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

// eslint-disable-next-line react-refresh/only-export-components
const UserOrdersWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

  const user = useAuthStore((state) => state.user);
  const {
    data: buyerOrders = [],
    isLoading: buyerOrdersLoading,
    refetch: refetchBuyerOrders,
    isFetching: isFetchingBuyerOrders,
  } = useBuyerOrdersQuery(user?.uid);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  useRouteProtection(userMode, setUserMode);

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
      onRefresh={() => {
        void refetchBuyerOrders();
      }}
      isRefreshing={isFetchingBuyerOrders && !buyerOrdersLoading}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const OrderDetailsWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleCancelOrder' | 'handleSubmitReview'>
) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);
  const { orderId } = useParams<{ orderId: string }>();

  const user = useAuthStore((state) => state.user);
  const { data: buyerOrders = [], isLoading: buyerOrdersLoading } = useBuyerOrdersQuery(user?.uid);

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);
  const parsedOrderId = Number.parseInt(orderId || '', 10);
  const order = Number.isNaN(parsedOrderId)
    ? undefined
    : buyerOrders.find((o) => o.id === parsedOrderId);
  const { sellerProfile } = useSellerProfile(order?.sellerId);

  const { data: review } = useOrderReviewQuery(order?.hasReview ? order.firebaseId : undefined);

  if (buyerOrdersLoading) {
    return <PageLoadingFallback />;
  }

  if (Number.isNaN(parsedOrderId) || !order) {
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
      onCancelOrder={async (id) => {
        await props.handleCancelOrder(id);
        navigate('/orders');
      }}
      onSubmitReview={props.handleSubmitReview}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => {
        signOutToHome();
      }}
      onProfileClick={() => navigate('/profile')}
      userMode={userMode}
      onModeChange={(mode) => {
        setUserMode(mode);
        if (mode === 'seller') {
          navigate('/seller/dashboard');
        }
      }}
      onLogoClick={() => {
        logoToBrowse();
      }}
      onAddToCart={addToCart}
    />
  );
};

export const renderBuyerRoutes = (props: AppRoutesProps, user: User | null) => (
  <>
    <Route
      path="/browse"
      element={
        <RequireAuth user={user} loading={props.authLoading}>
          <BrowseWrapper
            addToCart={props.addToCart}
            handleSignOut={props.handleSignOut}
            setProfileData={props.setProfileData}
          />
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
      path="/favorites"
      element={
        <RequireAuth user={user} loading={props.authLoading}>
          <FavoritesWrapper addToCart={props.addToCart} handleSignOut={props.handleSignOut} />
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
  </>
);
