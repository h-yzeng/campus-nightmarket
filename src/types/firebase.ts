import type { Timestamp } from 'firebase/firestore';
import type { PaymentMethod, OrderStatus } from './index';

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface FirebaseUserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  bio: string;
  photoURL: string | null;
  isSeller: boolean;
  sellerInfo?: FirebaseSellerInfo;
  securityQuestions?: SecurityQuestion[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseSellerInfo {
  phone?: string;
  paymentMethods: {
    cashApp?: string;
    venmo?: string;
    zelle?: string;
  };
  preferredLocations: string[];
  rating?: number;
  reviewCount?: number;
}

export interface FirebaseListing {
  id: string;
  name: string;
  description: string;
  price: number;
  imageURL: string;
  location: string;
  sellerId: string;
  sellerName: string;
  isActive: boolean; // Controls visibility in Browse.tsx (active = shows, inactive = hidden)
  isAvailable: boolean; // Controls supply status (available = in stock, unavailable = sold out)
  category: string;
  purchaseCount?: number; // Total number of purchases for this item
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseOrderItem {
  listingId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL: string;
  seller: string;
  location: string;
}

export interface FirebaseOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  items: FirebaseOrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  pickupTime: string;
  notes?: string;
  reviewId?: string;
  hasReview?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseReview {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  rating: number;
  comment?: string;
  itemNames: string[];
  listingIds: string[];
  createdAt: Timestamp;
}

export type CreateUserProfile = Omit<FirebaseUserProfile, 'uid' | 'createdAt' | 'updatedAt'>;
export type CreateListing = Omit<FirebaseListing, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateOrder = Omit<FirebaseOrder, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateReview = Omit<FirebaseReview, 'id' | 'createdAt'>;

export type UpdateUserProfile = Partial<Omit<FirebaseUserProfile, 'uid' | 'email' | 'createdAt'>>;
export type UpdateListing = Partial<Omit<FirebaseListing, 'id' | 'sellerId' | 'createdAt'>>;
export type UpdateOrder = Partial<Omit<FirebaseOrder, 'id' | 'buyerId' | 'sellerId' | 'createdAt'>>;

export const COLLECTIONS = {
  USERS: 'users',
  LISTINGS: 'listings',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
} as const;

export const STORAGE_PATHS = {
  PROFILE_PHOTOS: 'profile-photos',
  LISTING_IMAGES: 'listing-images',
} as const;
