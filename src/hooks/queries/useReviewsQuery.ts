import { useQuery } from '@tanstack/react-query';
import { getSellerReviews, getBuyerReviews, getOrderReview } from '../../services/reviews/reviewService';
import type { FirebaseReview } from '../../types/firebase';
import type { Review } from '../../types';

// Simple hash function to convert Firebase ID string to a consistent number
const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const convertFirebaseReviewToApp = (firebaseReview: FirebaseReview): Review => {
  return {
    id: firebaseReview.id,
    orderId: firebaseReview.orderId,
    sellerId: firebaseReview.sellerId,
    sellerName: firebaseReview.sellerName,
    buyerId: firebaseReview.buyerId,
    buyerName: firebaseReview.buyerName,
    rating: firebaseReview.rating,
    comment: firebaseReview.comment,
    itemNames: firebaseReview.itemNames,
    listingIds: firebaseReview.listingIds.map(id => hashStringToNumber(id)),
    createdAt: firebaseReview.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
  };
};

export const useSellerReviewsQuery = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['reviews', 'seller', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const firebaseReviews = await getSellerReviews(sellerId);
      return firebaseReviews.map(convertFirebaseReviewToApp);
    },
    enabled: !!sellerId,
  });
};

export const useBuyerReviewsQuery = (buyerId: string | undefined) => {
  return useQuery({
    queryKey: ['reviews', 'buyer', buyerId],
    queryFn: async () => {
      if (!buyerId) return [];
      const firebaseReviews = await getBuyerReviews(buyerId);
      return firebaseReviews.map(convertFirebaseReviewToApp);
    },
    enabled: !!buyerId,
  });
};

export const useOrderReviewQuery = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['review', 'order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const firebaseReview = await getOrderReview(orderId);
      return firebaseReview ? convertFirebaseReviewToApp(firebaseReview) : null;
    },
    enabled: !!orderId,
  });
};

export const useSellerRatingsQuery = (sellerIds: string[]) => {
  return useQuery({
    queryKey: ['sellerRatings', sellerIds],
    queryFn: async () => {
      if (sellerIds.length === 0) return {};

      // Fetch ratings for all sellers in parallel
      const ratings = await Promise.all(
        sellerIds.map(async (sellerId) => {
          const reviews = await getSellerReviews(sellerId);
          const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : null;
          return { sellerId, rating: avgRating };
        })
      );

      // Convert to a map of sellerId -> rating
      return ratings.reduce((acc, { sellerId, rating }) => {
        acc[sellerId] = rating;
        return acc;
      }, {} as Record<string, string | null>);
    },
    enabled: sellerIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useOrderReviewsQuery = (orderIds: string[]) => {
  return useQuery({
    queryKey: ['orderReviews', orderIds],
    queryFn: async () => {
      if (orderIds.length === 0) return {};

      // Fetch reviews for all orders in parallel
      const reviews = await Promise.all(
        orderIds.map(async (orderId) => {
          const firebaseReview = await getOrderReview(orderId);
          return {
            orderId,
            review: firebaseReview ? convertFirebaseReviewToApp(firebaseReview) : null
          };
        })
      );

      // Convert to a map of orderId -> review (only include reviews that exist)
      return reviews.reduce((acc, { orderId, review }) => {
        if (review) {
          acc[orderId] = review;
        }
        return acc;
      }, {} as Record<string, Review>);
    },
    enabled: orderIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
