import { Search, MapPin } from 'lucide-react';
import type { FoodItem, CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface BrowseProps {
  foodItems: FoodItem[];
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
  onViewProfile: (sellerName: string) => void;
  onModeChange?: (mode: 'buyer' | 'seller') => void;
  onSellerDashboardClick?: () => void;
}

const Browse = ({
  foodItems,
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
  onSellerDashboardClick
}: BrowseProps) => {
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'All Dorms' || item.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
        showCart={true}
      />

      <main className="flex-1">
        <div className="bg-white border-b-2 border-gray-200 shadow-sm">
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
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-[#CC0000]" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-red-200 transition-all text-black bg-white"
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

            <p className="text-sm font-medium text-gray-600 mt-4">
              {filteredItems.length} items available
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-gray-100"
              >
                <div className="relative p-6 pb-4 bg-[#FAFAFA]">
                  <div className="text-7xl text-center mb-2">{item.image}</div>
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
                  <h3 className="font-bold text-lg mb-1 leading-tight text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm mb-1 text-gray-600">
                    {item.description}
                  </p>
                  <button
                    onClick={() => onViewProfile(item.seller)}
                    className="text-sm mb-3 font-medium text-[#CC0000] hover:underline"
                  >
                    by {item.seller.split(' ')[0]}
                  </button>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-[#76777B]" />
                    <span className="text-xs text-gray-600">{item.location}</span>
                    <span className="ml-auto text-xs text-gray-600">⭐ {item.rating}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-3xl font-bold text-[#CC0000]">
                      ${item.price}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-5 py-2.5 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-[#CC0000]"
                    >
                      Add +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500 mb-2">No items found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;