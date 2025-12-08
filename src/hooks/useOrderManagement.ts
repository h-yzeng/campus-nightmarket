import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateOrderMutation,
  useCancelOrderMutation,
  useUpdateOrderStatusMutation,
} from './mutations/useOrderMutations';
import type { CartItem, Order, ProfileData } from '../types';
import type { CreateOrder, FirebaseOrderItem } from '../types/firebase';
import type { User } from 'firebase/auth';
import { logger } from '../utils/logger';
import { rateLimiter, RATE_LIMITS } from '../utils/rateLimiter';
import { toast } from 'sonner';

interface UseOrderManagementProps {
  user: User | null;
  profileData: ProfileData;
}

export const useOrderManagement = ({ user, profileData }: UseOrderManagementProps) => {
  const queryClient = useQueryClient();
  const createOrderMutation = useCreateOrderMutation();
  const cancelOrderMutation = useCancelOrderMutation();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const handlePlaceOrder = async (
    cart: CartItem[],
    paymentMethod: string,
    pickupTimes: Record<string, string>,
    clearCart: () => void,
    notes?: string
  ) => {
    if (!user) {
      logger.error('No user signed in');
      return;
    }

    // Rate limiting check
    const rateLimit = rateLimiter.checkLimit(
      `order_creation_${user.uid}`,
      RATE_LIMITS.ORDER_CREATION
    );
    if (!rateLimit.allowed) {
      toast.error(rateLimit.message || 'Too many orders. Please try again later.');
      return;
    }

    // Group cart items by sellerId (not seller name)
    const itemsBySeller = cart.reduce(
      (acc, item) => {
        if (!acc[item.sellerId]) {
          acc[item.sellerId] = [];
        }
        acc[item.sellerId].push(item);
        return acc;
      },
      {} as Record<string, CartItem[]>
    );

    try {
      const orderPromises = Object.entries(itemsBySeller).map(async ([sellerId, items]) => {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const sellerName = items[0].seller; // Get seller name from first item

        const orderItems: FirebaseOrderItem[] = items.map((item) => ({
          listingId: item.id.toString(),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageURL: item.image,
          seller: item.seller,
          location: item.location,
        }));

        const orderData: CreateOrder = {
          buyerId: user.uid,
          buyerName: `${profileData.firstName} ${profileData.lastName}`,
          buyerEmail: profileData.email,
          sellerId: sellerId,
          sellerName: sellerName,
          items: orderItems,
          total,
          status: 'pending',
          paymentMethod: paymentMethod as 'Cash' | 'CashApp' | 'Venmo' | 'Zelle',
          pickupTime: pickupTimes[sellerName],
          sellerLocation: items[0].location,
          notes: notes || '',
        };

        logger.general('[useOrderManagement] Creating order:', orderData);
        return {
          sellerName,
          result: await createOrderMutation
            .mutateAsync(orderData)
            .catch((err: unknown) => ({ error: err })),
        };
      });

      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled(orderPromises);

      const successfulOrders: string[] = [];
      const failedOrders: string[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { sellerName, result: orderResult } = result.value;
          if (typeof orderResult === 'object' && orderResult !== null && 'error' in orderResult) {
            failedOrders.push(sellerName);
            logger.error(
              `[useOrderManagement] Order failed for ${sellerName}:`,
              (orderResult as { error: unknown }).error
            );
          } else {
            successfulOrders.push(sellerName);
            logger.general(
              `[useOrderManagement] Order created successfully for ${sellerName}:`,
              orderResult
            );
          }
        } else {
          failedOrders.push('Unknown seller');
          logger.error('[useOrderManagement] Order promise rejected:', result.reason);
        }
      });

      // Handle results
      if (failedOrders.length === 0) {
        // All orders succeeded
        logger.general('[useOrderManagement] All orders created successfully');
        clearCart();
        toast.success('All orders placed successfully!');
      } else if (successfulOrders.length === 0) {
        // All orders failed
        logger.error('[useOrderManagement] All orders failed');
        toast.error('Failed to place orders. Please try again.');
      } else {
        // Partial success
        logger.warn('[useOrderManagement] Some orders failed:', {
          successful: successfulOrders,
          failed: failedOrders,
        });

        toast.warning(
          `${successfulOrders.length} order(s) placed successfully! ${failedOrders.length} order(s) failed for: ${failedOrders.join(', ')}. Please review your cart and try again for failed orders.`,
          { duration: 6000 }
        );
      }
    } catch (err) {
      logger.error('[useOrderManagement] Unexpected error placing order:', err);
      toast.error('An unexpected error occurred. Please check your orders and try again.');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    // Get buyer orders from React Query cache
    const buyerOrders = queryClient.getQueryData<Order[]>(['orders', 'buyer', user?.uid]) || [];
    const order = buyerOrders.find((o) => o.id === orderId);

    if (!order) {
      logger.error('[useOrderManagement] Order not found:', orderId);
      return;
    }

    try {
      logger.general('[useOrderManagement] Cancelling order:', order.firebaseId);
      await cancelOrderMutation.mutateAsync(order.firebaseId);
      logger.general('[useOrderManagement] Order cancelled successfully');
      toast.success('Order cancelled successfully');
    } catch (err) {
      logger.error('[useOrderManagement] Error cancelling order:', err);
      toast.error('Failed to cancel order. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: Order['status']) => {
    // Get seller orders from React Query cache
    const sellerOrders = queryClient.getQueryData<Order[]>(['orders', 'seller', user?.uid]) || [];
    const order = sellerOrders.find((o) => o.id === orderId);

    if (!order) {
      logger.error('[useOrderManagement] Order not found:', orderId);
      return;
    }

    try {
      logger.general('[useOrderManagement] Updating order status:', order.firebaseId, 'to', status);
      await updateOrderStatusMutation.mutateAsync({ orderId: order.firebaseId, status });
      logger.general('[useOrderManagement] Order status updated successfully');

      // Show success toast with status-specific message
      const statusMessages = {
        confirmed: 'Order confirmed! Buyer will be notified.',
        ready: 'Order marked as ready for pickup!',
        completed: 'Order completed successfully!',
        cancelled: 'Order has been cancelled.',
        pending: 'Order status updated.',
      };
      toast.success(statusMessages[status] || 'Order status updated successfully');
    } catch (err) {
      logger.error('[useOrderManagement] Error updating order status:', err);
      toast.error('Failed to update order status. Please try again.');
    }
  };

  return {
    handlePlaceOrder,
    handleCancelOrder,
    handleUpdateOrderStatus,
  };
};
