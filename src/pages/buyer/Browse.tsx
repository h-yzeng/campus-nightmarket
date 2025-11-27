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
  error = null
}: BrowseProps) => {
  const filteredItems = useMemo(() => {
    return foodItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.seller.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = selectedLocation === 'All Dorms' || item.location === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  }, [foodItems, searchQuery, selectedLocation]);

  // Memoize callbacks to prevent ListingCard re-renders
  const handleAddToCart = useCallback((item: FoodItem) => {
    addToCart(item);
  }, [addToCart]);

  const handleViewProfile = useCallback((sellerId: string) => {
    onViewProfile(sellerId);
  }, [onViewProfile]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
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
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex gap-3 p-4 rounded-xl bg-[#2A0A0A] border-2 border-[#4A1A1A]">
              <AlertCircle size={20} className="text-[#FF4444] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#FFCCCC] mb-1">Error Loading Listings</p>
                <p className="text-sm text-[#FFB0B0]">{error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-[#1A1A1B] border-b-2 border-[#2A2A2A] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#76777B]" 
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for food or sellers..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-[#E0E0E0] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all bg-[#252525]"
                />
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-[#CC0000]" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base font-medium text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all bg-[#252525]"
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

            <p className="text-sm font-medium text-[#B0B0B0] mt-4">
              {filteredItems.length} items available
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={48} className="text-[#CC0000] animate-spin mb-4" />
              <p className="text-lg text-[#B0B0B0]">Loading listings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <ListingCard
                  key={item.id}
                  item={item}
                  sellerRating={sellerRatings[item.sellerId]}
                  onAddToCart={handleAddToCart}
                  onViewProfile={handleViewProfile}
                />
              ))}

              {filteredItems.length === 0 && !loading && (
                <div className="col-span-full text-center py-16">
                  <p className="text-xl text-gray-500 mb-2">No items found</p>
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