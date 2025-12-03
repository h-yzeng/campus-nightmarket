import { Search, MapPin, Filter, DollarSign, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  LOCATIONS,
  ALL_LOCATIONS_OPTION,
  CATEGORIES,
  ALL_CATEGORIES_OPTION,
} from '../../constants';

interface FiltersPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showAvailableOnly: boolean;
  onAvailableOnlyChange: (value: boolean) => void;
  resultCount: number;
}

const FiltersPanel = ({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  showAvailableOnly,
  onAvailableOnlyChange,
  resultCount,
}: FiltersPanelProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="border-b-2 border-[#2A2A2A] bg-[#1A1A1B] shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Primary Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
              size={20}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for food or sellers..."
              className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#252525] py-3 pr-4 pl-12 text-base text-[#E0E0E0] placeholder-gray-500 transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
              aria-label="Search for food or sellers"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-[#CC0000]" aria-hidden="true" />
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="flex-1 rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-3 text-base font-medium text-[#E0E0E0] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
              aria-label="Filter by location"
            >
              <option>{ALL_LOCATIONS_OPTION}</option>
              {LOCATIONS.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#CC0000] transition-all hover:bg-[#252525]"
            aria-expanded={showAdvancedFilters}
            aria-controls="advanced-filters"
          >
            <SlidersHorizontal size={16} />
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>

          <p className="text-sm font-medium text-[#B0B0B0]">
            {resultCount} item{resultCount !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div
            id="advanced-filters"
            className="mt-4 grid grid-cols-1 gap-4 rounded-xl border-2 border-[#3A3A3A] bg-[#252525] p-4 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Category */}
            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#B0B0B0]"
              >
                <Filter size={14} />
                Category
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full rounded-lg border-2 border-[#3A3A3A] bg-[#1E1E1E] px-3 py-2 text-sm text-[#E0E0E0] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
              >
                <option value={ALL_CATEGORIES_OPTION}>{ALL_CATEGORIES_OPTION}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label
                htmlFor="price-range"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#B0B0B0]"
              >
                <DollarSign size={14} />
                Price Range
              </label>
              <div className="space-y-2">
                <input
                  id="price-range"
                  type="range"
                  min="0"
                  max="50"
                  value={priceRange[1]}
                  onChange={(e) => onPriceRangeChange([0, Number(e.target.value)])}
                  className="w-full accent-[#CC0000]"
                  aria-label="Maximum price"
                />
                <div className="flex justify-between text-xs text-[#A0A0A0]">
                  <span>$0</span>
                  <span className="font-semibold text-[#E0E0E0]">${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label
                htmlFor="sort-by"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#B0B0B0]"
              >
                <SlidersHorizontal size={14} />
                Sort By
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full rounded-lg border-2 border-[#3A3A3A] bg-[#1E1E1E] px-3 py-2 text-sm text-[#E0E0E0] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Toggle */}
            <div>
              <label
                htmlFor="available-only"
                className="mb-2 block text-sm font-semibold text-[#B0B0B0]"
              >
                Availability
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-[#3A3A3A] bg-[#1E1E1E] px-3 py-2">
                <input
                  id="available-only"
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => onAvailableOnlyChange(e.target.checked)}
                  className="h-4 w-4 rounded border-[#3A3A3A] bg-[#252525] text-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:ring-offset-0"
                />
                <span className="text-sm text-[#E0E0E0]">In-stock only</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;
