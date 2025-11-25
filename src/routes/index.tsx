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
import type { ProfileData, CartItem, Order, ListingWithFirebaseId, FoodItem } from '../types';

interface AppRoutesProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  user: User | null;

  cart: CartItem[];
  addToCart: (item: FoodItem) => void;
  updateCartQuantity: (itemId: number, newQuantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;

  userMode: 'buyer' | 'seller';
  setUserMode: (mode: 'buyer' | 'seller') => void;

  buyerOrders: Order[];
  sellerOrders: Order[];
  buyerOrdersLoading: boolean;
  sellerOrdersLoading: boolean;

  listings: ListingWithFirebaseId[];
  foodItems: FoodItem[];
  listingsLoading: boolean;
  listingsError: string | null;

  handleCreateProfile: () => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<boolean>;
  handleSaveProfile: () => Promise<void>;
  handleSignOut: () => void;
  handlePlaceOrder: (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) => Promise<void>;
  handleCancelOrder: (orderId: number) => Promise<void>;
  handleCreateListing: () => Promise<void>;
  handleToggleAvailability: (listingId: number) => void;
  handleDeleteListing: (listingId: number | string) => void;
  handleUpdateListing: () => Promise<void>;
  handleUpdateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
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
  return <Login onLogin={props.handleLogin} onGoToSignup={() => navigate('/signup')} />;
};

const SignupWrapper = (props: Pick<AppRoutesProps, 'profileData' | 'setProfileData' | 'handleCreateProfile'>) => {
  const navigate = useNavigate();
  return (
    <Signup
      profileData={props.profileData}
      setProfileData={props.setProfileData}
      onCreateProfile={props.handleCreateProfile}
      onGoToLogin={() => navigate('/login')}
    />
  );
};

const BrowseWrapper = (props: Pick<AppRoutesProps, 'foodItems' | 'cart' | 'searchQuery' | 'setSearchQuery' | 'selectedLocation' | 'setSelectedLocation' | 'addToCart' | 'profileData' | 'userMode' | 'setUserMode' | 'listingsLoading' | 'listingsError'>) => {
  const navigate = useNavigate();
  return (
    <Browse
      foodItems={props.foodItems}
      cart={props.cart}
      searchQuery={props.searchQuery}
      setSearchQuery={props.setSearchQuery}
      selectedLocation={props.selectedLocation}
      setSelectedLocation={props.setSelectedLocation}
      addToCart={props.addToCart}
      profileData={props.profileData}
      userMode={props.userMode}
      onCartClick={() => navigate('/cart')}
      onSignOut={() => navigate('/')}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onViewProfile={(sellerId) => navigate(`/seller/${sellerId}`)}
      onModeChange={(mode) => {
        props.setUserMode(mode);
        if (mode === 'seller') navigate('/seller/dashboard');
      }}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onLogoClick={() => navigate('/browse')}
      loading={props.listingsLoading}
      error={props.listingsError}
    />
  );
};

const UserProfileWrapper = (props: Pick<AppRoutesProps, 'profileData' | 'setProfileData' | 'handleSaveProfile' | 'handleSignOut' | 'userMode' | 'setUserMode'>) => {
  const navigate = useNavigate();
  return (
    <UserProfile
      profileData={props.profileData}
      setProfileData={props.setProfileData}
      onSaveProfile={props.handleSaveProfile}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onBack={() => navigate('/browse')}
      userMode={props.userMode}
      onOrdersClick={() => navigate('/orders')}
      onSellerDashboardClick={() => navigate('/seller/dashboard')}
      onModeChange={(mode) => {
        props.setUserMode(mode);
        if (mode === 'seller') navigate('/seller/dashboard');
      }}
    />
  );
};

