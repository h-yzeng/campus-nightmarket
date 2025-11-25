import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { app } from '../../config/firebase';

let messaging: Messaging | null = null;

// Initialize Firebase Messaging
export const initializeMessaging = (): Messaging | null => {
  if (typeof window === 'undefined') return null;

  try {
    if (!messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const messaging = initializeMessaging();
    if (!messaging) {
      console.error('Firebase Messaging not initialized');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: 'BGVKgt-0hH0b88RFe1lTM2TiNU2iGCqUBJghK454YRNO-c_DViWBsd7Yc2UNFDfHWZzPBzXzBfnPP7PTQrs8iVo', // TODO: Generate this in Firebase Console
    });

    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: unknown) => void) => {
  const messaging = initializeMessaging();
  if (!messaging) {
    console.error('Firebase Messaging not initialized');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
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

    console.log('FCM token saved to Firestore');
  } catch (error) {
    console.error('Error saving FCM token:', error);
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

    console.log('FCM token removed from Firestore');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
};
