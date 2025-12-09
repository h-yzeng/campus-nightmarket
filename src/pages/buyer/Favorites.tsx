import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ListingCard from '../../components/features/ListingCard';
import PageHead from '../../components/common/PageHead';
import { useFavorites } from '../../hooks/features/useFavorites';
import { useAuth } from '../../hooks/auth/useAuth';
import type { FoodItem, CartItem, ProfileData, UserMode } from '../../types';

interface FavoritesPageProps {
  profileData: ProfileData;
  cart: CartItem[];
  userMode: UserMode;
  allListings: FoodItem[];
  onBackToBrowse: () => void;
  onAddToCart: (item: FoodItem) => void;
  onViewProfile: (sellerId: string) => void;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onFavoritesClick?: () => void;
  onModeChange: (mode: UserMode) => void;
  onSellerDashboardClick?: () => void;
  onLogoClick?: () => void;
}

export default function FavoritesPage({
  profileData,
  cart,
  userMode,
  allListings,
  onBackToBrowse,
  onAddToCart,
  onViewProfile,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onFavoritesClick,
  onModeChange,
  onSellerDashboardClick,
  onLogoClick,
}: FavoritesPageProps) {
  const { user } = useAuth();
  const { favoriteIds, isLoading } = useFavorites(user?.uid);

  // Filter listings to show only favorites
  const favoriteListings = allListings.filter((listing) =>
    favoriteIds.includes(listing.id.toString())
  );

  return (
    <>
      <PageHead
        title="My Favorites"
        description="View your saved favorite food listings on Campus Night Market"
      />
      <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
        <Header
          cartItems={cart}
          profileData={profileData}
          userMode={userMode}
          onCartClick={onCartClick}
          onSignOut={onSignOut}
          onProfileClick={onProfileClick}
          onOrdersClick={onOrdersClick}
          onFavoritesClick={onFavoritesClick}
          onModeChange={onModeChange}
          onSellerDashboardClick={onSellerDashboardClick}
          onLogoClick={onLogoClick}
          showCart={true}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={onBackToBrowse}
              className="mb-4 flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
            >
              <ArrowLeft size={20} />
              Back to Browse
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#CC0000]">
                <Heart size={24} className="fill-white text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Favorites</h1>
                <p className="text-[#A0A0A0]">
                  {favoriteListings.length}{' '}
                  {favoriteListings.length === 1 ? 'favorite item' : 'favorite items'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={40} className="animate-spin text-[#CC0000]" />
            </div>
          ) : favoriteListings.length === 0 ? (
            <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] py-16 text-center shadow-md">
              <div className="mb-4 text-7xl">❤️</div>
              <h2 className="mb-2 text-2xl font-bold text-white">No favorites yet</h2>
              <p className="mb-6 text-[#A0A0A0]">
                Start browsing and tap the heart icon to save your favorite listings
              </p>
              <button
                onClick={onBackToBrowse}
                className="transform rounded-xl bg-[#CC0000] px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                Browse Food
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  item={listing}
                  sellerRating={listing.rating}
                  onAddToCart={onAddToCart}
                  onViewProfile={onViewProfile}
                />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
