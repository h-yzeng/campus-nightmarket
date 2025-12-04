/**
 * Core Type Definitions for Campus Night Market
 *
 * This file contains all the main TypeScript interfaces and types used throughout the application.
 * Types are organized by domain: Items/Listings, Orders, Reviews, Users, and Navigation.
 */

// ============================================================================
// ITEMS & LISTINGS
// ============================================================================

/**
 * FoodItem - Represents a food listing in the marketplace
 * Used for displaying items in Browse page and previews
 */
export interface FoodItem {
  id: number;
  name: string;
  seller: string;
  sellerId: string;
  price: number;
  image: string;
  location: string;
  rating: string;
  description: string;
  category?: string;
  isActive?: boolean; // Controls visibility in Browse.tsx (active = shows, inactive = hidden)
  isAvailable?: boolean; // Controls supply status (available = in stock, unavailable = sold out)
  datePosted?: string;
  purchaseCount?: number; // Total number of purchases for this item
}

/**
 * CartItem - Extends FoodItem with quantity for shopping cart
 */
export interface CartItem extends FoodItem {
  quantity: number;
}

// ============================================================================
// USER PROFILES
// ============================================================================

/**
 * ProfileData - User profile information
 * Contains both buyer and seller information
 */
export interface ProfileData {
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  bio: string;
  photo: string | null;
  isSeller: boolean;
  sellerInfo?: SellerInfo;
}

/**
 * SellerInfo - Additional information for users who are sellers
 * Only present when ProfileData.isSeller is true
 */
export interface SellerInfo {
  phone?: string;
  paymentMethods: {
    cashApp?: string;
    venmo?: string;
    zelle?: string;
  };
  preferredLocations: string[];
  rating?: number; // Calculated from reviews
  reviewCount?: number; // Total number of reviews received
}

/**
 * Listing - Alternative representation of a food item
 * Used in seller-specific contexts (managing own listings)
 */
export interface Listing {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  location: string;
  sellerId: string;
  sellerName: string;
  isActive: boolean; // Controls visibility in Browse.tsx (active = shows, inactive = hidden)
  isAvailable: boolean; // Controls supply status (available = in stock, unavailable = sold out)
  category: string;
  datePosted: string;
  purchaseCount?: number; // Total number of purchases for this item
}

export type ListingWithFirebaseId = Listing & { firebaseId: string };

// ============================================================================
// ORDERS & TRANSACTIONS
// ============================================================================

/**
 * Transaction - Historical transaction record (deprecated, kept for backward compatibility)
 * Consider using Order type instead for new features
 */
export interface Transaction {
  id: number;
  buyerName: string;
  itemName: string;
  price: number;
  date: string;
  rating: number;
  review?: string;
}

/**
 * PaymentMethod - Supported payment methods for orders
 */
export type PaymentMethod = 'Cash' | 'CashApp' | 'Venmo' | 'Zelle';

/**
 * OrderStatus - Lifecycle states of an order
 * Flow: pending → confirmed → ready → completed
 * Can be cancelled at pending or confirmed stages
 */
export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';

/**
 * Order - Complete order information
 * Contains items, buyer/seller info, status, and payment details
 * Orders are grouped by seller - one cart can create multiple orders
 */
export interface Order {
  id: number;
  firebaseId: string;
  items: CartItem[];
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  orderDate: string;
  total: number;
  notes?: string;
  buyerId?: string;
  buyerName?: string;
  reviewId?: string;
  hasReview?: boolean;
}

// ============================================================================
// REVIEWS
// ============================================================================

/**
 * Review - Customer review for a completed order
 * Reviews are associated with sellers and can reference multiple items
 */
export interface Review {
  id: string;
  orderId: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  listingIds: number[];
  itemNames: string[];
}

// ============================================================================
// NAVIGATION & UI STATE
// ============================================================================

/**
 * UserMode - Current mode of the application
 * Determines which UI and features are displayed
 */
export type UserMode = 'buyer' | 'seller';

/**
 * OrderType - Type of order being viewed/filtered
 */
export type OrderType = 'purchase' | 'pickup' | '';

/**
 * PageType - All possible pages/routes in the application
 * Used for navigation and state management
 */
export type PageType =
  | 'home'
  | 'login'
  | 'signup'
  | 'browse'
  | 'cart'
  | 'checkout'
  | 'profile'
  | 'viewProfile'
  | 'userOrders'
  | 'orderDetails'
  | 'sellerDashboard'
  | 'createListing'
  | 'editListing'
  | 'sellerListings'
  | 'sellerOrders';

// Re-export Firebase types
export type { CreateOrder, CreateListing, UpdateOrder, UpdateListing } from './firebase';
