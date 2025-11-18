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

export type OrderType = 'purchase' | 'pickup' | '';

export type PageType = 'welcome' | 'signup' | 'browse' | 'cart' | 'checkout';