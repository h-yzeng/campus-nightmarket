import type { Messaging } from 'firebase/messaging';
import { logger } from '../../utils/logger';

let messaging: Messaging | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

// Lazy load and initialize Firebase Messaging
export const initializeMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;

  // Return existing messaging instance if already initialized
  if (messaging) return messaging;

  // If initialization is in progress, wait for it
  if (messagingPromise) return messagingPromise;

  // Start initialization
  messagingPromise = (async () => {
    try {
      // Dynamically import Firebase Messaging only when needed
      const { getMessaging } = await import('firebase/messaging');
      const { app } = await import('../../config/firebase');

      messaging = getMessaging(app);
      logger.info('Firebase Messaging initialized');
      return messaging;
    } catch (error) {
      logger.error('Error initializing Firebase Messaging:', error);
      messagingPromise = null; // Reset so it can be retried
      return null;
    }
  })();

  return messagingPromise;
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      logger.info('Notification permission denied');
      return null;
    }

    // Lazy load messaging when needed
    const messaging = await initializeMessaging();
    if (!messaging) {
      logger.error('Firebase Messaging not initialized');
      return null;
    }

    // Get FCM token
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      logger.error('VAPID key not configured. Add VITE_FIREBASE_VAPID_KEY to your .env.local file');
      return null;
    }

    // Dynamically import getToken
    const { getToken } = await import('firebase/messaging');
    const token = await getToken(messaging, {
      vapidKey,
    });

    logger.debug('FCM Token:', token);
    return token;
  } catch (error) {
    logger.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: unknown) => void) => {
  let unsubscribe: (() => void) | null = null;

  // Initialize messaging asynchronously
  initializeMessaging()
    .then(async (messaging) => {
      if (!messaging) {
        logger.error('Firebase Messaging not initialized');
        return;
      }

      // Dynamically import onMessage
      const { onMessage } = await import('firebase/messaging');
      unsubscribe = onMessage(messaging, (payload) => {
        logger.debug('Foreground message received:', payload);
        callback(payload);
      });
    })
    .catch((error) => {
      logger.error('Error setting up foreground message listener:', error);
    });

  // Return cleanup function
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
};

// Save FCM token to user's Firestore document
export const saveFCMToken = async (userId: string, token: string): Promise<void> => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../../config/firebase');

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: token,
      fcmTokenUpdatedAt: new Date(),
    });

    logger.info('FCM token saved to Firestore');
  } catch (error) {
    logger.error('Error saving FCM token:', error);
    throw error;
  }
};

// Remove FCM token from user's document (on sign out)
export const removeFCMToken = async (userId: string): Promise<void> => {
  try {
    const { doc, updateDoc, deleteField } = await import('firebase/firestore');
    const { db } = await import('../../config/firebase');

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: deleteField(),
      fcmTokenUpdatedAt: deleteField(),
    });

    logger.info('FCM token removed from Firestore');
  } catch (error) {
    logger.error('Error removing FCM token:', error);
  }
};
