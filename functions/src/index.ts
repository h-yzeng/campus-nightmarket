import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import {onCall} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

// App URL for notifications - configure via Firebase Functions config:
// firebase functions:config:set app.url="https://your-domain.com"
const APP_URL = process.env.APP_URL || 'https://campus-night-market.web.app';

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

  // Get buyer's FCM token
  try {
    const buyerDoc = await admin.firestore().doc(`users/${after.buyerId}`).get();
    const buyerData = buyerDoc.data();

    if (!buyerData?.fcmToken) {
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
          link: `${APP_URL}/orders/${orderId}`,
        },
      },
    });

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

  try {
    // Get seller's FCM token
    const sellerDoc = await admin.firestore().doc(`users/${order.sellerId}`).get();
    const sellerData = sellerDoc.data();

    if (!sellerData?.fcmToken) {
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
          link: `${APP_URL}/seller/orders`,
        },
      },
    });

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

  try {
    // Get seller's FCM token
    const sellerDoc = await admin.firestore().doc(`users/${after.sellerId}`).get();
    const sellerData = sellerDoc.data();

    if (!sellerData?.fcmToken) {
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
          link: `${APP_URL}/seller/orders`,
        },
      },
    });

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
export const cleanupExpiredTokens = onSchedule('every 24 hours', async () => {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

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
    }
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
});

/**
 * Reset user password after security questions are verified
 * This is called from the client after security answers are confirmed
 */
export const resetPasswordWithVerification = onCall(async (request) => {
  const {email, newPassword, userId} = request.data;

  // Validate input
  if (!email || !newPassword || !userId) {
    throw new Error('Missing required fields: email, newPassword, and userId');
  }

  // Validate email domain
  if (!email.endsWith('@hawk.illinoistech.edu')) {
    throw new Error('Email must be a valid @hawk.illinoistech.edu address');
  }

  // Validate password strength
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    // Get user by email to verify it exists
    const userRecord = await admin.auth().getUserByEmail(email);

    // Verify the userId matches
    if (userRecord.uid !== userId) {
      throw new Error('User ID mismatch');
    }

    // Update the password using Firebase Admin SDK
    await admin.auth().updateUser(userId, {
      password: newPassword,
    });

    return {
      success: true,
      message: 'Password has been successfully reset',
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
    throw new Error('Failed to reset password');
  }
});
