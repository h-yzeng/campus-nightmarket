import { useCartStore } from '../stores/cartStore';
import type { FoodItem } from '../types';

/**
 * Hook to manage shopping cart operations
 * Provides a clean interface to the cart store for components
 * Cart state is persisted to localStorage automatically via middleware
 */
export const useCart = () => {
  const cart = useCartStore((state) => state.cart);
  const addToCartStore = useCartStore((state) => state.addToCart);
  const updateCartQuantityStore = useCartStore((state) => state.updateCartQuantity);
  const removeFromCartStore = useCartStore((state) => state.removeFromCart);
  const clearCartStore = useCartStore((state) => state.clearCart);

  const addToCart = (item: FoodItem) => {
    addToCartStore(item);
  };

  const updateCartQuantity = (itemId: number, newQuantity: number) => {
    updateCartQuantityStore(itemId, newQuantity);
  };

  const removeFromCart = (itemId: number) => {
    removeFromCartStore(itemId);
  };

  const clearCart = () => {
    clearCartStore();
  };

  return {
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  };
};
