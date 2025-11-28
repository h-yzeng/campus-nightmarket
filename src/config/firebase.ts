import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck
} from 'firebase/app-check';
import { firebaseConfig } from './firebaseConfig';
import { logger } from '../utils/logger';

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
          isTokenAutoRefreshEnabled: true
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
