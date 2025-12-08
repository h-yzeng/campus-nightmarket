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
  serverTimestamp,
  orderBy,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb, db as legacyDb } from '../../config/firebase';
import {
  type FirebaseListing,
  type CreateListing,
  type UpdateListing,
  COLLECTIONS,
} from '../../types/firebase';
import { logger } from '../../utils/logger';
import { validatePrice, validateCategory, sanitizeString } from '../../utils/validation';
import { toAppError } from '../../utils/firebaseErrorMapper';
import { ErrorCategory, ErrorCode } from '../../utils/errorMessages';

const resolveDb = () => (typeof getFirestoreDb === 'function' ? getFirestoreDb() : legacyDb);

export const createListing = async (listingData: CreateListing): Promise<string> => {
  try {
    const db = resolveDb();
    // Validate input data
    validatePrice(listingData.price);
    validateCategory(listingData.category);

    // Sanitize text fields
    const sanitizedData: CreateListing = {
      ...listingData,
      name: sanitizeString(listingData.name, 200),
      description: sanitizeString(listingData.description, 1000),
      sellerName: sanitizeString(listingData.sellerName, 100),
      location: sanitizeString(listingData.location, 100),
    };

    const listingsRef = collection(db, COLLECTIONS.LISTINGS);

    const listing = {
      ...sanitizedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(listingsRef, listing);
    return docRef.id;
  } catch (error) {
    logger.error('Error creating listing:', error);
    if (error instanceof Error && !(error as { code?: string }).code) {
      throw error; // Keep validation errors intact
    }
    throw toAppError(error, ErrorCode.LISTING_CREATE_FAILED, ErrorCategory.LISTING);
  }
};

export const getListing = async (listingId: string): Promise<FirebaseListing | null> => {
  try {
    const db = resolveDb();
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return null;
    }

    return {
      id: listingSnap.id,
      ...listingSnap.data(),
    } as FirebaseListing;
  } catch (error) {
    logger.error('Error getting listing:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_NOT_FOUND,
      ErrorCategory.LISTING,
      'Failed to get listing'
    );
  }
};

export const getAllListings = async (onlyAvailable = false): Promise<FirebaseListing[]> => {
  try {
    const db = resolveDb();
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    let q;

    if (onlyAvailable) {
      // Composite index required: (isActive, createdAt)
      q = query(listingsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    } else {
      // Simple index on createdAt
      q = query(listingsRef, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    return listings;
  } catch (error) {
    logger.error('Error getting all listings:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_NOT_FOUND,
      ErrorCategory.LISTING,
      'Failed to get listings'
    );
  }
};

export const getPaginatedListings = async (
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot | null,
  onlyAvailable = true
): Promise<{
  listings: FirebaseListing[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    const db = resolveDb();
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);

    let q = query(
      listingsRef,
      ...(onlyAvailable ? [where('isActive', '==', true)] : []),
      orderBy('createdAt', 'desc'),
      limit(pageSize + 1) // Fetch one extra to check if there are more
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];
    const docs: QueryDocumentSnapshot[] = [];

    querySnapshot.forEach((doc) => {
      docs.push(doc as QueryDocumentSnapshot);
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    // Check if there are more results
    const hasMore = listings.length > pageSize;

    // Remove the extra document if we have more
    if (hasMore) {
      listings.pop();
      docs.pop();
    }

    const newLastDoc = docs[docs.length - 1] || null;

    return { listings, lastDoc: newLastDoc, hasMore };
  } catch (error) {
    logger.error('Error getting paginated listings:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_NOT_FOUND,
      ErrorCategory.LISTING,
      'Failed to get listings'
    );
  }
};

export const getListingsBySeller = async (sellerId: string): Promise<FirebaseListing[]> => {
  try {
    const db = resolveDb();
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    // Composite index required: (sellerId, createdAt)
    const q = query(listingsRef, where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    return listings;
  } catch (error) {
    logger.error('Error getting seller listings:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_NOT_FOUND,
      ErrorCategory.LISTING,
      'Failed to get seller listings'
    );
  }
};

export const getListingsByLocation = async (location: string): Promise<FirebaseListing[]> => {
  try {
    const db = resolveDb();
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    // Composite index required: (location, isActive, createdAt)
    const q = query(
      listingsRef,
      where('location', '==', location),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    return listings;
  } catch (error) {
    logger.error('Error getting listings by location:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_NOT_FOUND,
      ErrorCategory.LISTING,
      'Failed to get listings'
    );
  }
};

export const getListingsByCategory = async (category: string): Promise<FirebaseListing[]> => {
  try {
    const db = resolveDb();
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    // Composite index required: (category, isActive, createdAt)
    const q = query(
      listingsRef,
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    return listings;
  } catch (error) {
    logger.error('Error getting listings by category:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_NOT_FOUND,
      ErrorCategory.LISTING,
      'Failed to get listings'
    );
  }
};

export const getTopListingByPurchaseCount = async (): Promise<FirebaseListing | null> => {
  try {
    const db = resolveDb();
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    const q = query(
      listingsRef,
      where('isActive', '==', true),
      orderBy('purchaseCount', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as FirebaseListing;
  } catch (error) {
    // Gracefully handle missing composite index in dev/preview
    if (error instanceof Error && 'code' in (error as { code?: string })) {
      const code = (error as { code?: string }).code;
      if (code === 'failed-precondition') {
        logger.warn(
          'Missing Firestore index for top listing by purchaseCount. Create a composite index on (isActive == true, purchaseCount desc, createdAt desc).'
        );
        return null;
      }
    }

    logger.error('Error getting top listing by purchase count:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_NOT_FOUND,
      ErrorCategory.LISTING,
      'Failed to get listings'
    );
  }
};

export const updateListing = async (listingId: string, updates: UpdateListing): Promise<void> => {
  try {
    const db = resolveDb();
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);

    await updateDoc(listingRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Error updating listing:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_UPDATE_FAILED,
      ErrorCategory.LISTING,
      'Failed to update listing'
    );
  }
};

export const toggleListingAvailability = async (listingId: string): Promise<void> => {
  try {
    const listing = await getListing(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    await updateListing(listingId, {
      isActive: !listing.isActive,
    });
  } catch (error) {
    logger.error('Error toggling listing active status:', error);
    if (error instanceof Error && !(error as { code?: string }).code) {
      throw error;
    }
    throw toAppError(
      error,
      ErrorCode.LISTING_UPDATE_FAILED,
      ErrorCategory.LISTING,
      'Failed to update listing'
    );
  }
};

export const deleteListing = async (listingId: string): Promise<void> => {
  try {
    const db = resolveDb();
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await deleteDoc(listingRef);
  } catch (error) {
    logger.error('Error deleting listing:', error);
    throw toAppError(
      error,
      ErrorCode.LISTING_DELETE_FAILED,
      ErrorCategory.LISTING,
      'Failed to delete listing'
    );
  }
};
