import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, db as legacyDb } from '../../config/firebase';
import { COLLECTIONS } from '../../types/firebase';
import type { CartItem } from '../../types';
import { logger } from '../../utils/logger';

const resolveDb = () => (typeof getFirestoreDb === 'function' ? getFirestoreDb() : legacyDb);

interface CloudCart {
  items: CartItem[];
  updatedAt: ReturnType<typeof serverTimestamp>;
}

/**
 * Save cart to Firestore for cloud sync
 * This allows users to access their cart from any device
 */
export const saveCartToCloud = async (userId: string, cart: CartItem[]): Promise<void> => {
  try {
    const db = resolveDb();
    const cartRef = doc(db, COLLECTIONS.USERS, userId, 'cart', 'current');

    await setDoc(cartRef, {
      items: cart,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Error saving cart to cloud:', error);
    // Don't throw - cart sync should be non-blocking
  }
};

/**
 * Load cart from Firestore
 * Used when user logs in to restore their cart from another device
 */
export const loadCartFromCloud = async (userId: string): Promise<CartItem[] | null> => {
  try {
    const db = resolveDb();
    const cartRef = doc(db, COLLECTIONS.USERS, userId, 'cart', 'current');
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) {
      return null;
    }

    const data = cartSnap.data() as CloudCart;
    return data.items || [];
  } catch (error) {
    logger.error('Error loading cart from cloud:', error);
    return null;
  }
};

/**
 * Clear cart from Firestore
 * Called when user completes an order or explicitly clears cart
 */
export const clearCartFromCloud = async (userId: string): Promise<void> => {
  try {
    const db = resolveDb();
    const cartRef = doc(db, COLLECTIONS.USERS, userId, 'cart', 'current');

    await setDoc(cartRef, {
      items: [],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Error clearing cart from cloud:', error);
  }
};

/**
 * Merge local cart with cloud cart
 * Prioritizes items with higher quantities and deduplicates
 */
export const mergeCartItems = (localCart: CartItem[], cloudCart: CartItem[]): CartItem[] => {
  const mergedMap = new Map<number, CartItem>();

  // Add cloud items first
  for (const item of cloudCart) {
    mergedMap.set(item.id, item);
  }

  // Merge local items - take higher quantity if item exists
  for (const item of localCart) {
    const existing = mergedMap.get(item.id);
    if (existing) {
      mergedMap.set(item.id, {
        ...item,
        quantity: Math.max(existing.quantity, item.quantity),
      });
    } else {
      mergedMap.set(item.id, item);
    }
  }

  return Array.from(mergedMap.values());
};
