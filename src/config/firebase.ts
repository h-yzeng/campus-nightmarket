import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import { logger } from '../utils/logger';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required configuration keys
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredKeys.filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
);

if (missingKeys.length > 0) {
  logger.error(
    `Missing Firebase configuration keys: ${missingKeys.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'See .env.local.example for required variables.'
  );
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let appCheck: AppCheck | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize App Check with ReCaptcha V3 for production
  // For development, use debug token (set in Firebase Console)
  if (import.meta.env.PROD || import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN) {
    try {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

      if (siteKey) {
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true,
        });
        logger.info('Firebase App Check initialized with ReCaptcha V3');
      } else {
        logger.warn('ReCaptcha site key not found. App Check not initialized.');
      }
    } catch (appCheckError) {
      logger.error('Error initializing App Check:', appCheckError);
      // Don't throw - allow app to continue without App Check in development
    }
  } else {
    logger.info('App Check disabled in development mode');
  }

  logger.info('Firebase initialized successfully');
} catch (error) {
  logger.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

export { app, auth, db, storage, appCheck };
