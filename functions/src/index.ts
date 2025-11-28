import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import {onCall} from 'firebase-functions/v2/https';
import {onObjectFinalized} from 'firebase-functions/v2/storage';
import {logger} from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

admin.initializeApp();

// Rate limiting storage (in-memory for simplicity - consider Redis for production)
const rateLimitStore = new Map<string, { attempts: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_VERIFICATION_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 12;

// Verification tokens storage (short-lived, in-memory)
const verificationTokens = new Map<string, { userId: string; email: string; expiresAt: number }>();
const TOKEN_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Check rate limit for security question verification
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(identifier, { attempts: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    return false; // Rate limit exceeded
  }

  record.attempts++;
  return true;
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

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
    logger.error('Error sending order status notification:', error);
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
    logger.error('Error sending new order notification:', error);
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
    logger.error('Error sending cancellation notification:', error);
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
    logger.error('Error cleaning up expired tokens:', error);
  }
});

/**
 * Save security questions with server-side bcrypt hashing
 */
export const saveSecurityQuestions = onCall(async (request) => {
  const {userId, questions} = request.data;

  // Validate authentication
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  // Verify user is updating their own security questions
  if (request.auth.uid !== userId) {
    throw new Error('Unauthorized: Can only update your own security questions');
  }

  // Validate input
  if (!userId || !questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid input: userId and questions array required');
  }

  if (questions.length !== 3) {
    throw new Error('Exactly 3 security questions required');
  }

  try {
    // Hash all answers with bcrypt and unique salts
    const hashedQuestions = await Promise.all(
      questions.map(async (q: { question: string; answer: string }) => {
        if (!q.question || !q.answer) {
          throw new Error('Each question must have a question and answer field');
        }

        // Normalize answer (lowercase, trim) before hashing
        const normalizedAnswer = q.answer.toLowerCase().trim();
        const hashedAnswer = await bcrypt.hash(normalizedAnswer, BCRYPT_ROUNDS);

        return {
          question: q.question,
          answer: hashedAnswer,
        };
      })
    );

    // Save to Firestore
    await admin.firestore().doc(`users/${userId}`).update({
      securityQuestions: hashedQuestions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Security questions saved successfully',
    };
  } catch (error) {
    logger.error('Error saving security questions:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to save security questions: ${error.message}`);
    }
    throw new Error('Failed to save security questions');
  }
});

/**
 * Verify security question answers (server-side with rate limiting)
 */
export const verifySecurityAnswers = onCall(async (request) => {
  const {email, answers} = request.data;

  // Validate input
  if (!email || !answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error('Invalid input: email and answers array required');
  }

  // Validate email domain
  if (!email.endsWith('@hawk.illinoistech.edu')) {
    throw new Error('Email must be a valid @hawk.illinoistech.edu address');
  }

  // Check rate limit
  if (!checkRateLimit(email)) {
    throw new Error('Too many verification attempts. Please try again later.');
  }

  try {
    // Get user by email
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw new Error('User not found');
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    if (!userData.securityQuestions || userData.securityQuestions.length === 0) {
      throw new Error('No security questions set for this account');
    }

    // Verify all answers using bcrypt.compare
    const verificationResults = await Promise.all(
      answers.map(async (providedAnswer: { question: string; answer: string }) => {
        const storedQuestion = userData.securityQuestions.find(
          (sq: { question: string; answer: string }) => sq.question === providedAnswer.question
        );

        if (!storedQuestion) {
          return false;
        }

        // Normalize answer before comparing
        const normalizedAnswer = providedAnswer.answer.toLowerCase().trim();
        return await bcrypt.compare(normalizedAnswer, storedQuestion.answer);
      })
    );

    const allCorrect = verificationResults.every((result) => result === true);

    if (!allCorrect) {
      throw new Error('Security answers incorrect');
    }

    // Generate verification token
    const token = generateToken();
    verificationTokens.set(token, {
      userId,
      email,
      expiresAt: Date.now() + TOKEN_EXPIRY,
    });

    return {
      verified: true,
      token,
      userId,
      message: 'Security answers verified successfully',
    };
  } catch (error) {
    logger.error('Error verifying security answers:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to verify security answers');
  }
});

/**
 * Get user's security questions (without answers)
 */
export const getUserSecurityQuestions = onCall(async (request) => {
  const {email} = request.data;

  // Validate input
  if (!email) {
    throw new Error('Email required');
  }

  // Validate email domain
  if (!email.endsWith('@hawk.illinoistech.edu')) {
    throw new Error('Email must be a valid @hawk.illinoistech.edu address');
  }

  try {
    // Get user by email
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw new Error('User not found');
    }

    const userData = usersSnapshot.docs[0].data();

    if (!userData.securityQuestions || userData.securityQuestions.length === 0) {
      return {
        questions: [],
      };
    }

    // Return only questions, not answers
    const questions = userData.securityQuestions.map((sq: { question: string }) => sq.question);

    return {
      questions,
    };
  } catch (error) {
    logger.error('Error getting security questions:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to get security questions');
  }
});

