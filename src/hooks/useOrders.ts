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

const convertFirebaseOrderToApp = (firebaseOrder: FirebaseOrder): Order => {
  const items: CartItem[] = firebaseOrder.items.map(item => ({
    id: parseInt(item.listingId.substring(0, 8), 16),
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
    id: parseInt(firebaseOrder.id.substring(0, 8), 16),
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
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const firebaseOrders = mode === 'buyer'
        ? await getBuyerOrders(userId)
        : await getSellerOrders(userId);

      const convertedOrders = firebaseOrders.map(convertFirebaseOrderToApp);
      setOrders(convertedOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
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
      const orderId = await createOrderService(orderData);
      await loadOrders();
      return orderId;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const cancelOrder = async (orderId: string): Promise<void> => {
    try {
      await cancelOrderService(orderId);
      await loadOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
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
