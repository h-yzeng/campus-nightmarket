import { Search, MapPin, Loader2, AlertCircle, Star } from 'lucide-react';
import type { FoodItem, CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'All Dorms' || item.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

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
                <div
                  key={item.id}
                  className="bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-[#3A3A3A]"
                >
                  <div className="relative p-6 pb-4 bg-[#2A2A2A]">
                    {item.image.startsWith('http') ? (
                      <div className="w-full h-40 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-7xl text-center mb-2">{item.image}</div>
                    )}
                    {(item.name.toLowerCase().includes('ramen') ||
                      item.name.toLowerCase().includes('sushi') ||
                      item.name.toLowerCase().includes('pizza') ||
                      item.name.toLowerCase().includes('taco')) && (
                      <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full text-white font-bold shadow-md bg-[#FF9900]">
                        POPULAR
                      </span>
                    )}
                  </div>

                  <div className="p-4 pt-3">
                  <h3 className="font-bold text-lg mb-1 leading-tight text-[#E0E0E0]">
                    {item.name}
                  </h3>
                  <p className="text-sm mb-1 text-[#A0A0A0]">
                    {item.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => onViewProfile(item.sellerId)}
                    className="text-sm mb-3 font-medium text-[#FF4444] hover:text-[#CC0000] hover:underline transition-colors"
                  >
                    by {item.seller.split(' ')[0]}
                  </button>

                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-[#888888]" />
                    <span className="text-xs text-[#B0B0B0]">{item.location}</span>
                    {sellerRatings[item.sellerId] && (
                      <div className="ml-auto flex items-center gap-1">
                        <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
                        <span className="text-xs font-semibold text-[#E0E0E0]">{sellerRatings[item.sellerId]}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-3xl font-bold text-[#CC0000]">
                      ${item.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="px-5 py-2.5 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-[#CC0000]"
                    >
                      Add +
                    </button>
                  </div>
                </div>
              </div>
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