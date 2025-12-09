import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOrder as createOrderService,
  updateOrderStatus,
  cancelOrder as cancelOrderService,
} from '../../services/orders/orderService';
import type { CreateOrder } from '../../types/firebase';
import type { OrderStatus } from '../../types';
import type { Order } from '../../types';
import { queryKeys } from '../../utils/queryKeys';

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrder) => {
      return await createOrderService(orderData);
    },
    onSuccess: (_data, variables) => {
      // Invalidate buyer orders for the user who placed the order
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.buyer(variables.buyerId) });
      // Invalidate seller orders for the seller
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.seller(variables.sellerId) });
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  const updateCachedOrders = (orderId: string, status: OrderStatus) => {
    const queries = queryClient.getQueriesData<Order[]>({ queryKey: queryKeys.orders.all });

    queries.forEach(([queryKey, data]) => {
      if (!data) return;

      const next = data.map((order) =>
        order.firebaseId === orderId ? { ...order, status } : order
      );

      queryClient.setQueryData(queryKey, next);
    });
  };

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return await updateOrderStatus(orderId, status);
    },
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });

      const previousOrders = queryClient.getQueriesData<Order[]>({
        queryKey: queryKeys.orders.all,
      });

      updateCachedOrders(orderId, status);

      return { previousOrders };
    },
    onError: (_error, _variables, context) => {
      context?.previousOrders?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: (_data, _error, variables) => {
      updateCachedOrders(variables.orderId, variables.status);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();

  const updateCachedOrders = (orderId: string) => {
    const queries = queryClient.getQueriesData<Order[]>({ queryKey: queryKeys.orders.all });

    queries.forEach(([queryKey, data]) => {
      if (!data) return;

      const next = data.map((order) =>
        order.firebaseId === orderId ? { ...order, status: 'cancelled' as OrderStatus } : order
      );

      queryClient.setQueryData(queryKey, next);
    });
  };

  return useMutation({
    mutationFn: async (orderId: string) => {
      return await cancelOrderService(orderId);
    },
    onSuccess: (_data, orderId) => {
      updateCachedOrders(orderId);
    },
  });
};
