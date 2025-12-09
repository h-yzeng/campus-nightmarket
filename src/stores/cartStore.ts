import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, FoodItem } from '../types';

/**
 * Cart Store - Manages shopping cart state using Zustand
 *
 * Features:
 * - Add items to cart (increments quantity if item already exists)
 * - Update item quantities (removes item if quantity <= 0)
 * - Remove items from cart
 * - Clear entire cart
 * - Persist cart state to localStorage (configured in useCart hook)
 */
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

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      // Initial state
      cart: [],

      // Actions
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find((cartItem) => cartItem.id === item.id);

          if (existingItem) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
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
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
