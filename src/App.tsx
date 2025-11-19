import { useState } from 'react';
import type { CartItem, FoodItem, Order, Listing, UserMode } from './types';
import { useAuth } from './hooks/userAuth';
import { mockFoodItems, mockSellersData } from './data/mockData';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Browse from './pages/buyer/Browse';
import UserProfile from './pages/UserProfile';
import ViewProfile from './pages/buyer/ViewProfile';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import UserOrders from './pages/buyer/UserOrders';
import OrderDetails from './pages/buyer/OrderDetails';
import SellerDashboard from './pages/seller/SellerDashboard';
import CreateListing from './pages/seller/CreateListing';

function App() {
  const {
    profileData,
    setProfileData,
    currentPage,
    setCurrentPage,
    handleCreateProfile,
    handleLogin,
    handleSaveProfile,
    handleSignOut
  } = useAuth();

  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Dorms');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [userMode, setUserMode] = useState<'buyer' | 'seller'>('buyer');

  
  const [listings, setListings] = useState<Listing[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);

  const handleGetStarted = () => setCurrentPage('signup');
  const handleGoToLogin = () => setCurrentPage('login');
  const handleGoToSignup = () => setCurrentPage('signup');
  const handleGoToProfile = () => setCurrentPage('profile');
  const handleBackToBrowse = () => {
    setCurrentPage('browse');
    setUserMode('buyer');
  };
  const handleCartClick = () => setCurrentPage('cart');
  const handleBackToCart = () => setCurrentPage('cart');
  const handleGoToOrders = () => setCurrentPage('userOrders');
  const handleGoToSellerDashboard = () => {
    setCurrentPage('sellerDashboard');
    setUserMode('seller');
  };
  const handleGoToCreateListing = () => setCurrentPage('createListing');
  const handleGoToSellerListings = () => setCurrentPage('sellerListings');
  const handleGoToSellerOrders = () => setCurrentPage('sellerOrders');

  const handleModeChange = (mode: UserMode) => {
    setUserMode(mode);
    if (mode === 'buyer') {
      setCurrentPage('browse');
    } else {
      setCurrentPage('sellerDashboard');
    }
  };

  const handleViewProfile = (sellerName: string) => {
    setSelectedSeller(sellerName);
    setCurrentPage('viewProfile');
  };

  const handleViewOrderDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setCurrentPage('orderDetails');
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handlePlaceOrder = (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) => {
    const itemsBySeller = cart.reduce((acc, item) => {
      if (!acc[item.seller]) {
        acc[item.seller] = [];
      }
      acc[item.seller].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    const newOrders: Order[] = Object.entries(itemsBySeller).map(([seller, items], index) => {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const now = new Date();
      
      return {
        id: Date.now() + index, 
        items: items,
        sellerId: seller,
        sellerName: seller,
        sellerLocation: items[0].location,
        pickupTime: pickupTimes[seller],
        paymentMethod: paymentMethod as 'Cash' | 'CashApp' | 'Venmo' | 'Zelle',
        status: 'pending' as const,
        orderDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: total,
        notes: notes,
        buyerId: profileData.email,
        buyerName: `${profileData.firstName} ${profileData.lastName}`
      };
    });

    setOrders(prev => [...newOrders, ...prev]);
    
    const userOrders = newOrders.filter(order => order.sellerName === `${profileData.firstName} ${profileData.lastName}`);
    if (userOrders.length > 0) {
      setIncomingOrders(prev => [...userOrders, ...prev]);
    }
    
    setCart([]);
    setCurrentPage('userOrders');
  };

  const handleCancelOrder = (orderId: number) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'cancelled' as const }
          : order
      )
    );
    setCurrentPage('userOrders');
  };

  const handleCreateListing = (listingData: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'datePosted'>) => {
    const now = new Date();
    
    const newListing: Listing = {
      ...listingData,
      id: Date.now(),
      sellerId: profileData.email,
      sellerName: `${profileData.firstName} ${profileData.lastName}`,
      datePosted: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setListings(prev => [newListing, ...prev]);
    setCurrentPage('sellerDashboard');
  };  

  const handleSignOutWithReset = () => {
    handleSignOut();
    setCart([]);
    setSearchQuery('');
    setSelectedLocation('All Dorms');
    setUserMode('buyer');
  };

  const addToCart = (item: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: number, newQuantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const currentSellerData = mockSellersData[selectedSeller];

  return (
    <div className="app">
      {currentPage === 'home' && (
        <Home 
          onGetStarted={handleGetStarted}
          onLogin={handleGoToLogin}
        />
      )}

      {currentPage === 'login' && (
        <Login
          onLogin={handleLogin}
          onGoToSignup={handleGoToSignup}
        />
      )}

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
        />
      )}

      {currentPage === 'viewProfile' && currentSellerData && (
        <ViewProfile
          sellerName={currentSellerData.name}
          sellerStudentId={currentSellerData.studentId}
          sellerPhoto={currentSellerData.photo}
          sellerBio={currentSellerData.bio}
          sellerLocation={currentSellerData.location}
          transactions={currentSellerData.transactions}
          currentUserProfile={profileData}
          userMode={userMode}  
          cart={cart}
          onBack={handleBackToBrowse}
          onSignOut={handleSignOutWithReset}
          onCartClick={handleCartClick}
          onProfileClick={handleGoToProfile}
        />
      )}

      {currentPage === 'browse' && (
        <Browse
          foodItems={mockFoodItems}
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
        />
      )}

      {currentPage === 'userOrders' && (
        <UserOrders
          orders={orders}
          profileData={profileData}
          cart={cart}
          userMode={userMode}
          onViewOrderDetails={handleViewOrderDetails}
          onBackToBrowse={handleBackToBrowse}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
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
        />
      )}

      {currentPage === 'orderDetails' && (
        <OrderDetails
          order={orders.find(o => o.id === selectedOrderId)!}
          sellerPhone={mockSellersData[orders.find(o => o.id === selectedOrderId)?.sellerName || '']?.phone}
          sellerEmail={mockSellersData[orders.find(o => o.id === selectedOrderId)?.sellerName || '']?.email}
          sellerCashApp={mockSellersData[orders.find(o => o.id === selectedOrderId)?.sellerName || '']?.cashApp}
          sellerVenmo={mockSellersData[orders.find(o => o.id === selectedOrderId)?.sellerName || '']?.venmo}
          sellerZelle={mockSellersData[orders.find(o => o.id === selectedOrderId)?.sellerName || '']?.zelle}
          profileData={profileData}
          cart={cart}
          onBackToOrders={handleGoToOrders}
          onCancelOrder={handleCancelOrder}
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          userMode={userMode}
        />
      )}

      {currentPage === 'sellerDashboard' && (
        <SellerDashboard
          profileData={profileData}
          cart={cart}
          listings={listings}
          incomingOrders={incomingOrders}
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
        />
      )}
    </div>
  );
}

export default App;