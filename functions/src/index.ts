import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Type for order items
interface OrderItem {
  quantity: number;
  name: string;
  price: number;
}

/**
 * Send notification to buyer when order status changes
 */
export const sendOrderStatusNotification = onDocumentUpdated('orders/{orderId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  const orderId = event.params.orderId;

  if (!before || !after) {
    return null;
  }

  // Only send notification if status changed
  if (before.status === after.status) {
    return null;
  }

  console.log(`Order ${orderId} status changed from ${before.status} to ${after.status}`);

  // Get buyer's FCM token
  try {
    const buyerDoc = await admin.firestore().doc(`users/${after.buyerId}`).get();
    const buyerData = buyerDoc.data();

    if (!buyerData?.fcmToken) {
      console.log(`No FCM token found for buyer ${after.buyerId}`);
      return null;
    }

    // Create notification message based on status
    let title = 'Order Update';
    let body = '';

    switch (after.status) {
      case 'confirmed':
        title = 'Order Confirmed!';
        body = `Your order from ${after.sellerName} has been confirmed`;
        break;
      case 'ready':
        title = 'Order Ready!';
        body = `Your order from ${after.sellerName} is ready for pickup`;
        break;
      case 'completed':
        title = 'Order Completed';
        body = `Thank you for your order from ${after.sellerName}!`;
        break;
      case 'cancelled':
        title = 'Order Cancelled';
        body = `Your order from ${after.sellerName} has been cancelled`;
        break;
      default:
        body = `Your order status is now ${after.status}`;
    }

    // Send notification
    await admin.messaging().send({
      token: buyerData.fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        orderId,
        type: 'order_update',
        status: after.status,
        sellerId: after.sellerId,
      },
      webpush: {
        fcmOptions: {
          link: `https://your-app-url.com/orders/${orderId}`,
        },
      },
    });

    console.log(`Notification sent to buyer ${after.buyerId} for order ${orderId}`);
    return null;
  } catch (error) {
    console.error('Error sending order status notification:', error);
    return null;
  }
});

/**
 * Send notification to seller when new order is placed
 */
export const sendNewOrderNotification = onDocumentCreated('orders/{orderId}', async (event) => {
  const order = event.data?.data();
  const orderId = event.params.orderId;

  if (!order) {
    return null;
  }

  console.log(`New order ${orderId} created for seller ${order.sellerId}`);

  try {
    // Get seller's FCM token
    const sellerDoc = await admin.firestore().doc(`users/${order.sellerId}`).get();
    const sellerData = sellerDoc.data();

    if (!sellerData?.fcmToken) {
      console.log(`No FCM token found for seller ${order.sellerId}`);
      return null;
    }

    // Calculate total items
    const totalItems = order.items?.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0) || 0;

    // Send notification
    await admin.messaging().send({
      token: sellerData.fcmToken,
      notification: {
        title: 'New Order!',
        body: `${order.buyerName} ordered ${totalItems} item(s) for $${order.total.toFixed(2)}`,
      },
      data: {
        orderId,
        type: 'new_order',
        buyerId: order.buyerId,
        total: order.total.toString(),
      },
      webpush: {
        fcmOptions: {
          link: `https://your-app-url.com/seller/orders`,
        },
      },
    });

    console.log(`New order notification sent to seller ${order.sellerId}`);
    return null;
  } catch (error) {
    console.error('Error sending new order notification:', error);
    return null;
  }
});

/**
 * Send notification to seller when buyer cancels order
 */
export const sendOrderCancelledNotification = onDocumentUpdated('orders/{orderId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  const orderId = event.params.orderId;

  if (!before || !after) {
    return null;
  }

  // Only send if order was cancelled by buyer
  if (before.status === 'cancelled' || after.status !== 'cancelled') {
    return null;
  }

  console.log(`Order ${orderId} was cancelled`);

  try {
    // Get seller's FCM token
    const sellerDoc = await admin.firestore().doc(`users/${after.sellerId}`).get();
    const sellerData = sellerDoc.data();

    if (!sellerData?.fcmToken) {
      console.log(`No FCM token found for seller ${after.sellerId}`);
      return null;
    }

    // Send notification
    await admin.messaging().send({
      token: sellerData.fcmToken,
      notification: {
        title: 'Order Cancelled',
        body: `${after.buyerName} cancelled their order`,
      },
      data: {
        orderId,
        type: 'order_cancelled',
        buyerId: after.buyerId,
      },
      webpush: {
        fcmOptions: {
          link: `https://your-app-url.com/seller/orders`,
        },
      },
    });

    console.log(`Cancellation notification sent to seller ${after.sellerId}`);
    return null;
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    return null;
  }
});

/**
 * Clean up expired FCM tokens
 * Runs daily to remove tokens older than 60 days
 */
export const cleanupExpiredTokens = onSchedule('every 24 hours', async (_event) => {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  console.log('Starting FCM token cleanup...');

  try {
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('fcmTokenUpdatedAt', '<', sixtyDaysAgo)
      .get();

    const batch = admin.firestore().batch();
    let count = 0;

    usersSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        fcmToken: admin.firestore.FieldValue.delete(),
        fcmTokenUpdatedAt: admin.firestore.FieldValue.delete(),
      });
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Cleaned up ${count} expired FCM tokens`);
    } else {
      console.log('No expired tokens to clean up');
    }
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
});
