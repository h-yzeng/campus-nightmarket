import { lazy } from 'react';
import { Route, useParams, Navigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { RequireAuth, PageLoadingFallback, useNavBasics } from './shared';
import type { AppRoutesProps } from './types';
import { useRouteProtection } from '../hooks/useRouteProtection';
import { useSellerListingsQuery } from '../hooks/queries/useListingsQuery';
import { useSellerOrdersQuery } from '../hooks/queries/useOrdersQuery';
import { useOrderReviewsQuery } from '../hooks/queries/useReviewsQuery';
import { useCartStore, useAuthStore, useNavigationStore } from '../stores';

const SellerDashboard = lazy(() => import('../pages/seller/SellerDashboard'));
const CreateListing = lazy(() => import('../pages/seller/CreateListing'));
const EditListing = lazy(() => import('../pages/seller/EditListing'));
const SellerListings = lazy(() => import('../pages/seller/SellerListings'));
const SellerOrders = lazy(() => import('../pages/seller/SellerOrders'));

// eslint-disable-next-line react-refresh/only-export-components
const SellerDashboardWrapper = (props: Pick<AppRoutesProps, 'handleSignOut'>) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

  const user = useAuthStore((state) => state.user);
  const { data: listings = [], isLoading: listingsLoading } = useSellerListingsQuery(user?.uid);
  const { data: sellerOrders = [], isLoading: sellerOrdersLoading } = useSellerOrdersQuery(
    user?.uid
  );

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  useRouteProtection(userMode, setUserMode);

  if (!profileData?.isSeller) {
    return <Navigate to="/browse" replace />;
  }

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

// eslint-disable-next-line react-refresh/only-export-components
const CreateListingWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleCreateListing'>
) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

  const user = useAuthStore((state) => state.user);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  useRouteProtection(userMode, setUserMode);

  if (!profileData?.isSeller) {
    return <Navigate to="/browse" replace />;
  }

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

// eslint-disable-next-line react-refresh/only-export-components
const EditListingWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleUpdateListing'>
) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);
  const { listingId } = useParams<{ listingId: string }>();

  const user = useAuthStore((state) => state.user);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  useRouteProtection(userMode, setUserMode);

  if (!profileData?.isSeller) {
    return <Navigate to="/browse" replace />;
  }

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

// eslint-disable-next-line react-refresh/only-export-components
const SellerListingsWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleToggleAvailability' | 'handleDeleteListing'>
) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

  const user = useAuthStore((state) => state.user);
  const { data: listings = [] } = useSellerListingsQuery(user?.uid);
  const { data: sellerOrders = [] } = useSellerOrdersQuery(user?.uid);

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  useRouteProtection(userMode, setUserMode);

  if (!profileData?.isSeller) {
    return <Navigate to="/browse" replace />;
  }

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

// eslint-disable-next-line react-refresh/only-export-components
const SellerOrdersWrapper = (
  props: Pick<AppRoutesProps, 'handleSignOut' | 'handleUpdateOrderStatus'>
) => {
  const { navigate, signOutToHome, logoToBrowse } = useNavBasics(props.handleSignOut);

  const user = useAuthStore((state) => state.user);
  const {
    data: sellerOrders = [],
    isLoading: sellerOrdersLoading,
    refetch: refetchSellerOrders,
    isFetching: isFetchingSellerOrders,
  } = useSellerOrdersQuery(user?.uid);

  const orderIdsWithReviews = sellerOrders
    .filter((order) => order.status === 'completed' && order.hasReview)
    .map((order) => order.firebaseId);

  const { data: orderReviews = {} } = useOrderReviewsQuery(orderIdsWithReviews);

  const profileData = useAuthStore((state) => state.profileData);
  const cart = useCartStore((state) => state.cart);
  const userMode = useNavigationStore((state) => state.userMode);
  const setUserMode = useNavigationStore((state) => state.setUserMode);

  useRouteProtection(userMode, setUserMode);

  if (!profileData?.isSeller) {
    return <Navigate to="/browse" replace />;
  }

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
      onRefresh={() => {
        void refetchSellerOrders();
      }}
      isRefreshing={isFetchingSellerOrders && !sellerOrdersLoading}
    />
  );
};

export const renderSellerRoutes = (props: AppRoutesProps, user: User | null) => (
  <>
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
  </>
);
