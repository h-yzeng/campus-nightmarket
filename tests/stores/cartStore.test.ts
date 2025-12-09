/**
 * Cart Store Tests
 * Tests for the Zustand cart store functionality
 */
import { act, renderHook } from '@testing-library/react';
import { useCartStore } from '../../src/stores/cartStore';
import type { FoodItem } from '../../src/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Sample food items for testing
const sampleFoodItem: FoodItem = {
  id: 1,
  name: 'Test Burger',
  description: 'A delicious test burger',
  price: 10.99,
  image: '🍔',
  category: 'Meals',
  seller: 'John Doe',
  sellerId: 'seller123',
  location: 'Main Hall',
  available: true,
  createdAt: '2024-01-01',
};

const anotherFoodItem: FoodItem = {
  id: 2,
  name: 'Test Pizza',
  description: 'A delicious test pizza',
  price: 15.99,
  image: '🍕',
  category: 'Meals',
  seller: 'Jane Doe',
  sellerId: 'seller456',
  location: 'Student Center',
  available: true,
  createdAt: '2024-01-02',
};

describe('cartStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
    localStorageMock.clear();
  });

  describe('addToCart', () => {
    it('should add a new item to empty cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].name).toBe('Test Burger');
      expect(result.current.cart[0].quantity).toBe(1);
    });

    it('should increment quantity when adding existing item', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.addToCart(sampleFoodItem);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(2);
    });

    it('should add multiple different items', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.addToCart(anotherFoodItem);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].name).toBe('Test Burger');
      expect(result.current.cart[1].name).toBe('Test Pizza');
    });

    it('should preserve item properties when adding to cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
      });

      const cartItem = result.current.cart[0];
      expect(cartItem.id).toBe(sampleFoodItem.id);
      expect(cartItem.price).toBe(sampleFoodItem.price);
      expect(cartItem.seller).toBe(sampleFoodItem.seller);
      expect(cartItem.sellerId).toBe(sampleFoodItem.sellerId);
      expect(cartItem.location).toBe(sampleFoodItem.location);
    });
  });

  describe('updateCartQuantity', () => {
    it('should update quantity of existing item', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.updateCartQuantity(1, 5);
      });

      expect(result.current.cart[0].quantity).toBe(5);
    });

    it('should remove item when quantity is set to 0', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.updateCartQuantity(1, 0);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should remove item when quantity is negative', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.updateCartQuantity(1, -1);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should not affect other items when updating one', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.addToCart(anotherFoodItem);
        result.current.updateCartQuantity(1, 10);
      });

      expect(result.current.cart[0].quantity).toBe(10);
      expect(result.current.cart[1].quantity).toBe(1);
    });

    it('should handle non-existent item id gracefully', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.updateCartQuantity(999, 5);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(1);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.removeFromCart(1);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should only remove specified item', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.addToCart(anotherFoodItem);
        result.current.removeFromCart(1);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].name).toBe('Test Pizza');
    });

    it('should handle removing non-existent item', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.removeFromCart(999);
      });

      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.addToCart(anotherFoodItem);
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should work on empty cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('setCart', () => {
    it('should set cart to provided items', () => {
      const { result } = renderHook(() => useCartStore());
      const newCart = [
        { ...sampleFoodItem, quantity: 2 },
        { ...anotherFoodItem, quantity: 3 },
      ];

      act(() => {
        result.current.setCart(newCart);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].quantity).toBe(2);
      expect(result.current.cart[1].quantity).toBe(3);
    });

    it('should replace existing cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.setCart([{ ...anotherFoodItem, quantity: 1 }]);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].name).toBe('Test Pizza');
    });

    it('should set cart to empty array', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addToCart(sampleFoodItem);
        result.current.setCart([]);
      });

      expect(result.current.cart).toHaveLength(0);
    });
  });
});
