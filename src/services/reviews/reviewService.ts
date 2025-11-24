import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  type FirebaseReview,
  type CreateReview,
  COLLECTIONS,
} from '../../types/firebase';

export const createReview = async (reviewData: CreateReview): Promise<string> => {
  try {
    const reviewsRef = collection(db, COLLECTIONS.REVIEWS);

    const review = {
      ...reviewData,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(reviewsRef, review);
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw new Error('Failed to create review');
  }
};

export const getReview = async (reviewId: string): Promise<FirebaseReview | null> => {
  try {
    const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      return null;
    }

    return {
      id: reviewSnap.id,
      ...reviewSnap.data(),
    } as FirebaseReview;
  } catch (error) {
    console.error('Error getting review:', error);
    throw new Error('Failed to get review');
  }
};

export const getSellerReviews = async (sellerId: string): Promise<FirebaseReview[]> => {
  try {
    const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
    const q = query(
      reviewsRef,
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reviews: FirebaseReview[] = [];

    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseReview);
    });

    return reviews;
  } catch (error) {
    console.error('Error getting seller reviews:', error);
    throw new Error('Failed to get seller reviews');
  }
};

export const getBuyerReviews = async (buyerId: string): Promise<FirebaseReview[]> => {
  try {
    const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
    const q = query(
      reviewsRef,
      where('buyerId', '==', buyerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reviews: FirebaseReview[] = [];

    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseReview);
    });

    return reviews;
  } catch (error) {
    console.error('Error getting buyer reviews:', error);
    throw new Error('Failed to get buyer reviews');
  }
};

export const getOrderReview = async (orderId: string): Promise<FirebaseReview | null> => {
  try {
    const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
    const q = query(reviewsRef, where('orderId', '==', orderId));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as FirebaseReview;
  } catch (error) {
    console.error('Error getting order review:', error);
    throw new Error('Failed to get order review');
  }
};

export const getSellerAverageRating = async (sellerId: string): Promise<number> => {
  try {
    const reviews = await getSellerReviews(sellerId);

    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  } catch (error) {
    console.error('Error calculating seller average rating:', error);
    return 0;
  }
};

export const hasReviewedOrder = async (orderId: string): Promise<boolean> => {
  try {
    const review = await getOrderReview(orderId);
    return review !== null;
  } catch (error) {
    console.error('Error checking if order is reviewed:', error);
    return false;
  }
};
