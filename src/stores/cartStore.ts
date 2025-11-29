import { create } from 'zustand';
import type { CartItem, FoodItem } from '../types';

interface CartState {
  // State
  cart: CartItem[];

  // Actions
  addToCart: (item: FoodItem) => void;
  updateCartQuantity: (itemId: number, newQuantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  setCart: (cart: CartItem[]) => void;
}

export const useCartStore = create<CartState>((set) => ({
  // Initial state
  cart: [],

  // Actions
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return {
          cart: state.cart.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
          ),
        };
      }

      const cartItem: CartItem = {
        ...item,
        quantity: 1,
      };

      return { cart: [...state.cart, cartItem] };
    }),

  updateCartQuantity: (itemId, newQuantity) =>
    set((state) => {
      if (newQuantity <= 0) {
        return { cart: state.cart.filter((item) => item.id !== itemId) };
      }

      return {
        cart: state.cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    })),

  clearCart: () => set({ cart: [] }),

  setCart: (cart) => set({ cart }),
}));
