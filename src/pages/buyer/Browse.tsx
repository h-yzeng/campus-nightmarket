import { useMemo, useCallback } from 'react';
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react';
import type { FoodItem, CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ListingCard from '../../components/ListingCard';

interface BrowseProps {
  foodItems: FoodItem[];
  sellerRatings: Record<string, string | null>;
  cart: CartItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  addToCart: (item: FoodItem) => void;
  profileData: ProfileData;
  userMode: 'buyer' | 'seller';
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onViewProfile: (sellerId: string) => void;
  onModeChange?: (mode: 'buyer' | 'seller') => void;
  onSellerDashboardClick?: () => void;
  onLogoClick?: () => void;
  loading?: boolean;
  error?: string | null;
}

const Browse = ({
  foodItems,
  sellerRatings,
  cart,
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  addToCart,
  profileData,
  userMode,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onViewProfile,
  onModeChange,
  onSellerDashboardClick,
  onLogoClick,
  loading = false,
  error = null,
}: BrowseProps) => {
  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.seller.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation =
        selectedLocation === 'All Dorms' || item.location === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  }, [foodItems, searchQuery, selectedLocation]);

  // Memoize callbacks to prevent ListingCard re-renders
  const handleAddToCart = useCallback(
    (item: FoodItem) => {
      addToCart(item);
    },
    [addToCart]
  );

  const handleViewProfile = useCallback(
    (sellerId: string) => {
      onViewProfile(sellerId);
    },
    [onViewProfile]
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      <Header
        cartItems={cart}
        profileData={profileData}
        userMode={userMode}
        onCartClick={onCartClick}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onOrdersClick={onOrdersClick}
        onModeChange={onModeChange}
        onSellerDashboardClick={onSellerDashboardClick}
        onLogoClick={onLogoClick}
        showCart={true}
      />

      <main className="flex-1">
        {error && (
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex gap-3 rounded-xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#FF4444]" />
              <div>
                <p className="mb-1 text-sm font-semibold text-[#FFCCCC]">Error Loading Listings</p>
                <p className="text-sm text-[#FFB0B0]">{error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="border-b-2 border-[#2A2A2A] bg-[#1A1A1B] shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for food or sellers..."
                  className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#252525] py-3 pr-4 pl-12 text-base text-[#E0E0E0] placeholder-gray-500 transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-[#CC0000]" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="flex-1 rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-3 text-base font-medium text-[#E0E0E0] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  title="Location Filter"
                >
                  <option>All Dorms</option>
                  <option>Cunningham Hall</option>
                  <option>Kacek Hall</option>
                  <option>Carmen Hall</option>
                  <option>MSV</option>
                  <option>Rowe North</option>
                  <option>Rowe Middle</option>
                  <option>Rowe South</option>
                  <option>The Quad</option>
                </select>
              </div>
            </div>

            <p className="mt-4 text-sm font-medium text-[#B0B0B0]">
              {filteredItems.length} items available
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={48} className="mb-4 animate-spin text-[#CC0000]" />
              <p className="text-lg text-[#B0B0B0]">Loading listings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  sellerRating={sellerRatings[item.sellerId]}
                  onAddToCart={handleAddToCart}
                  onViewProfile={handleViewProfile}
                />
              ))}

              {filteredItems.length === 0 && !loading && (
                <div className="col-span-full py-16 text-center">
                  <p className="mb-2 text-xl text-gray-500">No items found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
