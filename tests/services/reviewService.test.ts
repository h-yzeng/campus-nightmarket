/**
 * Review Service Tests
 *
 * Tests for review management functionality including:
 * - Review creation
 * - Review retrieval (by ID, seller, buyer, order)
 * - Average rating calculation
 * - Order review status checking
 */

import {
  createReview,
  getReview,
  getSellerReviews,
  getBuyerReviews,
  getOrderReview,
  getSellerAverageRating,
  hasReviewedOrder,
} from '../../src/services/reviews/reviewService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import type { CreateReview, FirebaseReview } from '../../src/types/firebase';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../../src/config/firebase', () => ({
  db: {},
}));

describe('Review Service', () => {
  const mockReviewId = 'review-123';
  const mockOrderId = 'order-456';
  const mockBuyerId = 'buyer-789';
  const mockSellerId = 'seller-012';

  const mockCreateReview: CreateReview = {
    orderId: mockOrderId,
    buyerId: mockBuyerId,
    buyerName: 'John Doe',
    sellerId: mockSellerId,
    sellerName: 'Jane Smith',
    rating: 5,
    comment: 'Great food and service!',
    itemNames: ['Pizza Slice', 'Burger'],
    listingIds: ['listing-1', 'listing-2'],
  };

  const mockFirebaseReview: FirebaseReview = {
    id: mockReviewId,
    ...mockCreateReview,
    createdAt: { seconds: 1234567890, nanoseconds: 0 } as FirebaseReview['createdAt'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should successfully create a review', async () => {
      const mockDocRef = { id: mockReviewId };
      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const reviewId = await createReview(mockCreateReview);

      expect(addDoc).toHaveBeenCalled();
      expect(reviewId).toBe(mockReviewId);
    });

    it('should handle reviews without comments', async () => {
      const mockDocRef = { id: mockReviewId };
      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const reviewWithoutComment = {
        ...mockCreateReview,
        comment: undefined,
      };

      const reviewId = await createReview(reviewWithoutComment);

      expect(reviewId).toBe(mockReviewId);
    });

    it('should handle Firestore errors gracefully', async () => {
      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(createReview(mockCreateReview)).rejects.toThrow('Failed to create review');
    });
  });

  describe('getReview', () => {
    it('should retrieve a review by ID', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: mockReviewId,
        data: () => mockCreateReview,
      };

      (doc as jest.Mock).mockReturnValue('review-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const review = await getReview(mockReviewId);

      expect(doc).toHaveBeenCalledWith(db, 'reviews', mockReviewId);
      expect(review).toEqual({
        id: mockReviewId,
        ...mockCreateReview,
      });
    });

    it('should return null if review does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue('review-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const review = await getReview('nonexistent-id');

      expect(review).toBeNull();
    });

    it('should handle Firestore errors', async () => {
      (doc as jest.Mock).mockReturnValue('review-ref');
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getReview(mockReviewId)).rejects.toThrow('Failed to get review');
    });
  });

  describe('getSellerReviews', () => {
    it('should retrieve all reviews for a seller', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateReview }) => void) => {
          callback({
            id: mockReviewId,
            data: () => mockCreateReview,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const reviews = await getSellerReviews(mockSellerId);

      expect(where).toHaveBeenCalledWith('sellerId', '==', mockSellerId);
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(reviews).toHaveLength(1);
      expect(reviews[0].id).toBe(mockReviewId);
    });

    it('should handle empty results', async () => {
      const mockQuerySnapshot = {
        forEach: () => {},
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const reviews = await getSellerReviews(mockSellerId);

      expect(reviews).toEqual([]);
    });

    it('should handle Firestore errors', async () => {
      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getSellerReviews(mockSellerId)).rejects.toThrow('Failed to get seller reviews');
    });
  });

  describe('getBuyerReviews', () => {
    it('should retrieve all reviews by a buyer', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateReview }) => void) => {
          callback({
            id: mockReviewId,
            data: () => mockCreateReview,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const reviews = await getBuyerReviews(mockBuyerId);

      expect(where).toHaveBeenCalledWith('buyerId', '==', mockBuyerId);
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(reviews).toHaveLength(1);
    });

    it('should handle empty results', async () => {
      const mockQuerySnapshot = {
        forEach: () => {},
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const reviews = await getBuyerReviews(mockBuyerId);

      expect(reviews).toEqual([]);
    });

    it('should handle Firestore errors', async () => {
      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getBuyerReviews(mockBuyerId)).rejects.toThrow('Failed to get buyer reviews');
    });
  });

  describe('getOrderReview', () => {
    it('should retrieve review for an order', async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: mockReviewId,
            data: () => mockCreateReview,
          },
        ],
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const review = await getOrderReview(mockOrderId);

      expect(where).toHaveBeenCalledWith('orderId', '==', mockOrderId);
      expect(review).toEqual({
        id: mockReviewId,
        ...mockCreateReview,
      });
    });

    it('should return null if order has no review', async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: [],
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const review = await getOrderReview(mockOrderId);

      expect(review).toBeNull();
    });

    it('should handle Firestore errors', async () => {
      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getOrderReview(mockOrderId)).rejects.toThrow('Failed to get order review');
    });
  });

  describe('getSellerAverageRating', () => {
    it('should calculate average rating correctly', async () => {
      const mockReviews = [
        { ...mockFirebaseReview, rating: 5 },
        { ...mockFirebaseReview, rating: 4 },
        { ...mockFirebaseReview, rating: 3 },
      ];

      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateReview }) => void) => {
          mockReviews.forEach((review) => {
            callback({
              id: review.id,
              data: () => review,
            });
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const avgRating = await getSellerAverageRating(mockSellerId);

      expect(avgRating).toBe(4); // (5 + 4 + 3) / 3 = 4
    });

    it('should return 0 if seller has no reviews', async () => {
      const mockQuerySnapshot = {
        forEach: () => {},
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const avgRating = await getSellerAverageRating(mockSellerId);

      expect(avgRating).toBe(0);
    });

    it('should handle Firestore errors and return 0', async () => {
      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const avgRating = await getSellerAverageRating(mockSellerId);

      expect(avgRating).toBe(0);
    });

    it('should handle single review correctly', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateReview }) => void) => {
          callback({
            id: mockReviewId,
            data: () => ({ ...mockFirebaseReview, rating: 5 }),
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const avgRating = await getSellerAverageRating(mockSellerId);

      expect(avgRating).toBe(5);
    });

    it('should calculate decimal average correctly', async () => {
      const mockReviews = [
        { ...mockFirebaseReview, rating: 5 },
        { ...mockFirebaseReview, rating: 4 },
      ];

      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateReview }) => void) => {
          mockReviews.forEach((review) => {
            callback({
              id: review.id,
              data: () => review,
            });
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const avgRating = await getSellerAverageRating(mockSellerId);

      expect(avgRating).toBe(4.5); // (5 + 4) / 2 = 4.5
    });
  });

  describe('hasReviewedOrder', () => {
    it('should return true if order has been reviewed', async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: mockReviewId,
            data: () => mockCreateReview,
          },
        ],
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const hasReviewed = await hasReviewedOrder(mockOrderId);

      expect(hasReviewed).toBe(true);
    });

    it('should return false if order has not been reviewed', async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: [],
      };

      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const hasReviewed = await hasReviewedOrder(mockOrderId);

      expect(hasReviewed).toBe(false);
    });

    it('should return false on errors', async () => {
      (collection as jest.Mock).mockReturnValue('reviews-collection');
      (query as jest.Mock).mockReturnValue('query');
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const hasReviewed = await hasReviewedOrder(mockOrderId);

      expect(hasReviewed).toBe(false);
    });
  });
});
