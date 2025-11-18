import { useState, useEffect } from 'react';
import type { ProfileData, FoodItem, CartItem } from './types';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Browse from './pages/Browse';

type PageType = 'home' | 'login' | 'signup' | 'browse' | 'cart' | 'checkout';

interface StoredAccount {
  email: string;
  password: string;
  profileData: ProfileData;
}

const STORAGE_KEY_ACCOUNTS = 'nightmarket_accounts';
const STORAGE_KEY_CURRENT_USER = 'nightmarket_current_user';

const getInitialAccounts = (): StoredAccount[] => {
  const savedAccounts = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
  return savedAccounts ? JSON.parse(savedAccounts) : [];
};

const getInitialUser = (): { profile: ProfileData; page: PageType } => {
  const savedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (savedUser) {
    return {
      profile: JSON.parse(savedUser),
      page: 'browse'
    };
  }
  return {
    profile: {
      email: '',
      password: '', 
      confirmPassword: '',
      firstName: '',
      lastName: '',
      studentId: '',
      bio: '',
      photo: null
    },
    page: 'home'
  };
};

function App() {
  const initialUser = getInitialUser();
  const [currentPage, setCurrentPage] = useState<PageType>(initialUser.page);
  const [accounts, setAccounts] = useState<StoredAccount[]>(getInitialAccounts());
  const [profileData, setProfileData] = useState<ProfileData>(initialUser.profile);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Dorms');
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }, [accounts]);

  const mockFoodItems: FoodItem[] = [
    {
      id: 1,
      name: "Spicy Ramen Bowl",
      seller: "Sarah Chen",
      price: 8,
      image: "🍜",
      location: "Cunningham Hall",
      rating: "4.9",
      description: "Homemade ramen with authentic spices"
    },
    {
      id: 2,
      name: "Cheese Pizza Slice",
      seller: "Mike Rodriguez",
      price: 4,
      image: "🍕",
      location: "Kacek Hall",
      rating: "4.7",
      description: "Fresh mozzarella and tomato sauce"
    },
    {
      id: 3,
      name: "Chicken Tacos",
      seller: "Emma Wilson",
      price: 6,
      image: "🌮",
      location: "Carmen Hall",
      rating: "4.8",
      description: "Grilled chicken with fresh salsa"
    },
    {
      id: 4,
      name: "Veggie Burger",
      seller: "Alex Kim",
      price: 7,
      image: "🍔",
      location: "MSV",
      rating: "4.6",
      description: "Plant-based patty with all toppings"
    },
    {
      id: 5,
      name: "Chocolate Cookies",
      seller: "Jessica Park",
      price: 3,
      image: "🍪",
      location: "Rowe North",
      rating: "5.0",
      description: "Homemade chocolate chip cookies"
    },
    {
      id: 6,
      name: "Pad Thai",
      seller: "David Lee",
      price: 9,
      image: "🍝",
      location: "Rowe South",
      rating: "4.9",
      description: "Traditional Thai noodles"
    },
    {
      id: 7,
      name: "Sushi Roll",
      seller: "Maya Tanaka",
      price: 10,
      image: "🍣",
      location: "Rowe Middle",
      rating: "4.9",
      description: "California roll with fresh ingredients"
    },
    {
      id: 8,
      name: "Fruit Smoothie",
      seller: "Chris Brown",
      price: 5,
      image: "🥤",
      location: "The Quad",
      rating: "4.5",
      description: "Mixed berry smoothie bowl"
    }
  ];

  const handleGetStarted = () => {
    setCurrentPage('signup');
  };

  const handleGoToLogin = () => {
    setCurrentPage('login');
  };

  const handleGoToSignup = () => {
    setCurrentPage('signup');
  };

  const handleCreateProfile = () => {
    const newAccount: StoredAccount = {
      email: profileData.email,
      password: profileData.password,
      profileData: { ...profileData }
    };
    setAccounts(prev => [...prev, newAccount]);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(profileData));
    setCurrentPage('browse');
  };

  const handleLogin = (email: string, password: string): boolean => {
    const account = accounts.find(
      acc => acc.email === email && acc.password === password
    );

    if (account) {
      setProfileData(account.profileData);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(account.profileData));
      setCurrentPage('browse');
      return true;
    }

    return false;
  };

  const handleCartClick = () => {
    setCurrentPage('cart');
  };

  const handleSignOut = () => {
    setProfileData({
      email: '',
      password: '', 
      confirmPassword: '',
      firstName: '',
      lastName: '',
      studentId: '',
      bio: '',
      photo: null
    });
    setCart([]);
    setSearchQuery('');
    setSelectedLocation('All Dorms');
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    setCurrentPage('home');
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
          onSignOut={handleSignOut}
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