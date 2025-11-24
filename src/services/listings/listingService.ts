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
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  type FirebaseListing,
  type CreateListing,
  type UpdateListing,
  COLLECTIONS,
} from '../../types/firebase';

export const createListing = async (listingData: CreateListing): Promise<string> => {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);

    const listing = {
      ...listingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(listingsRef, listing);
    return docRef.id;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw new Error('Failed to create listing');
  }
};

export const getListing = async (listingId: string): Promise<FirebaseListing | null> => {
  try {
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
    console.error('Error getting listing:', error);
    throw new Error('Failed to get listing');
  }
};

export const getAllListings = async (onlyAvailable = false): Promise<FirebaseListing[]> => {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    let q;

    if (onlyAvailable) {
      q = query(listingsRef, where('isAvailable', '==', true));
    } else {
      q = query(listingsRef);
    }

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    return listings.sort((a, b) => {
      const aTime = (a.createdAt as Timestamp)?.seconds || 0;
      const bTime = (b.createdAt as Timestamp)?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting all listings:', error);
    throw new Error('Failed to get listings');
  }
};

export const getListingsBySeller = async (sellerId: string): Promise<FirebaseListing[]> => {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    const q = query(
      listingsRef,
      where('sellerId', '==', sellerId)
    );

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    return listings.sort((a, b) => {
      const aTime = (a.createdAt as Timestamp)?.seconds || 0;
      const bTime = (b.createdAt as Timestamp)?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting seller listings:', error);
    throw new Error('Failed to get seller listings');
  }
};

export const getListingsByLocation = async (location: string): Promise<FirebaseListing[]> => {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    const q = query(
      listingsRef,
      where('location', '==', location),
      where('isAvailable', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    return listings.sort((a, b) => {
      const aTime = (a.createdAt as Timestamp)?.seconds || 0;
      const bTime = (b.createdAt as Timestamp)?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting listings by location:', error);
    throw new Error('Failed to get listings by location');
  }
};

export const getListingsByCategory = async (category: string): Promise<FirebaseListing[]> => {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    const q = query(
      listingsRef,
      where('category', '==', category),
      where('isAvailable', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const listings: FirebaseListing[] = [];

    querySnapshot.forEach((doc) => {
      listings.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseListing);
    });

    return listings.sort((a, b) => {
      const aTime = (a.createdAt as Timestamp)?.seconds || 0;
      const bTime = (b.createdAt as Timestamp)?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting listings by category:', error);
    throw new Error('Failed to get listings by category');
  }
};

export const updateListing = async (
  listingId: string,
  updates: UpdateListing
): Promise<void> => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);

    await updateDoc(listingRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    throw new Error('Failed to update listing');
  }
};

export const toggleListingAvailability = async (listingId: string): Promise<void> => {
  try {
    const listing = await getListing(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    await updateListing(listingId, {
      isAvailable: !listing.isAvailable,
    });
  } catch (error) {
    console.error('Error toggling listing availability:', error);
    throw new Error('Failed to toggle listing availability');
  }
};

export const deleteListing = async (listingId: string): Promise<void> => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await deleteDoc(listingRef);
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw new Error('Failed to delete listing');
  }
};
