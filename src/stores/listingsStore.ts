import { create } from 'zustand';
import type { FoodItem, ListingWithFirebaseId } from '../types';

interface ListingsState {
  // State
  foodItems: FoodItem[];
  sellerListings: ListingWithFirebaseId[];
  listingsLoading: boolean;
  listingsError: string | null;

  // Actions
  setFoodItems: (items: FoodItem[]) => void;
  setSellerListings: (listings: ListingWithFirebaseId[]) => void;
  setListingsLoading: (loading: boolean) => void;
  setListingsError: (error: string | null) => void;
  updateListingAvailability: (listingId: number, isAvailable: boolean) => void;
  removeListing: (listingId: number | string) => void;
  clearListings: () => void;
}

export const useListingsStore = create<ListingsState>((set) => ({
  // Initial state
  foodItems: [],
  sellerListings: [],
  listingsLoading: false,
  listingsError: null,

  // Actions
  setFoodItems: (items) => set({ foodItems: items }),

  setSellerListings: (listings) => set({ sellerListings: listings }),

  setListingsLoading: (loading) => set({ listingsLoading: loading }),

  setListingsError: (error) => set({ listingsError: error }),

  updateListingAvailability: (listingId, isAvailable) =>
    set((state) => ({
      sellerListings: state.sellerListings.map((listing) =>
        listing.id === listingId ? { ...listing, isAvailable } : listing
      ),
      foodItems: state.foodItems.map((item) =>
        item.id === listingId ? { ...item, isAvailable } : item
      ),
    })),

  removeListing: (listingId) =>
    set((state) => {
      const id = typeof listingId === 'string'
        ? parseInt(listingId.substring(0, 8), 16)
        : listingId;

      return {
        sellerListings: state.sellerListings.filter(
          (listing) => listing.id !== id && listing.firebaseId !== listingId
        ),
        foodItems: state.foodItems.filter((item) => item.id !== id),
      };
    }),

  clearListings: () =>
    set({
      foodItems: [],
      sellerListings: [],
      listingsLoading: false,
      listingsError: null,
    }),
}));
