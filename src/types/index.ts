export interface FoodItem {
  id: number;
  name: string;
  seller: string;
  price: number;
  image: string;
  location: string;
  rating: string;
  description: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface ProfileData {
  email: string;
  password: string;
  confirmPassword: string;
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
  isAvailable: boolean;
  category: string;
  datePosted: string;
}

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
  | 'sellerListings'
  | 'sellerOrders';