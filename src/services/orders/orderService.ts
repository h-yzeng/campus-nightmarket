import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  type FirebaseOrder,
  type CreateOrder,
  type UpdateOrder,
  COLLECTIONS,
} from '../../types/firebase';
import type { OrderStatus } from '../../types';

export const createOrder = async (orderData: CreateOrder): Promise<string> => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);

    const order = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(ordersRef, order);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
};

export const getOrder = async (orderId: string): Promise<FirebaseOrder | null> => {
  try {
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
    console.error('Error getting order:', error);
    throw new Error('Failed to get order');
  }
};

export const getBuyerOrders = async (buyerId: string): Promise<FirebaseOrder[]> => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    // Temporarily removed orderBy to avoid index requirement
    // TODO: Re-enable after creating Firestore index for (buyerId, createdAt)
    const q = query(
      ordersRef,
      where('buyerId', '==', buyerId)
      // orderBy('createdAt', 'desc') // Commented out until index is created
    );

    const querySnapshot = await getDocs(q);
    const orders: FirebaseOrder[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseOrder);
    });

    // Sort in memory instead
    orders.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return orders;
  } catch (error) {
    console.error('Error getting buyer orders:', error);
    throw new Error('Failed to get buyer orders');
  }
};

export const getSellerOrders = async (sellerId: string): Promise<FirebaseOrder[]> => {
  try {
    console.log('[getSellerOrders] ===== Querying orders for sellerId:', sellerId, '=====');
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    // Temporarily removed orderBy to avoid index requirement
    // TODO: Re-enable after creating Firestore index for (sellerId, createdAt)
    const q = query(
      ordersRef,
      where('sellerId', '==', sellerId)
      // orderBy('createdAt', 'desc') // Commented out until index is created
    );

    const querySnapshot = await getDocs(q);
    console.log('[getSellerOrders] Query returned', querySnapshot.size, 'documents');
    const orders: FirebaseOrder[] = [];

    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      console.log('[getSellerOrders] Order doc:', doc.id, 'sellerId:', orderData.sellerId, 'status:', orderData.status, 'buyerName:', orderData.buyerName);
      orders.push({
        id: doc.id,
        ...orderData,
      } as FirebaseOrder);
    });

    // Sort in memory instead
    orders.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    console.log('[getSellerOrders] Returning', orders.length, 'sorted orders');
    return orders;
  } catch (error) {
    console.error('[getSellerOrders] Error getting seller orders:', error);
    throw new Error('Failed to get seller orders');
  }
};

export const getBuyerOrdersByStatus = async (
  buyerId: string,
  status: OrderStatus
): Promise<FirebaseOrder[]> => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    // Temporarily removed orderBy to avoid index requirement
    // TODO: Re-enable after creating Firestore index for (buyerId, status, createdAt)
    const q = query(
      ordersRef,
      where('buyerId', '==', buyerId),
      where('status', '==', status)
      // orderBy('createdAt', 'desc') // Commented out until index is created
    );

    const querySnapshot = await getDocs(q);
    const orders: FirebaseOrder[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseOrder);
    });

    // Sort in memory instead
    orders.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return orders;
  } catch (error) {
    console.error('Error getting buyer orders by status:', error);
    throw new Error('Failed to get buyer orders by status');
  }
};

export const getSellerOrdersByStatus = async (
  sellerId: string,
  status: OrderStatus
): Promise<FirebaseOrder[]> => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    // Temporarily removed orderBy to avoid index requirement
    // TODO: Re-enable after creating Firestore index for (sellerId, status, createdAt)
    const q = query(
      ordersRef,
      where('sellerId', '==', sellerId),
      where('status', '==', status)
      // orderBy('createdAt', 'desc') // Commented out until index is created
    );

    const querySnapshot = await getDocs(q);
    const orders: FirebaseOrder[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseOrder);
    });

    // Sort in memory instead
    orders.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return orders;
  } catch (error) {
    console.error('Error getting seller orders by status:', error);
    throw new Error('Failed to get seller orders by status');
  }
};

export const updateOrder = async (
  orderId: string,
  updates: UpdateOrder
): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);

    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  try {
    await updateOrder(orderId, { status });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
};

export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    await updateOrderStatus(orderId, 'cancelled');
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw new Error('Failed to cancel order');
  }
};

export const completeOrder = async (orderId: string): Promise<void> => {
  try {
    await updateOrderStatus(orderId, 'completed');
  } catch (error) {
    console.error('Error completing order:', error);
    throw new Error('Failed to complete order');
  }
};
