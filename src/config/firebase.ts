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

const firebaseInitDisabled = import.meta.env.VITE_DISABLE_FIREBASE_INIT === 'true';
const allowInitInNode = import.meta.env.VITE_ENABLE_FIREBASE_IN_NODE === 'true';
const shouldInitFirebase = typeof window !== 'undefined' || allowInitInNode;

interface FirebaseResources {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  appCheck: AppCheck | null;
}

let resources: FirebaseResources | null = null;
let initError: Error | null = null;

// Legacy placeholders exported for Jest mocks and legacy imports
// These are intentionally empty; real code should call the getters below.
export const app = {} as FirebaseApp;
export const auth = {} as Auth;
export const db = {} as Firestore;
export const storage = {} as FirebaseStorage;

const initializeFirebase = () => {
  if (resources || initError || firebaseInitDisabled || !shouldInitFirebase) {
    return;
  }

  const missingKeys = requiredKeys.filter(
    (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
  );

  if (missingKeys.length > 0) {
    const message =
      `Missing Firebase configuration keys: ${missingKeys.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'See .env.local.example for required variables.';

    initError = new Error(message);
    logger.error(message);

    if (import.meta.env.PROD) {
      throw initError;
    }
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    let appCheck: AppCheck | null = null;

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
      }
    } else {
      logger.info('App Check disabled in development mode');
    }

    resources = { app, auth, db, storage, appCheck };
    logger.info('Firebase initialized successfully');
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    logger.error('Error initializing Firebase:', error);

    if (import.meta.env.PROD) {
      throw initError;
    }
  }
};

const requireResources = (): FirebaseResources => {
  initializeFirebase();

  if (firebaseInitDisabled) {
    throw new Error('Firebase initialization disabled via VITE_DISABLE_FIREBASE_INIT.');
  }

  if (!shouldInitFirebase) {
    throw new Error(
      'Firebase initialization skipped because window is not available. Set VITE_ENABLE_FIREBASE_IN_NODE=true to force initialization in non-browser environments.'
    );
  }

  if (initError) {
    throw initError;
  }

  if (!resources) {
    throw new Error('Firebase failed to initialize.');
  }

  return resources;
};

export const getFirebaseApp = () => requireResources().app;
export const getFirebaseAuth = () => requireResources().auth;
export const getFirestoreDb = () => requireResources().db;
export const getFirebaseStorage = () => requireResources().storage;
export const getFirebaseAppCheck = () => requireResources().appCheck;
