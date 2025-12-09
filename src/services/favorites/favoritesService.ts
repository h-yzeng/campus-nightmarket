import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb } from '../../config/firebase';
import { logger } from '../../utils/logger';

const FAVORITES_COLLECTION = 'favorites';

interface FavoriteListing {
  userId: string;
  listingId: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

/**
 * Add a listing to user's favorites
 */
export async function addToFavorites(userId: string, listingId: string): Promise<void> {
  try {
    const db = getFirestoreDb();
    const favoriteId = `${userId}_${listingId}`;
    const favoriteRef = doc(db, FAVORITES_COLLECTION, favoriteId);

    const favoriteData: FavoriteListing = {
      userId,
      listingId,
      createdAt: serverTimestamp(),
    };

    await setDoc(favoriteRef, favoriteData);
    logger.info(`Added listing ${listingId} to favorites`);
  } catch (error) {
    logger.error('Error adding to favorites:', error);
    throw new Error('Failed to add to favorites');
  }
}

/**
 * Remove a listing from user's favorites
 */
export async function removeFromFavorites(userId: string, listingId: string): Promise<void> {
  try {
    const db = getFirestoreDb();
    const favoriteId = `${userId}_${listingId}`;
    const favoriteRef = doc(db, FAVORITES_COLLECTION, favoriteId);

    await deleteDoc(favoriteRef);
    logger.info(`Removed listing ${listingId} from favorites`);
  } catch (error) {
    logger.error('Error removing from favorites:', error);
    throw new Error('Failed to remove from favorites');
  }
}

/**
 * Get all favorite listing IDs for a user
 */
export async function getFavoriteIds(userId: string): Promise<string[]> {
  try {
    const db = getFirestoreDb();
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(favoritesRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const favoriteIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FavoriteListing;
      favoriteIds.push(data.listingId);
    });

    return favoriteIds;
  } catch (error) {
    logger.error('Error getting favorites:', error);
    return [];
  }
}

/**
 * Check if a listing is favorited by the user
 */
export async function isFavorited(userId: string, listingId: string): Promise<boolean> {
  try {
    const favoriteIds = await getFavoriteIds(userId);
    return favoriteIds.includes(listingId);
  } catch (error) {
    logger.error('Error checking if favorited:', error);
    return false;
  }
}

/**
 * Toggle favorite status for a listing
 */
export async function toggleFavorite(
  userId: string,
  listingId: string,
  currentlyFavorited: boolean
): Promise<boolean> {
  try {
    if (currentlyFavorited) {
      await removeFromFavorites(userId, listingId);
      return false;
    } else {
      await addToFavorites(userId, listingId);
      return true;
    }
  } catch (error) {
    logger.error('Error toggling favorite:', error);
    throw error;
  }
}
