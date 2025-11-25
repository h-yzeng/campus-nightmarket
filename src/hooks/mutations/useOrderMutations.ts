import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOrder as createOrderService,
  updateOrderStatus,
  cancelOrder as cancelOrderService,
} from '../../services/orders/orderService';
import type { CreateOrder, OrderStatus } from '../../types';

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrder) => {
      return await createOrderService(orderData);
    },
    onSuccess: (_data, variables) => {
      // Invalidate buyer orders for the user who placed the order
      queryClient.invalidateQueries({ queryKey: ['orders', 'buyer', variables.buyerId] });
      // Invalidate seller orders for the seller
      queryClient.invalidateQueries({ queryKey: ['orders', 'seller', variables.sellerId] });
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return await updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      // Invalidate all orders to refresh both buyer and seller views
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return await cancelOrderService(orderId);
    },
    onSuccess: () => {
      // Invalidate all orders to refresh
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
