import { useCallback, useState, useEffect } from 'react';
import { Loader2, HelpCircle } from 'lucide-react';
import type { FoodItem, CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ListingCard from '../../components/ListingCard';
import FiltersPanel from '../../components/browse/FiltersPanel';
import ErrorAlert from '../../components/common/ErrorAlert';
import FirstTimeUserGuide from '../../components/onboarding/FirstTimeUserGuide';
import { useFilteredListings } from '../../hooks/useFilteredListings';

// Debounce hook for search optimization
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
  onShowGuide?: () => void;
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

  // First-time user guide
  const [showGuide, setShowGuide] = useState(false);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Check if user has seen the guide before
    // Use a delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      const hasSeenGuide = localStorage.getItem('hasSeenGuide');
      console.log('Checking guide status:', hasSeenGuide); // Debug log
      if (!hasSeenGuide || hasSeenGuide === 'false') {
        console.log('Showing guide for first-time user'); // Debug log
        setShowGuide(true);
      }
    }, 500); // Small delay to ensure page is ready

    return () => clearTimeout(timer);
  }, []);

  const handleCloseGuide = () => {
    console.log('Closing guide and marking as seen'); // Debug log
    localStorage.setItem('hasSeenGuide', 'true');
    setShowGuide(false);
  };

  // Manual trigger for testing or if user wants to see guide again
  const handleShowGuide = () => {
    setShowGuide(true);
  };

  // Use the extracted filtering hook with debounced search
  const filteredAndSortedItems = useFilteredListings({
    items: foodItems,
    searchQuery: debouncedSearchQuery,
    selectedLocation,
    selectedCategory,
    priceRange,
    sortBy,
    showAvailableOnly,
    sellerRatings,
  });

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
      {/* First-time user guide */}
      {showGuide && <FirstTimeUserGuide onClose={handleCloseGuide} />}

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
                    {foodItems.length === 0
                      ? 'No food items are currently available. Be the first to sell!'
                      : 'Try adjusting your search query or filters to find more listings'}
                  </p>
                  <div className="mx-auto max-w-md space-y-4 text-left">
                    {foodItems.length > 0 ? (
                      <>
                        <p className="text-sm text-[#B0B0B0]">💡 Tips:</p>
                        <ul className="space-y-1 text-sm text-[#888888]">
                          <li>• Try broader search terms</li>
                          <li>• Check if "Available Only" filter is limiting results</li>
                          <li>• Expand your location or price range</li>
                          <li>• Browse all categories</li>
                        </ul>
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="mb-4 text-sm text-[#B0B0B0]">
                          Want to sell your homemade food?
                        </p>
                        {onModeChange && (
                          <button
                            onClick={() => onModeChange('seller')}
                            className="rounded-lg bg-[#CC0000] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#B00000]"
                            type="button"
                          >
                            Switch to Seller Mode
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Floating Help Button */}
      <button
        onClick={handleShowGuide}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#CC0000] text-white shadow-lg transition-all hover:scale-110 hover:bg-[#B00000] hover:shadow-xl"
        type="button"
        title="Show tutorial guide"
        aria-label="Open help guide"
      >
        <HelpCircle size={24} />
      </button>
    </div>
  );
};

export default Browse;
