/**
 * Order Service Tests
 *
 * Tests for order management functionality including:
 * - Order creation with validation
 * - Order retrieval
 * - Order updates
 * - Status management
 * - Purchase count tracking
 */

import {
  createOrder,
  getOrder,
  getBuyerOrders,
  getSellerOrders,
  getBuyerOrdersByStatus,
  getSellerOrdersByStatus,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  completeOrder,
} from '../../src/services/orders/orderService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import type { CreateOrder, FirebaseOrder } from '../../src/types/firebase';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('../../src/config/firebase', () => ({
  db: {},
}));

describe('Order Service', () => {
  const mockOrderId = 'order-123';
  const mockBuyerId = 'buyer-456';
  const mockSellerId = 'seller-789';

  const mockCreateOrder: CreateOrder = {
    buyerId: mockBuyerId,
    buyerName: 'John Doe',
    buyerEmail: 'john@hawk.illinoistech.edu',
    sellerId: mockSellerId,
    sellerName: 'Jane Smith',
    sellerLocation: 'Stuart Building',
    items: [
      {
        listingId: 'listing-1',
        name: 'Pizza Slice',
        price: 5.99,
        quantity: 2,
        imageURL: 'https://example.com/pizza.jpg',
        seller: 'Jane Smith',
        location: 'Stuart Building',
      },
    ],
    total: 11.98,
    paymentMethod: 'Cash',
    status: 'pending',
    pickupTime: '6:00 PM',
    notes: 'Extra cheese please',
  };

  const mockFirebaseOrder: FirebaseOrder = {
    id: mockOrderId,
    ...mockCreateOrder,
    createdAt: { seconds: 1234567890, nanoseconds: 0 } as FirebaseOrder['createdAt'],
    updatedAt: { seconds: 1234567890, nanoseconds: 0 } as FirebaseOrder['updatedAt'],
  };

  // Prevent unused variable warning - mockFirebaseOrder is used as a reference type
  void mockFirebaseOrder;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should successfully create an order with valid data', async () => {
      const mockDocRef = { id: mockOrderId };
      (collection as jest.Mock).mockReturnValue('orders-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const orderId = await createOrder(mockCreateOrder);

      expect(addDoc).toHaveBeenCalled();
      expect(orderId).toBe(mockOrderId);
    });

    it('should validate payment method', async () => {
      const invalidOrder = {
        ...mockCreateOrder,
        paymentMethod: 'invalid-method' as CreateOrder['paymentMethod'],
      };

      await expect(createOrder(invalidOrder)).rejects.toThrow();
    });

    it('should validate order total price', async () => {
      const invalidOrder = {
        ...mockCreateOrder,
        total: -10,
      };

      await expect(createOrder(invalidOrder)).rejects.toThrow();
    });

    it('should validate item prices', async () => {
      const invalidOrder = {
        ...mockCreateOrder,
        items: [
          {
            ...mockCreateOrder.items[0],
            price: -5,
          },
        ],
      };

      await expect(createOrder(invalidOrder)).rejects.toThrow();
    });

    it('should validate item quantities', async () => {
      const invalidOrder = {
        ...mockCreateOrder,
        items: [
          {
            ...mockCreateOrder.items[0],
            quantity: 0,
          },
        ],
      };

      await expect(createOrder(invalidOrder)).rejects.toThrow();
    });

    it('should sanitize text fields', async () => {
      const mockDocRef = { id: mockOrderId };
      (collection as jest.Mock).mockReturnValue('orders-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const orderWithMaliciousInput = {
        ...mockCreateOrder,
        notes: '<script>alert("xss")</script>',
      };

      await createOrder(orderWithMaliciousInput);

      expect(addDoc).toHaveBeenCalled();
      const callArgs = (addDoc as jest.Mock).mock.calls[0][1];
      expect(callArgs.notes).not.toContain('<script>');
    });

    it('should handle Firestore errors gracefully', async () => {
      (collection as jest.Mock).mockReturnValue('orders-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(createOrder(mockCreateOrder)).rejects.toThrow('Firestore error');
    });

    it('should handle orders without notes', async () => {
      const mockDocRef = { id: mockOrderId };
      (collection as jest.Mock).mockReturnValue('orders-collection');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const orderWithoutNotes = {
        ...mockCreateOrder,
        notes: undefined,
      };

      const orderId = await createOrder(orderWithoutNotes);

      expect(orderId).toBe(mockOrderId);
    });
  });

  describe('getOrder', () => {
    it('should retrieve an order by ID', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: mockOrderId,
        data: () => mockCreateOrder,
      };

      (doc as jest.Mock).mockReturnValue('order-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const order = await getOrder(mockOrderId);

      expect(doc).toHaveBeenCalledWith(db, 'orders', mockOrderId);
      expect(order).toEqual({
        id: mockOrderId,
        ...mockCreateOrder,
      });
    });

    it('should return null if order does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue('order-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const order = await getOrder('nonexistent-id');

      expect(order).toBeNull();
    });

    it('should handle Firestore errors', async () => {
      (doc as jest.Mock).mockReturnValue('order-ref');
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getOrder(mockOrderId)).rejects.toThrow('Failed to get order');
    });
  });

  describe('getBuyerOrders', () => {
    it('should retrieve all orders for a buyer', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateOrder }) => void) => {
          callback({
            id: mockOrderId,
            data: () => mockCreateOrder,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('orders-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const orders = await getBuyerOrders(mockBuyerId);

      expect(where).toHaveBeenCalledWith('buyerId', '==', mockBuyerId);
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(orders).toHaveLength(1);
      expect(orders[0].id).toBe(mockOrderId);
    });

    it('should handle empty results', async () => {
      const mockQuerySnapshot = {
        forEach: () => {},
      };

      (collection as jest.Mock).mockReturnValue('orders-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const orders = await getBuyerOrders(mockBuyerId);

      expect(orders).toEqual([]);
    });

    it('should handle Firestore errors', async () => {
      (collection as jest.Mock).mockReturnValue('orders-collection');
      (query as jest.Mock).mockReturnValue('query');
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getBuyerOrders(mockBuyerId)).rejects.toThrow('Failed to get buyer orders');
    });
  });

  describe('getSellerOrders', () => {
    it('should retrieve all orders for a seller', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateOrder }) => void) => {
          callback({
            id: mockOrderId,
            data: () => mockCreateOrder,
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('orders-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const orders = await getSellerOrders(mockSellerId);

      expect(where).toHaveBeenCalledWith('sellerId', '==', mockSellerId);
      expect(orders).toHaveLength(1);
    });
  });

  describe('Order Status Filtering', () => {
    it('should get buyer orders by status', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateOrder }) => void) => {
          callback({
            id: mockOrderId,
            data: () => ({ ...mockCreateOrder, status: 'pending' }),
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('orders-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const orders = await getBuyerOrdersByStatus(mockBuyerId, 'pending');

      expect(where).toHaveBeenCalledWith('buyerId', '==', mockBuyerId);
      expect(where).toHaveBeenCalledWith('status', '==', 'pending');
      expect(orders).toHaveLength(1);
    });

    it('should get seller orders by status', async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: { id: string; data: () => CreateOrder }) => void) => {
          callback({
            id: mockOrderId,
            data: () => ({ ...mockCreateOrder, status: 'confirmed' }),
          });
        },
      };

      (collection as jest.Mock).mockReturnValue('orders-collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where-clause');
      (orderBy as jest.Mock).mockReturnValue('order-clause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const orders = await getSellerOrdersByStatus(mockSellerId, 'confirmed');

      expect(where).toHaveBeenCalledWith('sellerId', '==', mockSellerId);
      expect(where).toHaveBeenCalledWith('status', '==', 'confirmed');
      expect(orders).toHaveLength(1);
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      (doc as jest.Mock).mockReturnValue('order-ref');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateOrder(mockOrderId, { status: 'confirmed' });

      expect(doc).toHaveBeenCalledWith(db, 'orders', mockOrderId);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should handle Firestore errors', async () => {
      (doc as jest.Mock).mockReturnValue('order-ref');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(updateOrder(mockOrderId, { status: 'confirmed' })).rejects.toThrow(
        'Failed to update order'
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      (doc as jest.Mock).mockReturnValue('order-ref');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateOrderStatus(mockOrderId, 'ready');

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      (doc as jest.Mock).mockReturnValue('order-ref');
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await cancelOrder(mockOrderId);

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('completeOrder', () => {
    it('should complete an order and update listing purchase counts', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: mockOrderId,
        data: () => mockCreateOrder,
      };

      (doc as jest.Mock).mockReturnValue('order-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (increment as jest.Mock).mockImplementation((val) => ({ increment: val }));

      await completeOrder(mockOrderId);

      expect(updateDoc).toHaveBeenCalledTimes(2); // Once for status, once for listing
      expect(increment).toHaveBeenCalledWith(2); // Quantity from mockCreateOrder
    });

    it('should throw error if order not found', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue('order-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      await expect(completeOrder(mockOrderId)).rejects.toThrow('Order not found');
    });

    it('should handle multiple items in order', async () => {
      const orderWithMultipleItems = {
        ...mockCreateOrder,
        items: [
          mockCreateOrder.items[0],
          {
            listingId: 'listing-2',
            name: 'Burger',
            price: 8.99,
            quantity: 1,
            imageURL: 'https://example.com/burger.jpg',
            seller: 'Jane Smith',
            location: 'Stuart Building',
          },
        ],
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockOrderId,
        data: () => orderWithMultipleItems,
      };

      (doc as jest.Mock).mockReturnValue('order-ref');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      (serverTimestamp as jest.Mock).mockReturnValue({ timestamp: 'now' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (increment as jest.Mock).mockImplementation((val) => ({ increment: val }));

      await completeOrder(mockOrderId);

      expect(updateDoc).toHaveBeenCalledTimes(3); // Once for status, twice for listings
    });
  });
});
