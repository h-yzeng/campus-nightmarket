import { create } from 'zustand';
import type { Order } from '../types';

interface OrdersState {
  // State
  buyerOrders: Order[];
  sellerOrders: Order[];
  buyerOrdersLoading: boolean;
  sellerOrdersLoading: boolean;

  // Actions
  setBuyerOrders: (orders: Order[]) => void;
  setSellerOrders: (orders: Order[]) => void;
  setBuyerOrdersLoading: (loading: boolean) => void;
  setSellerOrdersLoading: (loading: boolean) => void;
  updateOrderStatus: (orderId: number, status: Order['status'], isSeller: boolean) => void;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  // Initial state
  buyerOrders: [],
  sellerOrders: [],
  buyerOrdersLoading: false,
  sellerOrdersLoading: false,

  // Actions
  setBuyerOrders: (orders) => set({ buyerOrders: orders }),

  setSellerOrders: (orders) => set({ sellerOrders: orders }),

  setBuyerOrdersLoading: (loading) => set({ buyerOrdersLoading: loading }),

  setSellerOrdersLoading: (loading) => set({ sellerOrdersLoading: loading }),

  updateOrderStatus: (orderId, status, isSeller) =>
    set((state) => {
      if (isSeller) {
        return {
          sellerOrders: state.sellerOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        };
      } else {
        return {
          buyerOrders: state.buyerOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        };
      }
    }),

  clearOrders: () =>
    set({
      buyerOrders: [],
      sellerOrders: [],
      buyerOrdersLoading: false,
      sellerOrdersLoading: false,
    }),
}));
