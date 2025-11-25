import { useQuery } from '@tanstack/react-query';
import {
  getBuyerOrders,
  getSellerOrders,
} from '../../services/orders/orderService';
import type { FirebaseOrder } from '../../types/firebase';
import type { Order, CartItem } from '../../types';

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

export const useBuyerOrdersQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', 'buyer', userId],
    queryFn: async () => {
      if (!userId) return [];
      const firebaseOrders = await getBuyerOrders(userId);
      return firebaseOrders.map(convertFirebaseOrderToApp);
    },
    enabled: !!userId,
  });
};

export const useSellerOrdersQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', 'seller', userId],
    queryFn: async () => {
      if (!userId) return [];
      const firebaseOrders = await getSellerOrders(userId);
      return firebaseOrders.map(convertFirebaseOrderToApp);
    },
    enabled: !!userId,
  });
};
