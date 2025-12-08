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
import { getFirestoreDb, db as legacyDb } from '../../config/firebase';
import {
  type FirebaseOrder,
  type CreateOrder,
  type UpdateOrder,
  COLLECTIONS,
} from '../../types/firebase';
import type { OrderStatus } from '../../types';
import { logger } from '../../utils/logger';
import {
  validatePaymentMethod,
  validatePrice,
  validateQuantity,
  validateNotes,
  sanitizeString,
} from '../../utils/validation';
import { toAppError } from '../../utils/firebaseErrorMapper';
import { ErrorCategory, ErrorCode } from '../../utils/errorMessages';

const resolveDb = () => (typeof getFirestoreDb === 'function' ? getFirestoreDb() : legacyDb);

export const createOrder = async (orderData: CreateOrder): Promise<string> => {
  try {
    const db = resolveDb();
    // Validate input data
    validatePaymentMethod(orderData.paymentMethod);
    validatePrice(orderData.total);

    // Validate each item
    orderData.items.forEach((item) => {
      validatePrice(item.price);
      validateQuantity(item.quantity);

      // Sanitize text fields
      item.name = sanitizeString(item.name, 200);
      item.seller = sanitizeString(item.seller, 100);
      item.location = sanitizeString(item.location, 100);
    });

    // Sanitize buyer and seller names
    const sanitizedData = {
      ...orderData,
      buyerName: sanitizeString(orderData.buyerName, 100),
      sellerName: sanitizeString(orderData.sellerName, 100),
      sellerLocation: sanitizeString(orderData.sellerLocation, 100),
      pickupTime: sanitizeString(orderData.pickupTime, 50),
      notes: orderData.notes ? validateNotes(orderData.notes) : '',
    };

    const ordersRef = collection(db, COLLECTIONS.ORDERS);

    const order = {
      ...sanitizedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(ordersRef, order);
    return docRef.id;
  } catch (error) {
    logger.error('Error creating order:', error);
    if (error instanceof Error && !(error as { code?: string }).code) {
      throw error; // Keep validation errors intact
    }
    throw toAppError(error, ErrorCode.ORDER_CREATE_FAILED, ErrorCategory.ORDER);
  }
};

export const getOrder = async (orderId: string): Promise<FirebaseOrder | null> => {
  try {
    const db = resolveDb();
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return null;
    }

    return {
      id: orderSnap.id,
      ...orderSnap.data(),
    } as FirebaseOrder;
  } catch (error) {
    logger.error('Error getting order:', error);
    throw toAppError(error, ErrorCode.ORDER_NOT_FOUND, ErrorCategory.ORDER, 'Failed to get order');
  }
};

export const getBuyerOrders = async (buyerId: string): Promise<FirebaseOrder[]> => {
  try {
    const db = resolveDb();
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(ordersRef, where('buyerId', '==', buyerId), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const orders: FirebaseOrder[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseOrder);
    });

    return orders;
  } catch (error) {
    logger.error('Error getting buyer orders:', error);
    throw toAppError(
      error,
      ErrorCode.ORDER_NOT_FOUND,
      ErrorCategory.ORDER,
      'Failed to get buyer orders'
    );
  }
};

export const getSellerOrders = async (sellerId: string): Promise<FirebaseOrder[]> => {
  try {
    const db = resolveDb();
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(ordersRef, where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const orders: FirebaseOrder[] = [];

    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      orders.push({
        id: doc.id,
        ...orderData,
      } as FirebaseOrder);
    });

    return orders;
  } catch (error) {
    logger.error('Error getting seller orders:', error);
    throw toAppError(
      error,
      ErrorCode.ORDER_NOT_FOUND,
      ErrorCategory.ORDER,
      'Failed to get seller orders'
    );
  }
};

export const getBuyerOrdersByStatus = async (
  buyerId: string,
  status: OrderStatus
): Promise<FirebaseOrder[]> => {
  try {
    const db = resolveDb();
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(
      ordersRef,
      where('buyerId', '==', buyerId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: FirebaseOrder[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseOrder);
    });

    return orders;
  } catch (error) {
    logger.error('Error getting buyer orders by status:', error);
    throw toAppError(
      error,
      ErrorCode.ORDER_NOT_FOUND,
      ErrorCategory.ORDER,
      'Failed to get buyer orders'
    );
  }
};

export const getSellerOrdersByStatus = async (
  sellerId: string,
  status: OrderStatus
): Promise<FirebaseOrder[]> => {
  try {
    const db = resolveDb();
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(
      ordersRef,
      where('sellerId', '==', sellerId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: FirebaseOrder[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseOrder);
    });

    return orders;
  } catch (error) {
    logger.error('Error getting seller orders by status:', error);
    throw toAppError(
      error,
      ErrorCode.ORDER_NOT_FOUND,
      ErrorCategory.ORDER,
      'Failed to get seller orders'
    );
  }
};

export const updateOrder = async (orderId: string, updates: UpdateOrder): Promise<void> => {
  try {
    const db = resolveDb();
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);

    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Error updating order:', error);
    throw toAppError(
      error,
      ErrorCode.ORDER_UPDATE_FAILED,
      ErrorCategory.ORDER,
      'Failed to update order'
    );
  }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  try {
    await updateOrder(orderId, { status });
  } catch (error) {
    logger.error('Error updating order status:', error);
    throw toAppError(
      error,
      ErrorCode.ORDER_UPDATE_FAILED,
      ErrorCategory.ORDER,
      'Failed to update order'
    );
  }
};

export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    await updateOrderStatus(orderId, 'cancelled');
  } catch (error) {
    logger.error('Error cancelling order:', error);
    throw toAppError(
      error,
      ErrorCode.ORDER_CANCEL_FAILED,
      ErrorCategory.ORDER,
      'Failed to cancel order'
    );
  }
};

export const completeOrder = async (orderId: string): Promise<void> => {
  try {
    const db = resolveDb();
    // Get the order to access its items
    const order = await getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status to completed
    await updateOrderStatus(orderId, 'completed');

    // Increment purchase count for each listing in the order
    const updatePromises = order.items.map(async (item) => {
      const listingRef = doc(db, COLLECTIONS.LISTINGS, item.listingId);
      await updateDoc(listingRef, {
        purchaseCount: increment(item.quantity),
      });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    logger.error('Error completing order:', error);
    if (error instanceof Error && !(error as { code?: string }).code) {
      throw error;
    }
    throw toAppError(
      error,
      ErrorCode.ORDER_UPDATE_FAILED,
      ErrorCategory.ORDER,
      'Failed to update order'
    );
  }
};
