import { useState, useEffect, useCallback } from 'react';
import {
  getBuyerOrders,
  getSellerOrders,
  createOrder as createOrderService,
  updateOrderStatus,
  cancelOrder as cancelOrderService,
} from '../services/orders/orderService';
import type { FirebaseOrder, CreateOrder } from '../types/firebase';
import type { Order, CartItem, OrderStatus } from '../types';
import { logger } from '../utils/logger';

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

const convertFirebaseOrderToApp = (firebaseOrder: FirebaseOrder): Order => {
  const items: CartItem[] = firebaseOrder.items.map(item => ({
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
    orderDate: firebaseOrder.createdAt?.toDate?.().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) || new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    notes: firebaseOrder.notes,
    buyerName: firebaseOrder.buyerName,
  };
};

export const useOrders = (userId: string | undefined, mode: 'buyer' | 'seller' = 'buyer') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!userId) {
      logger.general('[useOrders] No userId, clearing orders. Mode:', mode);
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      logger.general(`[useOrders] ===== Loading ${mode} orders for userId: ${userId} =====`);

      const firebaseOrders = mode === 'buyer'
        ? await getBuyerOrders(userId)
        : await getSellerOrders(userId);

      logger.general(`[useOrders] Fetched ${firebaseOrders.length} Firebase ${mode} orders:`, firebaseOrders);

      const convertedOrders = firebaseOrders.map(convertFirebaseOrderToApp);
      logger.general(`[useOrders] Converted to ${convertedOrders.length} app orders for ${mode}:`, convertedOrders);
      setOrders(convertedOrders);
    } catch (err) {
      logger.error(`[useOrders] Error loading ${mode} orders:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [userId, mode]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const createOrder = async (orderData: CreateOrder): Promise<string> => {
    try {
      logger.general('[useOrders] Creating order:', orderData);
      const orderId = await createOrderService(orderData);
      logger.general('[useOrders] Order created with ID:', orderId);
      logger.general('[useOrders] Refreshing orders list...');
      await loadOrders();
      return orderId;
    } catch (err) {
      logger.error('[useOrders] Error creating order:', err);
      throw err;
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err) {
      logger.error('Error updating order status:', err);
      throw err;
    }
  };

  const cancelOrder = async (orderId: string): Promise<void> => {
    try {
      await cancelOrderService(orderId);
      await loadOrders();
    } catch (err) {
      logger.error('Error cancelling order:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refreshOrders: loadOrders,
    createOrder,
    updateStatus,
    cancelOrder,
  };
};
