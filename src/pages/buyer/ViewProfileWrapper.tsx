import { useEffect, useState } from 'react';
import { getUserProfile } from '../../services/auth/userService';
import ViewProfile from './ViewProfile';
import type { ProfileData, CartItem, Transaction, UserMode } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface ViewProfileWrapperProps {
  sellerId: string;
  currentUserProfile: ProfileData;
  cart: CartItem[];
  userMode: UserMode;
  onBack: () => void;
  onSignOut: () => void;
  onCartClick: () => void;
  onProfileClick: () => void;
  onLogoClick?: () => void;
}

const ViewProfileWrapper = ({
  sellerId,
  currentUserProfile,
  cart,
  userMode,
  onBack,
  onSignOut,
  onCartClick,
  onProfileClick,
  onLogoClick
}: ViewProfileWrapperProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerData, setSellerData] = useState<{
    sellerName: string;
    sellerStudentId: string;
    sellerPhoto: string | null;
    sellerBio: string;
    sellerLocation: string;
  } | null>(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const profile = await getUserProfile(sellerId);

        if (!profile) {
          setError('Seller profile not found');
          return;
        }

        setSellerData({
          sellerName: `${profile.firstName} ${profile.lastName}`,
          sellerStudentId: profile.studentId,
          sellerPhoto: profile.photoURL,
          sellerBio: profile.bio || '',
          sellerLocation: profile.sellerInfo?.preferredLocations?.[0] || 'No location set',
        });
      } catch (err) {
        console.error('Error fetching seller profile:', err);
        setError('Failed to load seller profile');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerProfile();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#040707]">
        <Header
          cartItems={cart}
          profileData={currentUserProfile}
          onCartClick={onCartClick}
          onSignOut={onSignOut}
          onProfileClick={onProfileClick}
          onLogoClick={onLogoClick}
          showCart={true}
          userMode={userMode}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl font-semibold text-white">Loading seller profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !sellerData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#040707]">
        <Header
          cartItems={cart}
          profileData={currentUserProfile}
          onCartClick={onCartClick}
          onSignOut={onSignOut}
          onProfileClick={onProfileClick}
          onLogoClick={onLogoClick}
          showCart={true}
          userMode={userMode}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl font-semibold text-white mb-2">{error || 'Seller not found'}</p>
            <button
              onClick={onBack}
              className="text-[#CC0000] font-semibold hover:underline"
            >
              ← Back to Browse
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const transactions: Transaction[] = [];

  return (
    <ViewProfile
      sellerName={sellerData.sellerName}
      sellerStudentId={sellerData.sellerStudentId}
      sellerPhoto={sellerData.sellerPhoto}
      sellerBio={sellerData.sellerBio}
      sellerLocation={sellerData.sellerLocation}
      transactions={transactions}
      currentUserProfile={currentUserProfile}
      cart={cart}
      userMode={userMode}
      onBack={onBack}
      onSignOut={onSignOut}
      onCartClick={onCartClick}
      onProfileClick={onProfileClick}
      onLogoClick={onLogoClick}
    />
  );
};

export default ViewProfileWrapper;
