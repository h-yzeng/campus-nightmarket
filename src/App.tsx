import { useState } from 'react';
import type { CartItem, FoodItem } from '../src/types';
import { useAuth } from '../src/hooks/userAuth';
import { mockFoodItems, mockSellersData } from '../src/data/mockData';
import Home from '../src/pages/Home';
import Signup from '../src/pages/Signup';
import Login from '../src/pages/Login';
import Browse from '../src/pages/Browse';
import UserProfile from '../src/pages/UserProfile';
import ViewProfile from '../src/pages/ViewProfile';
import Cart from '../src/pages/Cart';
import Checkout from '../src/pages/Checkout';

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

  const handleGetStarted = () => setCurrentPage('signup');
  const handleGoToLogin = () => setCurrentPage('login');
  const handleGoToSignup = () => setCurrentPage('signup');
  const handleGoToProfile = () => setCurrentPage('profile');
  const handleBackToBrowse = () => setCurrentPage('browse');
  const handleCartClick = () => setCurrentPage('cart');
  const handleBackToCart = () => setCurrentPage('cart');

  const handleViewProfile = (sellerName: string) => {
    setSelectedSeller(sellerName);
    setCurrentPage('viewProfile');
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handlePlaceOrder = () => {
    setCart([]);
    setCurrentPage('browse');
    alert('Order placed successfully! The seller will contact you with pickup details.');
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
          onViewProfile={handleViewProfile}
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
    </div>
  );
}

export default App;