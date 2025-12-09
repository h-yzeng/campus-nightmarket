import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import {
  getBuyerOrders,
  getSellerOrders,
  getPaginatedBuyerOrders,
} from '../../services/orders/orderService';
import type { FirebaseOrder } from '../../types/firebase';
import type { Order, CartItem } from '../../types';

// Simple hash function to convert Firebase ID string to a consistent number
const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const convertFirebaseOrderToApp = (firebaseOrder: FirebaseOrder): Order => {
  const items: CartItem[] = firebaseOrder.items.map((item) => ({
    id: hashStringToNumber(item.listingId),
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.imageURL,
    seller: item.seller,
    sellerId: firebaseOrder.sellerId,
    location: item.location,
    description: '',
    rating: 'N/A',
  }));

  return {
    id: hashStringToNumber(firebaseOrder.id),
    firebaseId: firebaseOrder.id,
    items,
    sellerId: firebaseOrder.sellerId,
    sellerName: firebaseOrder.sellerName,
    sellerLocation: firebaseOrder.items[0]?.location || '',
    total: firebaseOrder.total,
    status: firebaseOrder.status,
    paymentMethod: firebaseOrder.paymentMethod,
    pickupTime: firebaseOrder.pickupTime,
    orderDate:
      firebaseOrder.createdAt?.toDate?.().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) ||
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    notes: firebaseOrder.notes,
    buyerName: firebaseOrder.buyerName,
    reviewId: firebaseOrder.reviewId,
    hasReview: firebaseOrder.hasReview,
  };
};

export const useBuyerOrdersQuery = (userId: string | undefined, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['orders', 'buyer', userId],
    queryFn: async () => {
      if (!userId) return [];
      const firebaseOrders = await getBuyerOrders(userId);
      return firebaseOrders.map(convertFirebaseOrderToApp);
    },
    enabled: !!userId,
    staleTime: 15_000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: refetchInterval !== undefined ? refetchInterval : 12_000,
    refetchOnWindowFocus: 'always',
    refetchIntervalInBackground: false,
    retry: 2,
  });
};

export const useSellerOrdersQuery = (userId: string | undefined, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['orders', 'seller', userId],
    queryFn: async () => {
      if (!userId) return [];
      const firebaseOrders = await getSellerOrders(userId);
      return firebaseOrders.map(convertFirebaseOrderToApp);
    },
    enabled: !!userId,
    staleTime: 7_500,
    gcTime: 5 * 60 * 1000,
    refetchInterval: refetchInterval !== undefined ? refetchInterval : 6_000,
    refetchOnWindowFocus: 'always',
    refetchIntervalInBackground: false,
    retry: 2,
  });
};

/**
 * Infinite query hook for buyer orders with pagination
 */
export const useInfiniteBuyerOrdersQuery = (userId: string | undefined, pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: ['orders', 'buyer', 'infinite', userId],
    queryFn: async ({ pageParam }: { pageParam?: QueryDocumentSnapshot }) => {
      if (!userId) return { orders: [], lastDoc: null };
      const result = await getPaginatedBuyerOrders(userId, pageSize, pageParam);
      return {
        orders: result.orders.map(convertFirebaseOrderToApp),
        lastDoc: result.lastDoc,
      };
    },
    enabled: !!userId,
    staleTime: 15_000,
    gcTime: 5 * 60 * 1000,
    getNextPageParam: (lastPage) => lastPage.lastDoc ?? undefined,
    initialPageParam: undefined as QueryDocumentSnapshot | undefined,
    retry: 2,
  });
};