const ViewSellerProfileWrapper = (props: Pick<AppRoutesProps, 'profileData' | 'cart' | 'userMode' | 'handleSignOut'>) => {
  const navigate = useNavigate();
  const { sellerId } = useParams<{ sellerId: string }>();

  return (
    <ViewProfileWrapper
      sellerId={sellerId || ''}
      currentUserProfile={props.profileData}
      cart={props.cart}
      userMode={props.userMode}
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

const CartWrapper = (props: Pick<AppRoutesProps, 'cart' | 'profileData' | 'updateCartQuantity' | 'removeFromCart' | 'handleSignOut' | 'userMode'>) => {
  const navigate = useNavigate();
  return (
    <Cart
      cart={props.cart}
      profileData={props.profileData}
      onUpdateQuantity={props.updateCartQuantity}
      onRemoveItem={props.removeFromCart}
      onCheckout={() => navigate('/checkout')}
      onContinueShopping={() => navigate('/browse')}
      onSignOut={() => {
        props.handleSignOut();
        navigate('/');
      }}
      onProfileClick={() => navigate('/profile')}
      userMode={props.userMode}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const CheckoutWrapper = (props: Pick<AppRoutesProps, 'cart' | 'profileData' | 'handlePlaceOrder' | 'handleSignOut' | 'userMode'>) => {
  const navigate = useNavigate();
  return (
    <Checkout
      cart={props.cart}
      profileData={props.profileData}
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
      userMode={props.userMode}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const UserOrdersWrapper = (props: Pick<AppRoutesProps, 'buyerOrders' | 'profileData' | 'cart' | 'userMode' | 'setUserMode' | 'handleSignOut' | 'buyerOrdersLoading'>) => {
  const navigate = useNavigate();
  return (
    <UserOrders
      orders={props.buyerOrders}
      profileData={props.profileData}
      cart={props.cart}
      userMode={props.userMode}
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
        props.setUserMode(mode);
        if (mode === 'seller') navigate('/seller/dashboard');
      }}
      onLogoClick={() => navigate('/browse')}
      loading={props.buyerOrdersLoading}
    />
  );
};

const OrderDetailsWrapper = (props: Pick<AppRoutesProps, 'buyerOrders' | 'profileData' | 'cart' | 'userMode' | 'handleSignOut' | 'handleCancelOrder'>) => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const order = props.buyerOrders.find(o => o.id === parseInt(orderId || '0'));
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
      profileData={props.profileData}
      cart={props.cart}
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
      userMode={props.userMode}
      onLogoClick={() => navigate('/browse')}
    />
  );
};

const SellerDashboardWrapper = (props: Pick<AppRoutesProps, 'profileData' | 'cart' | 'listings' | 'sellerOrders' | 'userMode' | 'setUserMode' | 'handleSignOut'>) => {
  const navigate = useNavigate();
  return (
    <SellerDashboard
      profileData={props.profileData}
      cart={props.cart}
      listings={props.listings}
      incomingOrders={props.sellerOrders}
      userMode={props.userMode}
      onModeChange={(mode) => {
        props.setUserMode(mode);
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

const CreateListingWrapper = (props: Pick<AppRoutesProps, 'profileData' | 'cart' | 'userMode' | 'setUserMode' | 'handleSignOut' | 'handleCreateListing'>) => {
  const navigate = useNavigate();
  return (
    <CreateListing
      profileData={props.profileData}
      cart={props.cart}
      userMode={props.userMode}
      onBackToDashboard={() => navigate('/seller/dashboard')}
      onCreateListing={async () => {
        await props.handleCreateListing();
        navigate('/seller/listings');
      }}
      onModeChange={(mode) => {
        props.setUserMode(mode);
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

const EditListingWrapper = (props: Pick<AppRoutesProps, 'profileData' | 'cart' | 'userMode' | 'setUserMode' | 'handleSignOut' | 'handleUpdateListing'>) => {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();

  return (
    <EditListing
      listingId={listingId || ''}
      profileData={props.profileData}
      cart={props.cart}
      userMode={props.userMode}
      onBackToListings={() => navigate('/seller/listings')}
      onUpdateListing={async () => {
        await props.handleUpdateListing();
        navigate('/seller/listings');
      }}
      onModeChange={(mode) => {
        props.setUserMode(mode);
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

const SellerListingsWrapper = (props: Pick<AppRoutesProps, 'profileData' | 'cart' | 'listings' | 'userMode' | 'setUserMode' | 'handleSignOut' | 'handleToggleAvailability' | 'handleDeleteListing'>) => {
  const navigate = useNavigate();
  return (
    <SellerListings
      profileData={props.profileData}
      cart={props.cart}
      listings={props.listings}
      userMode={props.userMode}
      onBackToDashboard={() => navigate('/seller/dashboard')}
      onToggleAvailability={props.handleToggleAvailability}
      onDeleteListing={props.handleDeleteListing}
      onEditListing={(listingId) => navigate(`/seller/listings/${listingId}/edit`)}
      onModeChange={(mode) => {
        props.setUserMode(mode);
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

const SellerOrdersWrapper = (props: Pick<AppRoutesProps, 'profileData' | 'cart' | 'sellerOrders' | 'userMode' | 'setUserMode' | 'handleSignOut' | 'handleUpdateOrderStatus' | 'sellerOrdersLoading'>) => {
  const navigate = useNavigate();
  return (
    <SellerOrders
      profileData={props.profileData}
      cart={props.cart}
      incomingOrders={props.sellerOrders}
      userMode={props.userMode}
      onBackToDashboard={() => navigate('/seller/dashboard')}
      onUpdateOrderStatus={props.handleUpdateOrderStatus}
      onModeChange={(mode) => {
        props.setUserMode(mode);
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
      loading={props.sellerOrdersLoading}
    />
  );
};

export const AppRoutes = (props: AppRoutesProps) => {
  const { user } = props;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeWrapper />} />
      <Route path="/login" element={<LoginWrapper handleLogin={props.handleLogin} />} />
      <Route path="/signup" element={<SignupWrapper profileData={props.profileData} setProfileData={props.setProfileData} handleCreateProfile={props.handleCreateProfile} />} />

      {/* Buyer routes */}
      <Route path="/browse" element={<RequireAuth user={user}><BrowseWrapper {...props} /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth user={user}><UserProfileWrapper {...props} /></RequireAuth>} />
      <Route path="/seller/:sellerId" element={<RequireAuth user={user}><ViewSellerProfileWrapper {...props} /></RequireAuth>} />
      <Route path="/cart" element={<RequireAuth user={user}><CartWrapper {...props} /></RequireAuth>} />
      <Route path="/checkout" element={<RequireAuth user={user}><CheckoutWrapper {...props} /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth user={user}><UserOrdersWrapper {...props} /></RequireAuth>} />
      <Route path="/orders/:orderId" element={<RequireAuth user={user}><OrderDetailsWrapper {...props} /></RequireAuth>} />

      {/* Seller routes */}
      <Route path="/seller/dashboard" element={<RequireAuth user={user}><SellerDashboardWrapper {...props} /></RequireAuth>} />
      <Route path="/seller/listings/create" element={<RequireAuth user={user}><CreateListingWrapper {...props} /></RequireAuth>} />
      <Route path="/seller/listings/:listingId/edit" element={<RequireAuth user={user}><EditListingWrapper {...props} /></RequireAuth>} />
      <Route path="/seller/listings" element={<RequireAuth user={user}><SellerListingsWrapper {...props} /></RequireAuth>} />
      <Route path="/seller/orders" element={<RequireAuth user={user}><SellerOrdersWrapper {...props} /></RequireAuth>} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={user ? "/browse" : "/"} replace />} />
    </Routes>
  );
};
