import { useState } from 'react';
import type { ProfileData } from './types';
import Home from './pages/Home';
import Signup from './pages/Signup';

type PageType = 'home' | 'signup' | 'browse' | 'cart' | 'checkout';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    password: '', 
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentId: '',
    bio: '',
    photo: null
  });

  const handleGetStarted = () => {
    setCurrentPage('signup');
  };

  const handleCreateProfile = () => {
    setCurrentPage('browse');
  };

  return (
    <div className="app">
      {currentPage === 'home' && (
        <Home onGetStarted={handleGetStarted} />
      )}

      {currentPage === 'signup' && (
        <Signup 
          profileData={profileData}
          setProfileData={setProfileData}
          onCreateProfile={handleCreateProfile}
        />
      )}

      {currentPage === 'browse' && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#CC0000]">Browse Page</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        </div>
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