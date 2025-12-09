import { useMemo } from 'react';
import type { FoodItem } from '../../types';

interface UseFilteredListingsParams {
  items: FoodItem[];
  searchQuery: string;
  selectedLocation: string;
  selectedCategory: string;
  priceRange: [number, number];
  sortBy: string;
  showAvailableOnly: boolean;
  sellerRatings: Record<string, string | null>;
}

/**
 * Custom hook to filter and sort food items based on various criteria
 * Extracted from Browse.tsx to improve reusability and testability
 */
export const useFilteredListings = ({
  items,
  searchQuery,
  selectedLocation,
  selectedCategory,
  priceRange,
  sortBy,
  showAvailableOnly,
  sellerRatings,
}: UseFilteredListingsParams): FoodItem[] => {
  return useMemo(() => {
    // Filter items
    const filtered = items.filter((item) => {
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

      // Active filter - only show active listings
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

          // If ratings are different, sort by rating
          if (ratingA !== ratingB) {
            return ratingB - ratingA;
          }

          // If ratings are equal, sort by popularity (purchase count)
          const purchasesA = a.purchaseCount || 0;
          const purchasesB = b.purchaseCount || 0;
          return purchasesB - purchasesA;
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
    items,
    searchQuery,
    selectedLocation,
    selectedCategory,
    priceRange,
    sortBy,
    showAvailableOnly,
    sellerRatings,
  ]);
};
