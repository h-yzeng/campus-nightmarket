import { useState } from 'react';
import type { CartItem, FoodItem, Order } from './types';
import { useAuth } from './hooks/userAuth';
import { mockFoodItems, mockSellersData } from './data/mockData';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Browse from './pages/Browse';
import UserProfile from './pages/UserProfile';
import ViewProfile from './pages/ViewProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserOrders from './pages/UserOrders';
import OrderDetails from './pages/OrderDetails';

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

  const handleGetStarted = () => setCurrentPage('signup');
  const handleGoToLogin = () => setCurrentPage('login');
  const handleGoToSignup = () => setCurrentPage('signup');
  const handleGoToProfile = () => setCurrentPage('profile');
  const handleBackToBrowse = () => setCurrentPage('browse');
  const handleCartClick = () => setCurrentPage('cart');
  const handleBackToCart = () => setCurrentPage('cart');
  const handleGoToOrders = () => setCurrentPage('userOrders');

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
        status: 'pending' as 'pending' | 'completed' | 'cancelled',
        orderDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: total,
        notes: notes
      };
    });

    setOrders(prev => [...newOrders, ...prev]);
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

  const handleSignOutWithReset = () => {
    handleSignOut();
    setCart([]);
    setSearchQuery('');
    setSelectedLocation('All Dorms');
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
          onCartClick={handleCartClick}
          onSignOut={handleSignOutWithReset}
          onProfileClick={handleGoToProfile}
          onOrdersClick={handleGoToOrders}
          onViewProfile={handleViewProfile}
        />
      )}

      {currentPage === 'userOrders' && (
        <UserOrders
          orders={orders}
          profileData={profileData}
          cart={cart}
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
        />
      )}
    </div>
  );
}

export default App;