/**
 * Listing Service Tests
 *
 * Tests for listing management functionality including:
 * - Listing creation with validation
 * - Listing retrieval (all, by seller, by location, by category)
 * - Pagination
 * - Listing updates
 * - Availability toggling
 * - Listing deletion
 */

import {
  createListing,
  getListing,
  getAllListings,
  getPaginatedListings,
  getListingsBySeller,
  getListingsByLocation,
  getListingsByCategory,
  updateListing,
  toggleListingAvailability,
  deleteListing,
} from '../../src/services/listings/listingService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import type { CreateListing, FirebaseListing } from '../../src/types/firebase';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../../src/config/firebase', () => ({
  db: {},
}));

describe('Listing Service', () => {
  const mockListingId = 'listing-123';
  const mockSellerId = 'seller-456';

  const mockCreateListing: CreateListing = {
    name: 'Pizza Slice',
    description: 'Delicious pepperoni pizza slice',
    price: 5.99,
    imageURL: 'https://example.com/pizza.jpg',
    location: 'Stuart Building',
    sellerId: mockSellerId,
    sellerName: 'Jane Smith',
    isActive: true,
    isAvailable: true,
    category: 'Meals',
    purchaseCount: 0,
  };

  const mockFirebaseListing: FirebaseListing = {
    id: mockListingId,
    ...mockCreateListing,
    createdAt: { seconds: 1234567890, nanoseconds: 0 } as FirebaseListing['createdAt'],
    updatedAt: { seconds: 1234567890, nanoseconds: 0 } as FirebaseListing['updatedAt'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createListing', () => {
    it('should successfully create a listing with valid data', async () => {
      const mockDocRef = { id: mockListingId };
      (collection as jest.Mock).mockReturnValue('listings-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const listingId = await createListing(mockCreateListing);

      expect(addDoc).toHaveBeenCalled();
      expect(listingId).toBe(mockListingId);
    });

    it('should validate price', async () => {
      const invalidListing = {
        ...mockCreateListing,
        price: -10,
      };

      await expect(createListing(invalidListing)).rejects.toThrow();
    });

    it('should validate category', async () => {
      const invalidListing = {
        ...mockCreateListing,
        category: 'InvalidCategory',
      };

      await expect(createListing(invalidListing)).rejects.toThrow();
    });

    it('should sanitize text fields', async () => {
      const mockDocRef = { id: mockListingId };
      (collection as jest.Mock).mockReturnValue('listings-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const listingWithMaliciousInput = {
        ...mockCreateListing,
        description: '<script>alert("xss")</script>',
      };

      await createListing(listingWithMaliciousInput);

      expect(addDoc).toHaveBeenCalled();
      const callArgs = (addDoc as jest.Mock).mock.calls[0][1];
      expect(callArgs.description).not.toContain('<script>');
    });

    it('should handle Firestore errors gracefully', async () => {
      (collection as jest.Mock).mockReturnValue('listings-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(createListing(mockCreateListing)).rejects.toThrow('Firestore error');
    });
  });

  describe('getListing', () => {
    it('should retrieve a listing by ID', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: mockListingId,
        data: () => mockCreateListing,
      };

      (doc as jest.Mock).mockReturnValue('listing-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const listing = await getListing(mockListingId);

      expect(doc).toHaveBeenCalledWith(db, 'listings', mockListingId);
      expect(listing).toEqual({
        id: mockListingId,
        ...mockCreateListing,
      });
    });

    it('should return null if listing does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue('listing-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const listing = await getListing('nonexistent-id');

      expect(listing).toBeNull();
    });

    it('should handle Firestore errors', async () => {
      (doc as jest.Mock).mockReturnValue('listing-ref');
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getListing(mockListingId)).rejects.toThrow('Failed to get listing');
    });
  });

  describe('getAllListings', () => {
    it('should retrieve all listings', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateListing }) => void) => {
          callback({
            id: mockListingId,
            data: () => mockCreateListing,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const listings = await getAllListings();

      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(listings).toHaveLength(1);
      expect(listings[0].id).toBe(mockListingId);
    });

    it('should retrieve only active listings when onlyAvailable is true', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateListing }) => void) => {
          callback({
            id: mockListingId,
            data: () => mockCreateListing,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const listings = await getAllListings(true);

      expect(where).toHaveBeenCalledWith('isActive', '==', true);
      expect(listings).toHaveLength(1);
    });

    it('should handle empty results', async () => {
      const mockQuerySnapshot = {
        forEach: () => {},
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const listings = await getAllListings();

      expect(listings).toEqual([]);
    });
  });

  describe('getPaginatedListings', () => {
    it('should retrieve paginated listings', async () => {
      const mockDocs = [
        {
          id: 'listing-1',
          data: () => ({ ...mockCreateListing, name: 'Item 1' }),
        },
        {
          id: 'listing-2',
          data: () => ({ ...mockCreateListing, name: 'Item 2' }),
        },
      ];

      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateListing }) => void) => {
          mockDocs.forEach(callback);
        },
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (limit as jest.Mock).mockReturnValue('limit-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getPaginatedListings(10);

      expect(limit).toHaveBeenCalledWith(11); // pageSize + 1
      expect(result.listings).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should indicate hasMore when there are more results', async () => {
      const mockDocs = Array.from({ length: 11 }, (_, i) => ({
        id: `listing-${i}`,
        data: () => ({ ...mockCreateListing, name: `Item ${i}` }),
      }));

      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateListing }) => void) => {
          mockDocs.forEach(callback);
        },
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (limit as jest.Mock).mockReturnValue('limit-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getPaginatedListings(10);

      expect(result.listings).toHaveLength(10);
      expect(result.hasMore).toBe(true);
    });

    it('should support pagination with lastDoc', async () => {
      const mockLastDoc = { id: 'last-doc' } as QueryDocumentSnapshot;
      const mockDocs = [
        {
          id: 'listing-next',
          data: () => mockCreateListing,
        },
      ];

      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateListing }) => void) => {
          mockDocs.forEach(callback);
        },
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (limit as jest.Mock).mockReturnValue('limit-clause');
      (startAfter as jest.Mock).mockReturnValue('start-after-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      await getPaginatedListings(10, mockLastDoc);

      expect(startAfter).toHaveBeenCalledWith(mockLastDoc);
    });
  });

  describe('getListingsBySeller', () => {
    it('should retrieve all listings for a seller', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateListing }) => void) => {
          callback({
            id: mockListingId,
            data: () => mockCreateListing,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const listings = await getListingsBySeller(mockSellerId);

      expect(where).toHaveBeenCalledWith('sellerId', '==', mockSellerId);
      expect(listings).toHaveLength(1);
    });
  });

  describe('getListingsByLocation', () => {
    it('should retrieve listings by location', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateListing }) => void) => {
          callback({
            id: mockListingId,
            data: () => mockCreateListing,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const listings = await getListingsByLocation('Stuart Building');

      expect(where).toHaveBeenCalledWith('location', '==', 'Stuart Building');
      expect(where).toHaveBeenCalledWith('isActive', '==', true);
      expect(listings).toHaveLength(1);
    });
  });

  describe('getListingsByCategory', () => {
    it('should retrieve listings by category', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateListing }) => void) => {
          callback({
            id: mockListingId,
            data: () => mockCreateListing,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('listings-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const listings = await getListingsByCategory('Meals');

      expect(where).toHaveBeenCalledWith('category', '==', 'Meals');
      expect(where).toHaveBeenCalledWith('isActive', '==', true);
      expect(listings).toHaveLength(1);
    });
  });

  describe('updateListing', () => {
    it('should update a listing', async () => {
      (doc as jest.Mock).mockReturnValue('listing-ref');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateListing(mockListingId, { price: 6.99 });

      expect(doc).toHaveBeenCalledWith(db, 'listings', mockListingId);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should handle Firestore errors', async () => {
      (doc as jest.Mock).mockReturnValue('listing-ref');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(updateListing(mockListingId, { price: 6.99 })).rejects.toThrow(
        'Failed to update listing'
      );
    });
  });

  describe('toggleListingAvailability', () => {
    it('should toggle listing from active to inactive', async () => {
      const activeListing = { ...mockFirebaseListing, isActive: true };
      const mockDocSnap = {
        exists: () => true,
        id: mockListingId,
        data: () => activeListing,
      };

      (doc as jest.Mock).mockReturnValue('listing-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await toggleListingAvailability(mockListingId);

      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.isActive).toBe(false);
    });

    it('should toggle listing from inactive to active', async () => {
      const inactiveListing = { ...mockFirebaseListing, isActive: false };
      const mockDocSnap = {
        exists: () => true,
        id: mockListingId,
        data: () => inactiveListing,
      };

      (doc as jest.Mock).mockReturnValue('listing-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await toggleListingAvailability(mockListingId);

      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.isActive).toBe(true);
    });

    it('should throw error if listing not found', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue('listing-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      await expect(toggleListingAvailability(mockListingId)).rejects.toThrow('Listing not found');
    });
  });

  describe('deleteListing', () => {
    it('should delete a listing', async () => {
      (doc as jest.Mock).mockReturnValue('listing-ref');
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteListing(mockListingId);

      expect(doc).toHaveBeenCalledWith(db, 'listings', mockListingId);
      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should handle Firestore errors', async () => {
      (doc as jest.Mock).mockReturnValue('listing-ref');
      (deleteDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(deleteListing(mockListingId)).rejects.toThrow('Failed to delete listing');
    });
  });
});
