import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  DocumentSnapshot,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  type FirebaseUserProfile,
  type CreateUserProfile,
  type UpdateUserProfile,
  COLLECTIONS,
} from '../../types/firebase';
import { logger } from '../../utils/logger';

export const createUserProfile = async (
  uid: string,
  profileData: CreateUserProfile
): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    const profile: Omit<FirebaseUserProfile, 'createdAt' | 'updatedAt'> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      uid,
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, profile);
  } catch (error) {
    logger.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

export const getUserProfile = async (uid: string): Promise<FirebaseUserProfile | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap: DocumentSnapshot = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as FirebaseUserProfile;
  } catch (error) {
    logger.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
};

export const updateUserProfile = async (uid: string, updates: UpdateUserProfile): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
};

export const becomeSeller = async (
  uid: string,
  sellerInfo: FirebaseUserProfile['sellerInfo'],
  emailVerified: boolean
): Promise<void> => {
  try {
    // Require email verification to become a seller
    if (!emailVerified) {
      throw new Error(
        'Please verify your email before becoming a seller. Check your inbox for a verification link.'
      );
    }

    await updateUserProfile(uid, {
      isSeller: true,
      sellerInfo,
    });
  } catch (error) {
    logger.error('Error converting to seller:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to become a seller');
  }
};

export const userExists = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    logger.error('Error checking if user exists:', error);
    return false;
  }
};

export const getUserByEmail = async (email: string): Promise<FirebaseUserProfile | null> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as FirebaseUserProfile;
  } catch (error) {
    logger.error('Error getting user by email:', error);
    throw new Error('Failed to get user by email');
  }
};
