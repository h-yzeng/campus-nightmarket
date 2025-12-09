import { useState, useMemo } from 'react';
import { Search, MapPin, Star, ShoppingBag, ArrowLeft } from 'lucide-react';
import type { FoodItem } from '../../types';
import { CATEGORIES, LOCATIONS } from '../../constants';
import LoadingState from '../../components/common/LoadingState';

interface FoodPreviewProps {
  foodItems: FoodItem[];
  sellerRatings: Record<string, string | null>;
  loading: boolean;
  error: string | null;
  onSignUp: () => void;
  onLogin: () => void;
  onBack: () => void;
}

const FoodPreview = ({
  foodItems,
  sellerRatings,
  loading,
  error,
  onSignUp,
  onLogin,
  onBack,
}: FoodPreviewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.seller.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation =
        selectedLocation === 'All Locations' || item.location === selectedLocation;

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesLocation && matchesCategory && item.isAvailable;
    });
  }, [foodItems, searchQuery, selectedLocation, selectedCategory]);

  const isPopular = (item: FoodItem) => item.purchaseCount !== undefined && item.purchaseCount > 10;

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 border-b-2 border-[#3A3A3A] bg-[#1E1E1E] shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <button
                onClick={onBack}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-colors hover:bg-[#2A2A2A] hover:text-white"
                type="button"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-semibold">Back</span>
              </button>
            </div>
            <div className="flex justify-center">
              <h1 className="text-2xl font-bold text-[#CC0000]">Browse Food</h1>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={onLogin}
                className="rounded-lg border-2 border-[#CC0000] px-4 py-2 text-sm font-bold text-[#CC0000] transition-all hover:bg-[#CC0000] hover:text-white"
                type="button"
              >
                Login
              </button>
              <button
                onClick={onSignUp}
                className="rounded-lg bg-[#CC0000] px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
                type="button"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4">
        <div className="mx-auto max-w-7xl">
          {/* Info banner */}
          <div className="mb-4 rounded-lg border border-yellow-600 bg-yellow-900/30 p-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="shrink-0 text-yellow-400" />
              <p className="text-sm text-yellow-200">
                <span className="font-semibold">Preview Mode:</span> Sign up for free to place
                orders and connect with verified IIT students!
              </p>
            </div>
          </div>

          {/* Search and filters */}
          <div className="mb-4 space-y-3">
            {/* Search and filters row */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              {/* Search bar */}
              <div className="relative md:col-span-6">
                <Search
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 transform text-[#76777B]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-2 border-[#3A3A3A] bg-[#2A2A2A] py-2.5 pr-4 pl-10 text-sm text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  placeholder="Search for food or seller name..."
                />
              </div>

              {/* Location filter */}
              <div className="relative md:col-span-3">
                <MapPin
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 transform text-[#76777B]"
                />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full appearance-none rounded-lg border-2 border-[#3A3A3A] bg-[#2A2A2A] py-2.5 pr-8 pl-10 text-sm text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  title="Filter by location"
                >
                  <option>All Locations</option>
                  {LOCATIONS.map((loc: string) => (
                    <option key={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Category filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none rounded-lg border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-2.5 text-sm text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  title="Filter by category"
                >
                  <option>All</option>
                  {CATEGORIES.map((cat: string) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-8">
              <LoadingState variant="spinner" size="lg" text="Loading food items..." />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-lg border-2 border-red-800 bg-red-950 p-4 text-center">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Food items grid */}
          {!loading && !error && (
            <>
              {filteredItems.length > 0 ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-400">
                      {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="transform overflow-hidden rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative bg-[#2A2A2A] p-4">
                          {item.image.startsWith('http') ? (
                            <div className="flex h-36 w-full items-center justify-center">
                              <img
                                src={item.image}
                                alt={`${item.name} - ${item.description || 'Food listing'} by ${item.seller}`}
                                loading="lazy"
                                className="h-full w-full rounded-lg object-cover"
                              />
                            </div>
                          ) : (
                            <div className="text-center text-6xl">{item.image}</div>
                          )}
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                            {isPopular(item) && (
                              <span className="rounded-full bg-[#FF9900] px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
                                🔥 POPULAR
                              </span>
                            )}
                            <span className="rounded-full bg-[#0A6A0A] px-2.5 py-0.5 text-xs font-bold text-[#88FF88] shadow-md">
                              ✓ AVAILABLE
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="mb-1 text-base leading-tight font-bold text-[#E0E0E0]">
                            {item.name}
                          </h3>
                          <p className="mb-1 line-clamp-2 text-xs text-[#A0A0A0]">
                            {item.description}
                          </p>
                          <p className="mb-2 text-xs font-medium text-[#FF4444]">
                            by {item.seller.split(' ')[0]}
                          </p>

                          <div className="mb-3 flex items-center gap-2">
                            <MapPin size={12} className="text-[#888888]" />
                            <span className="text-xs text-[#B0B0B0]">{item.location}</span>
                            {sellerRatings[item.sellerId] && (
                              <div className="ml-auto flex items-center gap-1">
                                <Star size={12} className="fill-[#FFD700] text-[#FFD700]" />
                                <span className="text-xs font-semibold text-[#E0E0E0]">
                                  {sellerRatings[item.sellerId]}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-2xl font-bold text-[#CC0000]">
                              ${item.price.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={onSignUp}
                              className="transform rounded-lg bg-[#CC0000] px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                              aria-label="Sign up to order this item"
                            >
                              Sign Up
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-3 text-5xl">🔍</div>
                  <h3 className="mb-2 text-lg font-bold text-white">No food items found</h3>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              )}
            </>
          )}

          {/* Bottom CTA */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="mt-8 rounded-xl border-2 border-[#CC0000] bg-[#1E1E1E] p-6 text-center">
              <h3 className="mb-2 text-xl font-bold text-white">Ready to Order?</h3>
              <p className="mb-4 text-sm text-gray-400">
                Create your free account to start ordering from verified IIT students
              </p>
              <button
                onClick={onSignUp}
                className="transform rounded-lg bg-[#CC0000] px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                type="button"
              >
                Create Free Account →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FoodPreview;
