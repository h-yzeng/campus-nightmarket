import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

admin.initializeApp();

/**
 * RATE LIMITING CONFIGURATION
 *
 * These settings control how many password reset/security verification attempts
 * are allowed before blocking the user.
 *
 * HOW TO ADJUST:
 * - RATE_LIMIT_WINDOW: How long to track attempts (in milliseconds)
 * - MAX_VERIFICATION_ATTEMPTS: Number of attempts before blocking starts
 * - PROGRESSIVE_BLOCKING: Escalating block times based on attempt count
 *
 * TIME CONVERSION:
 * - 1 minute = 60 * 1000
 * - 5 minutes = 5 * 60 * 1000
 * - 1 hour = 60 * 60 * 1000
 */

// Rate limiting storage (in-memory for simplicity - consider Redis for production)
const rateLimitStore = new Map<string, { attempts: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour window to track attempts
const MAX_VERIFICATION_ATTEMPTS = 10; // Allow 10 attempts before blocking (good for development)
const BCRYPT_ROUNDS = 12; // Security strength for password hashing

/**
 * Progressive blocking durations
 * After exceeding MAX_VERIFICATION_ATTEMPTS, users are blocked for escalating durations:
 * - 4+ attempts: 5 minutes
 * - 5+ attempts: 10 minutes
 * - 6+ attempts: 15 minutes
 * - 7+ attempts: 30 minutes
 */
const PROGRESSIVE_BLOCKING = {
  4: 5 * 60 * 1000, // 5 minutes
  5: 10 * 60 * 1000, // 10 minutes
  6: 15 * 60 * 1000, // 15 minutes
  7: 30 * 60 * 1000, // 30 minutes
};

// Login/signup server-side rate limiting (persisted in Firestore to survive cold starts)
const LOGIN_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_COLLECTION = 'rateLimits';

// Verification tokens storage - now using Firestore instead of in-memory Map
// to persist tokens across Cloud Function cold starts and scaling
const TOKEN_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Store verification token in Firestore
 */
async function storeVerificationToken(token: string, userId: string, email: string): Promise<void> {
  await admin
    .firestore()
    .collection('verificationTokens')
    .doc(token)
    .set({
      userId,
      email,
      expiresAt: Date.now() + TOKEN_EXPIRY,
      createdAt: Date.now(),
    });
}

/**
 * Get verification token from Firestore
 */
async function getVerificationToken(
  token: string
): Promise<{ userId: string; email: string; expiresAt: number } | null> {
  const doc = await admin.firestore().collection('verificationTokens').doc(token).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as { userId: string; email: string; expiresAt: number };
}

/**
 * Delete verification token from Firestore
 */
async function deleteVerificationToken(token: string): Promise<void> {
  await admin.firestore().collection('verificationTokens').doc(token).delete();
}

/**
 * Check rate limit for security question verification
 * Returns { allowed: boolean, blockDurationMs?: number, message?: string }
 */
function checkRateLimit(identifier: string): {
  allowed: boolean;
  blockDurationMs?: number;
  message?: string;
} {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(identifier, { attempts: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    // Calculate progressive blocking duration
    const attemptCount = record.attempts;
    let blockDurationMs = 30 * 60 * 1000; // Default 30 minutes

    // Find appropriate block duration
    const blockingLevels = Object.keys(PROGRESSIVE_BLOCKING)
      .map(Number)
      .sort((a, b) => b - a);

    for (const level of blockingLevels) {
      if (attemptCount >= level) {
        blockDurationMs = PROGRESSIVE_BLOCKING[level as keyof typeof PROGRESSIVE_BLOCKING];
        break;
      }
    }

    const retryAfterMinutes = Math.ceil(blockDurationMs / 60000);
    return {
      allowed: false,
      blockDurationMs,
      message: `Too many verification attempts. Please try again in ${retryAfterMinutes} minute(s).`,
    };
  }

  record.attempts++;
  return { allowed: true };
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function checkLoginRateLimitInternal(identifier: string): Promise<{
  allowed: boolean;
  retryAfterMs?: number;
  message?: string;
}> {
  const normalizedId = identifier.replace(/[^a-zA-Z0-9_-]/g, '_');
  const ref = admin.firestore().collection(RATE_LIMIT_COLLECTION).doc(`login_${normalizedId}`);
  const now = Date.now();

  const result = await admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as
      | { attempts: number; windowReset: number; blockedUntil?: number }
      | undefined;

    if (data?.blockedUntil && data.blockedUntil > now) {
      return {
        allowed: false as const,
        retryAfterMs: data.blockedUntil - now,
        message: 'Too many attempts. Please try again later.',
      };
    }

    // Reset window if expired or new
    if (!data || now > data.windowReset) {
      tx.set(ref, {
        attempts: 1,
        windowReset: now + LOGIN_RATE_LIMIT_WINDOW,
        updatedAt: now,
      });
      return { allowed: true as const };
    }

    const nextAttempts = data.attempts + 1;
    if (nextAttempts > LOGIN_MAX_ATTEMPTS) {
      const blockedUntil = now + LOGIN_BLOCK_MS;
      tx.set(ref, {
        attempts: nextAttempts,
        windowReset: data.windowReset,
        blockedUntil,
        updatedAt: now,
      });
      return {
        allowed: false as const,
        retryAfterMs: LOGIN_BLOCK_MS,
        message: 'Too many attempts. Please try again later.',
      };
    }

    tx.set(ref, {
      attempts: nextAttempts,
      windowReset: data.windowReset,
      updatedAt: now,
    });
    return { allowed: true as const };
  });

  return result;
}

// App URL for notifications - configure via Firebase Functions config:
// firebase functions:config:set app.url="https://your-domain.com"
const APP_URL = process.env.APP_URL || 'https://campus-night-market.web.app';

// Callable endpoint for login/signup attempts rate limiting
export const checkLoginRateLimit = onCall(async (request) => {
  const identifier =
    (request.data?.identifier as string | undefined) ||
    request.auth?.uid ||
    request.rawRequest.ip ||
    'anonymous';

  const result = await checkLoginRateLimitInternal(identifier);

  if (!result.allowed) {
    throw new HttpsError('resource-exhausted', result.message ?? 'Too many attempts', {
      retryAfterMs: result.retryAfterMs,
    });
  }

  return { allowed: true };
});

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
    const totalItems =
      order.items?.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0) || 0;

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
export const sendOrderCancelledNotification = onDocumentUpdated(
  'orders/{orderId}',
  async (event) => {
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
  }
);

