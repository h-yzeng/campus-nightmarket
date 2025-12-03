import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { getAllListings, getPaginatedListings } from '../../services/listings/listingService';
import type { FirebaseListing } from '../../types/firebase';
import type { FoodItem, ListingWithFirebaseId } from '../../types';

/**
 * Converts a Firebase string ID to a numeric ID using a simple hash function
 * This ensures we always get a valid number (never NaN)
 */
const firebaseIdToNumericId = (firebaseId: string): number => {
  let hash = 0;
  for (let i = 0; i < firebaseId.length; i++) {
    const char = firebaseId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Return absolute value to ensure positive number
  return Math.abs(hash);
};

const convertFirebaseListingToFoodItem = (listing: FirebaseListing): FoodItem => {
  return {
    id: firebaseIdToNumericId(listing.id),
    name: listing.name,
    seller: listing.sellerName,
    sellerId: listing.sellerId,
    price: listing.price,
    image: listing.imageURL,
    location: listing.location,
    rating: 'N/A',
    description: listing.description,
    category: listing.category,
    isActive: listing.isActive,
    isAvailable: listing.isAvailable,
    datePosted: listing.createdAt.toDate().toISOString(),
  };
};

const convertFirebaseListingToListingWithId = (listing: FirebaseListing): ListingWithFirebaseId => {
  return {
    id: firebaseIdToNumericId(listing.id),
    name: listing.name,
    description: listing.description,
    price: listing.price,
    image: listing.imageURL,
    location: listing.location,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    isActive: listing.isActive,
    isAvailable: listing.isAvailable,
    category: listing.category,
    datePosted: listing.createdAt.toDate().toISOString(),
    firebaseId: listing.id,
  };
};

export const useListingsQuery = () => {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const listings = await getAllListings(true);
      return listings.map(convertFirebaseListingToFoodItem);
    },
    // Override global defaults for real-time synchronization in Browse.tsx
    refetchOnMount: true, // Always refetch when Browse.tsx mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    staleTime: 0, // Always consider data stale for immediate updates
  });
};

export const useSellerListingsQuery = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['listings', 'seller', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const { getListingsBySeller } = await import('../../services/listings/listingService');
      const listings = await getListingsBySeller(sellerId);
      return listings.map(convertFirebaseListingToListingWithId);
    },
    enabled: !!sellerId,
    // Override global defaults for real-time synchronization in SellerListings.tsx
    refetchOnMount: true, // Always refetch when SellerListings.tsx mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    staleTime: 0, // Always consider data stale for immediate updates
  });
};

export const useInfiniteListingsQuery = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['listings', 'infinite', pageSize],
    queryFn: async ({ pageParam }: { pageParam: QueryDocumentSnapshot | null }) => {
      const result = await getPaginatedListings(pageSize, pageParam || null, true);
      return {
        listings: result.listings.map(convertFirebaseListingToFoodItem),
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
      };
    },
    initialPageParam: null as QueryDocumentSnapshot | null,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },
  });
};
