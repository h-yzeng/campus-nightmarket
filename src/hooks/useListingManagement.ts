import { useState, useEffect, useRef } from 'react';
import type { ListingWithFirebaseId } from '../types';
import type { PageType } from './useNavigation';
import { getListingsBySeller, toggleListingAvailability, deleteListing } from '../services/listings/listingService';
import type { FirebaseListing } from '../types/firebase';
import type { Timestamp } from 'firebase/firestore';

const convertFirebaseListingToListing = (listing: FirebaseListing): ListingWithFirebaseId => {
  const datePosted = listing.createdAt
    ? new Date((listing.createdAt as Timestamp).seconds * 1000).toLocaleDateString()
    : new Date().toLocaleDateString();

  return {
    id: parseInt(listing.id.substring(0, 8), 16),
    firebaseId: listing.id,
    name: listing.name,
    description: listing.description,
    price: listing.price,
    image: listing.imageURL,
    location: listing.location,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    isAvailable: listing.isAvailable,
    category: listing.category,
    datePosted: datePosted,
  };
};

export const useListingManagement = (userId: string | undefined, refreshListings: () => Promise<void>) => {
  const [listings, setListings] = useState<ListingWithFirebaseId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firebaseIdMapRef = useRef<Map<number, string>>(new Map());

  const loadSellerListings = async () => {
    if (!userId) {
      console.log('[useListingManagement] No userId, skipping fetch');
      setListings([]);
      setLoading(false);
      return;
    }

    try {
      console.log('[useListingManagement] Loading listings for userId:', userId);
      setLoading(true);
      setError(null);
      const firebaseListings = await getListingsBySeller(userId);
      console.log('[useListingManagement] Fetched listings from Firebase:', firebaseListings.length);

      firebaseIdMapRef.current.clear();

      const convertedListings = firebaseListings.map(fbListing => {
        const converted = convertFirebaseListingToListing(fbListing);
        firebaseIdMapRef.current.set(converted.id, fbListing.id);
        return converted;
      });

      console.log('[useListingManagement] Converted listings:', convertedListings);
      setListings(convertedListings);
    } catch (err) {
      console.error('Error loading seller listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerListings();
  }, [userId]);

  const handleCreateListing = async (setCurrentPage: (page: PageType) => void) => {
    console.log('[useListingManagement] handleCreateListing called');
    await refreshListings();
    console.log('[useListingManagement] refreshListings complete');
    await loadSellerListings();
    console.log('[useListingManagement] loadSellerListings complete');
    setCurrentPage('sellerDashboard');
  };

  const handleToggleAvailability = async (listingId: number) => {
    try {
      const firebaseId = firebaseIdMapRef.current.get(listingId);
      if (!firebaseId) {
        console.error('Firebase ID not found for listing:', listingId);
        return;
      }

      await toggleListingAvailability(firebaseId);
      await loadSellerListings();
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleDeleteListing = async (listingId: number | string) => {
    try {
      console.log('[useListingManagement] Deleting listing:', listingId, 'type:', typeof listingId);

      let firebaseId: string;
      if (typeof listingId === 'string') {
        firebaseId = listingId;
        console.log('[useListingManagement] Using Firebase ID directly:', firebaseId);
      } else {
        console.log('[useListingManagement] Firebase ID map:', firebaseIdMapRef.current);
        const mappedId = firebaseIdMapRef.current.get(listingId);
        if (!mappedId) {
          console.error('[useListingManagement] Firebase ID not found for listing:', listingId);
          console.error('[useListingManagement] Available IDs in map:', Array.from(firebaseIdMapRef.current.keys()));
          return;
        }
        firebaseId = mappedId;
      }

      console.log('[useListingManagement] Deleting with Firebase ID:', firebaseId);
      await deleteListing(firebaseId);
      console.log('[useListingManagement] Delete successful, refreshing listings...');
      await loadSellerListings();
      console.log('[useListingManagement] Listings refreshed after delete');
    } catch (err) {
      console.error('[useListingManagement] Error deleting listing:', err);
      throw err;
    }
  };

  const handleEditListing = (listingId: number | string, handleEdit: (id: string) => void) => {
    let firebaseId: string;
    if (typeof listingId === 'string') {
      firebaseId = listingId;
    } else {
      const mappedId = firebaseIdMapRef.current.get(listingId);
      if (!mappedId) {
        console.error('Firebase ID not found for listing:', listingId);
        return;
      }
      firebaseId = mappedId;
    }

    console.log('[useListingManagement] Editing listing with Firebase ID:', firebaseId);
    handleEdit(firebaseId);
  };

  return {
    listings,
    loading,
    error,
    handleCreateListing,
    handleToggleAvailability,
    handleDeleteListing,
    handleEditListing,
    refreshSellerListings: loadSellerListings,
  };
};
