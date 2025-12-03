import { useMemo, useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { FoodItem, CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ListingCard from '../../components/ListingCard';
import FiltersPanel from '../../components/browse/FiltersPanel';
import ErrorAlert from '../../components/common/ErrorAlert';

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
  // Advanced filter states
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [sortBy, setSortBy] = useState('newest');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredAndSortedItems = useMemo(() => {
    // Filter items
    const filtered = foodItems.filter((item) => {
      // Search filter
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Location filter
      const matchesLocation =
        selectedLocation === 'All Dorms' || item.location === selectedLocation;

      // Category filter
      const matchesCategory =
        selectedCategory === 'All Categories' ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

      // Price filter
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

      // Active filter - only show active listings in Browse
      const isActive = item.isActive !== false;

      // Availability filter - optionally filter by supply status
      const matchesAvailability = !showAvailableOnly || item.isAvailable !== false;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCategory &&
        matchesPrice &&
        isActive &&
        matchesAvailability
      );
    });

    // Sort items
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating': {
          const ratingA = parseFloat(sellerRatings[a.sellerId] || '0');
          const ratingB = parseFloat(sellerRatings[b.sellerId] || '0');
          return ratingB - ratingA;
        }
        case 'newest':
        default: {
          // Sort by datePosted if available, otherwise maintain order
          if (a.datePosted && b.datePosted) {
            return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
          }
          return 0;
        }
      }
    });

    return sorted;
  }, [
    foodItems,
    searchQuery,
    selectedLocation,
    selectedCategory,
    priceRange,
    sortBy,
    showAvailableOnly,
    sellerRatings,
  ]);

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
            <ErrorAlert
              title="Error Loading Listings"
              message={error}
              variant="error"
              dismissible
            />
          </div>
        )}

        <FiltersPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          showAvailableOnly={showAvailableOnly}
          onAvailableOnlyChange={setShowAvailableOnly}
          resultCount={filteredAndSortedItems.length}
        />

        <div className="mx-auto max-w-7xl px-6 py-8">
          {loading ? (
            <div
              className="flex flex-col items-center justify-center py-16"
              role="status"
              aria-live="polite"
            >
              <Loader2 size={48} className="mb-4 animate-spin text-[#CC0000]" />
              <p className="text-lg text-[#B0B0B0]">Loading listings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedItems.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  sellerRating={sellerRatings[item.sellerId]}
                  onAddToCart={handleAddToCart}
                  onViewProfile={handleViewProfile}
                />
              ))}

              {filteredAndSortedItems.length === 0 && !loading && (
                <div className="col-span-full rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] py-16 text-center shadow-md">
                  <div className="mb-4 text-7xl">🔍</div>
                  <h2 className="mb-2 text-2xl font-bold text-white">No items found</h2>
                  <p className="mb-6 text-[#A0A0A0]">
                    Try adjusting your search query or filters to find more listings
                  </p>
                  <div className="mx-auto max-w-md space-y-2 text-left">
                    <p className="text-sm text-[#B0B0B0]">💡 Tips:</p>
                    <ul className="space-y-1 text-sm text-[#888888]">
                      <li>• Try broader search terms</li>
                      <li>• Check if "Available Only" filter is limiting results</li>
                      <li>• Expand your location or price range</li>
                      <li>• Browse all categories</li>
                    </ul>
                  </div>
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
