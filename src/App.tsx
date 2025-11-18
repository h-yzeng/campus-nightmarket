import { useState } from 'react';
import type { CartItem, FoodItem } from './types';
import { useAuth } from './hooks/userAuth';
import { mockFoodItems, mockSellersData } from './data/mockData';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Browse from './pages/Browse';
import UserProfile from './pages/UserProfile';
import ViewProfile from './pages/ViewProfile';

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

  const handleViewProfile = (sellerName: string) => {
    setSelectedSeller(sellerName);
    setCurrentPage('viewProfile');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#CC0000]">Cart Page</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        </div>
      )}

      {currentPage === 'checkout' && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#CC0000]">Checkout Page</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;