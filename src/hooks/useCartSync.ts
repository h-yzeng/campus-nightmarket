import { useEffect, useRef, useCallback } from 'react';
import { useCartStore } from '../stores';
import {
  saveCartToCloud,
  loadCartFromCloud,
  clearCartFromCloud,
  mergeCartItems,
} from '../services/cart/cartSyncService';
import { logger } from '../utils/logger';

const SYNC_DEBOUNCE_MS = 2000;

/**
 * Hook for syncing cart state with Firestore
 * - Loads cart from cloud on login
 * - Saves cart changes to cloud (debounced)
 * - Clears cloud cart on logout
 */
export const useCartSync = (userId: string | undefined) => {
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);
  const lastSyncedRef = useRef<string>('');
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);

  // Load cart from cloud when user logs in
  useEffect(() => {
    if (!userId || hasLoadedRef.current) return;

    const loadCloud = async () => {
      try {
        const cloudCart = await loadCartFromCloud(userId);

        if (cloudCart && cloudCart.length > 0) {
          const localCart = useCartStore.getState().cart;

          if (localCart.length > 0) {
            // Merge local and cloud carts
            const merged = mergeCartItems(localCart, cloudCart);
            setCart(merged);
            logger.info('Cart merged with cloud data');
          } else {
            // Use cloud cart if local is empty
            setCart(cloudCart);
            logger.info('Cart loaded from cloud');
          }
        }

        hasLoadedRef.current = true;
      } catch (error) {
        logger.error('Error loading cart from cloud:', error);
      }
    };

    void loadCloud();
  }, [userId, setCart]);

  // Debounced save to cloud when cart changes
  useEffect(() => {
    if (!userId) return;

    const cartKey = JSON.stringify(cart);

    // Skip if cart hasn't changed
    if (cartKey === lastSyncedRef.current) return;

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce sync to avoid too many writes
    syncTimeoutRef.current = setTimeout(() => {
      void saveCartToCloud(userId, cart);
      lastSyncedRef.current = cartKey;
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [userId, cart]);

  // Clear cloud cart function (for logout or order completion)
  const clearCloudCart = useCallback(async () => {
    if (userId) {
      await clearCartFromCloud(userId);
      hasLoadedRef.current = false;
      lastSyncedRef.current = '';
    }
  }, [userId]);

  // Reset load flag when user changes
  useEffect(() => {
    return () => {
      hasLoadedRef.current = false;
      lastSyncedRef.current = '';
    };
  }, [userId]);

  return { clearCloudCart };
};
