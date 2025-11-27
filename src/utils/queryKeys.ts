/**
 * Query Key Factories
 * Centralized and type-safe query keys for React Query
 *
 * Benefits:
 * - Prevents typos and inconsistencies
 * - Makes invalidation easier
 * - Provides better TypeScript support
 * - Easier to refactor
 */

import type { QueryClient } from '@tanstack/react-query';

// Base keys for different data types
export const queryKeys = {
  // Listings
  listings: {
    all: ['listings'] as const,
    lists: () => [...queryKeys.listings.all, 'list'] as const,
    list: (filters?: { location?: string; category?: string; search?: string }) =>
      [...queryKeys.listings.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.listings.all, 'detail', id] as const,
    seller: (sellerId: string) => [...queryKeys.listings.all, 'seller', sellerId] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    buyer: (buyerId: string) => [...queryKeys.orders.all, 'buyer', buyerId] as const,
    seller: (sellerId: string) => [...queryKeys.orders.all, 'seller', sellerId] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },

  // Reviews
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    seller: (sellerId: string) => [...queryKeys.reviews.all, 'seller', sellerId] as const,
    order: (orderId: string) => [...queryKeys.reviews.all, 'order', orderId] as const,
    ratings: () => [...queryKeys.reviews.all, 'ratings'] as const,
  },

  // User Profile
  user: {
    all: ['user'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
    sellerProfile: (sellerId: string) => [...queryKeys.user.all, 'seller', sellerId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => [...queryKeys.notifications.all, 'list', userId] as const,
  },
} as const;

/**
 * Stale time configuration for different query types
 * Adjust these based on how frequently data changes
 */
export const staleTimeConfig = {
  // Listings change frequently (new listings, availability changes)
  listings: 1 * 60 * 1000, // 1 minute

  // Orders change less frequently for buyers, more for sellers
  ordersBuyer: 2 * 60 * 1000, // 2 minutes
  ordersSeller: 30 * 1000, // 30 seconds (sellers need fresh order status)

  // Reviews rarely change
  reviews: 10 * 60 * 1000, // 10 minutes

  // User profiles change rarely
  userProfile: 15 * 60 * 1000, // 15 minutes

  // Seller ratings should be relatively fresh
  sellerRatings: 5 * 60 * 1000, // 5 minutes

  // Notifications need to be fresh
  notifications: 30 * 1000, // 30 seconds
} as const;

/**
 * GC time configuration (how long to keep unused data in cache)
 */
export const gcTimeConfig = {
  // Keep listing data longer (user might browse back)
  listings: 30 * 60 * 1000, // 30 minutes

  // Keep order data for a while (user might check multiple times)
  orders: 20 * 60 * 1000, // 20 minutes

  // Reviews can be kept longer
  reviews: 30 * 60 * 1000, // 30 minutes

  // User profiles can be kept for a while
  userProfile: 30 * 60 * 1000, // 30 minutes

  // Notifications don't need to be kept long
  notifications: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Helper to invalidate all queries related to a specific resource
 */
export const invalidationHelpers = {
  // Invalidate all listing-related queries
  invalidateListings: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
  },

  // Invalidate all order-related queries
  invalidateOrders: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  },

  // Invalidate all review-related queries
  invalidateReviews: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
  },

  // Invalidate specific seller's data
  invalidateSellerData: (queryClient: QueryClient, sellerId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.seller(sellerId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.seller(sellerId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.seller(sellerId) });
  },

  // Invalidate specific buyer's data
  invalidateBuyerData: (queryClient: QueryClient, buyerId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.buyer(buyerId) });
  },
} as const;

/**
 * Prefetch helpers for common navigation patterns
 */
export const prefetchHelpers = {
  // Prefetch listing details when hovering over a listing card
  prefetchListingDetails: async (queryClient: QueryClient, listingId: string, fetchFn: () => Promise<unknown>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.listings.detail(listingId),
      queryFn: fetchFn,
      staleTime: staleTimeConfig.listings,
    });
  },

  // Prefetch order details when user navigates to orders page
  prefetchOrderDetails: async (queryClient: QueryClient, orderId: string, fetchFn: () => Promise<unknown>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.orders.detail(orderId),
      queryFn: fetchFn,
      staleTime: staleTimeConfig.ordersBuyer,
    });
  },

  // Prefetch seller profile when hovering over seller name
  prefetchSellerProfile: async (queryClient: QueryClient, sellerId: string, fetchFn: () => Promise<unknown>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.sellerProfile(sellerId),
      queryFn: fetchFn,
      staleTime: staleTimeConfig.userProfile,
    });
  },
} as const;