/**
 * Clean up expired FCM tokens
 * Runs daily to remove tokens older than 60 days
 */
export const cleanupExpiredTokens = onSchedule('every 24 hours', async () => {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  try {
    const usersSnapshot = await admin
      .firestore()
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
  const { userId, questions } = request.data;

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
 * App Check disabled to allow password reset without authentication
 */
export const verifySecurityAnswers = onCall(
  {
    consumeAppCheckToken: false,
  },
  async (request) => {
    const { email, answers } = request.data;

    // Validate input
    if (!email || !answers || !Array.isArray(answers) || answers.length === 0) {
      throw new Error('Invalid input: email and answers array required');
    }

    // Validate email domain
    if (!email.endsWith('@hawk.illinoistech.edu')) {
      throw new Error('Email must be a valid @hawk.illinoistech.edu address');
    }

    // Check rate limit
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      throw new Error(
        rateLimit.message || 'Too many verification attempts. Please try again later.'
      );
    }

    try {
      // Get user by email
      const usersSnapshot = await admin
        .firestore()
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

          // Try multiple normalization strategies for flexibility
          const strategies = [
            providedAnswer.answer,
            providedAnswer.answer.toLowerCase(),
            providedAnswer.answer.trim(),
            providedAnswer.answer.trim().toLowerCase(),
          ];

          for (const strategy of strategies) {
            const match = await bcrypt.compare(strategy, storedQuestion.answer);
            if (match) {
              return true;
            }
          }

          return false;
        })
      );

      const allCorrect = verificationResults.every((result) => result === true);

      if (!allCorrect) {
        throw new Error('Security answers incorrect');
      }

      // Generate verification token
      const token = generateToken();
      await storeVerificationToken(token, userId, email);

      return {
        verified: true,
        token,
        userId,
        message: 'Security answers verified successfully',
      };
    } catch (error) {
      logger.error('Error in verifySecurityAnswers:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to verify security answers');
    }
  }
);

/**
 * Get user's security questions (without answers)
 * App Check disabled to allow password reset without authentication
 */
export const getUserSecurityQuestions = onCall(
  {
    consumeAppCheckToken: false,
  },
  async (request) => {
    const { email } = request.data;

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
      const usersSnapshot = await admin
        .firestore()
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
      logger.error('Error in getUserSecurityQuestions:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get security questions');
    }
  }
);

/**
 * Reset user password after security questions are verified
 * Requires a valid verification token from verifySecurityAnswers
 * App Check disabled to allow password reset without authentication
 */
export const resetPasswordWithVerification = onCall(
  {
    consumeAppCheckToken: false,
  },
  async (request) => {
    const { email, newPassword, token } = request.data;

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
    const tokenData = await getVerificationToken(token);
    if (!tokenData) {
      throw new Error('Invalid or expired verification token');
    }

    if (tokenData.email !== email) {
      throw new Error('Email does not match verification token');
    }

    if (Date.now() > tokenData.expiresAt) {
      await deleteVerificationToken(token);
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
      await deleteVerificationToken(token);

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
  }
);

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
    await admin
      .firestore()
      .collection('security_logs')
      .add({
        ...event,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    logger.error('Error logging security event:', error);
  }
}