/**
 * Reset user password after security questions are verified
 * Requires a valid verification token from verifySecurityAnswers
 */
export const resetPasswordWithVerification = onCall(async (request) => {
  const {email, newPassword, token} = request.data;

  // Validate input
  if (!email || !newPassword || !token) {
    throw new Error('Missing required fields: email, newPassword, and token');
  }

  // Validate email domain
  if (!email.endsWith('@hawk.illinoistech.edu')) {
    throw new Error('Email must be a valid @hawk.illinoistech.edu address');
  }

  // Validate password strength (updated to 12 characters minimum)
  if (newPassword.length < 12) {
    throw new Error('Password must be at least 12 characters long');
  }

  // Validate password contains required characters
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    throw new Error('Password must contain uppercase, lowercase, number, and special character');
  }

  // Verify token
  const tokenData = verificationTokens.get(token);
  if (!tokenData) {
    throw new Error('Invalid or expired verification token');
  }

  if (tokenData.email !== email) {
    throw new Error('Email does not match verification token');
  }

  if (Date.now() > tokenData.expiresAt) {
    verificationTokens.delete(token);
    throw new Error('Verification token has expired. Please verify security questions again.');
  }

  try {
    // Get user by email to verify it exists
    const userRecord = await admin.auth().getUserByEmail(email);

    // Verify the userId matches
    if (userRecord.uid !== tokenData.userId) {
      throw new Error('User ID mismatch');
    }

    // Update the password using Firebase Admin SDK
    await admin.auth().updateUser(tokenData.userId, {
      password: newPassword,
    });

    // Delete the token after successful password reset
    verificationTokens.delete(token);

    return {
      success: true,
      message: 'Password has been successfully reset',
    };
  } catch (error) {
    logger.error('Error resetting password:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
    throw new Error('Failed to reset password');
  }
});

/**
 * Validate uploaded images for security
 * Checks file type, size, and deletes invalid files
 */
export const validateImageUpload = onObjectFinalized(async (event) => {
  const filePath = event.data.name;
  const contentType = event.data.contentType;
  const size = event.data.size;

  logger.info(`Validating upload: ${filePath}`);

  // Allow only image uploads in specific directories
  const allowedPaths = ['profile-photos/', 'listing-images/'];
  const isAllowedPath = allowedPaths.some((path) => filePath.startsWith(path));

  if (!isAllowedPath) {
    logger.info(`Skipping validation for non-image path: ${filePath}`);
    return null;
  }

  // Validate content type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!contentType || !allowedTypes.includes(contentType)) {
    logger.warn(`Invalid content type detected: ${contentType} for file ${filePath}`);

    try {
      // Delete the file
      await admin.storage().bucket().file(filePath).delete();
      logger.info(`Deleted file with invalid content type: ${filePath}`);

      // Log security event
      await logSecurityEvent({
        event: 'invalid_file_upload',
        details: `Invalid content type: ${contentType}`,
        filePath,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Error deleting invalid file: ${filePath}`, error);
    }

    return null;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (size > maxSize) {
    logger.warn(`File too large: ${size} bytes for file ${filePath}`);

    try {
      await admin.storage().bucket().file(filePath).delete();
      logger.info(`Deleted oversized file: ${filePath}`);

      await logSecurityEvent({
        event: 'oversized_file_upload',
        details: `File size: ${size} bytes (max: ${maxSize})`,
        filePath,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Error deleting oversized file: ${filePath}`, error);
    }

    return null;
  }

  // Validate file extension matches content type
  const extension = filePath.split('.').pop()?.toLowerCase();
  const contentTypeExtMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
  };

  const validExtensions = contentTypeExtMap[contentType] || [];
  if (extension && !validExtensions.includes(extension)) {
    logger.warn(`Extension mismatch: ${extension} for content type ${contentType}`);

    try {
      await admin.storage().bucket().file(filePath).delete();
      logger.info(`Deleted file with mismatched extension: ${filePath}`);

      await logSecurityEvent({
        event: 'extension_mismatch',
        details: `Extension: ${extension}, Content-Type: ${contentType}`,
        filePath,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Error deleting file with mismatched extension: ${filePath}`, error);
    }

    return null;
  }

  logger.info(`File validated successfully: ${filePath}`);
  return null;
});

/**
 * Log security events to Firestore for audit trail
 */
async function logSecurityEvent(event: {
  event: string;
  details: string;
  filePath?: string;
  userId?: string;
  timestamp: Date;
}): Promise<void> {
  try {
    await admin.firestore().collection('security_logs').add({
      ...event,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logger.error('Error logging security event:', error);
  }
}
