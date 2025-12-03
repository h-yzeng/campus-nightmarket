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
}

export interface CartItem extends FoodItem {
  quantity: number;
}

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

export interface SellerInfo {
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
}

export type ListingWithFirebaseId = Listing & { firebaseId: string };

export interface Transaction {
  id: number;
  buyerName: string;
  itemName: string;
  price: number;
  date: string;
  rating: number;
  review?: string;
}

export type PaymentMethod = 'Cash' | 'CashApp' | 'Venmo' | 'Zelle';

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';

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

export type UserMode = 'buyer' | 'seller';

export type OrderType = 'purchase' | 'pickup' | '';

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
