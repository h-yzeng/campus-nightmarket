import { useQueryClient } from '@tanstack/react-query';
import { useCreateOrderMutation, useCancelOrderMutation, useUpdateOrderStatusMutation } from './mutations/useOrderMutations';
import type { CartItem, Order, ProfileData } from '../types';
import type { CreateOrder, FirebaseOrderItem } from '../types/firebase';
import type { PageType } from './useNavigation';
import type { User } from 'firebase/auth';

interface UseOrderManagementProps {
  user: User | null;
  profileData: ProfileData;
}

export const useOrderManagement = ({
  user,
  profileData,
}: UseOrderManagementProps) => {
  const queryClient = useQueryClient();
  const createOrderMutation = useCreateOrderMutation();
  const cancelOrderMutation = useCancelOrderMutation();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const handlePlaceOrder = async (
    cart: CartItem[],
    paymentMethod: string,
    pickupTimes: Record<string, string>,
    setCurrentPage: (page: PageType) => void,
    clearCart: () => void,
    notes?: string
  ) => {
    if (!user) {
      console.error('No user signed in');
      return;
    }

    // Group cart items by sellerId (not seller name)
    const itemsBySeller = cart.reduce((acc, item) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = [];
      }
      acc[item.sellerId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    try {
      const orderPromises = Object.entries(itemsBySeller).map(async ([sellerId, items]) => {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const sellerName = items[0].seller; // Get seller name from first item

        const orderItems: FirebaseOrderItem[] = items.map(item => ({
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

        console.log('[useOrderManagement] Creating order:', orderData);
        return await createOrderMutation.mutateAsync(orderData);
      });

      const orderIds = await Promise.all(orderPromises);
      console.log('[useOrderManagement] Orders created successfully:', orderIds);

      clearCart();
      setCurrentPage('userOrders');
    } catch (err) {
      console.error('[useOrderManagement] Error placing order:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: number, setCurrentPage: (page: PageType) => void) => {
    // Get buyer orders from React Query cache
    const buyerOrders = queryClient.getQueryData<Order[]>(['orders', 'buyer', user?.uid]) || [];
    const order = buyerOrders.find(o => o.id === orderId);

    if (!order) {
      console.error('[useOrderManagement] Order not found:', orderId);
      return;
    }

    try {
      console.log('[useOrderManagement] Cancelling order:', order.firebaseId);
      await cancelOrderMutation.mutateAsync(order.firebaseId);
      console.log('[useOrderManagement] Order cancelled successfully');
      setCurrentPage('userOrders');
    } catch (err) {
      console.error('[useOrderManagement] Error cancelling order:', err);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: Order['status']) => {
    // Get seller orders from React Query cache
    const sellerOrders = queryClient.getQueryData<Order[]>(['orders', 'seller', user?.uid]) || [];
    const order = sellerOrders.find(o => o.id === orderId);

    if (!order) {
      console.error('[useOrderManagement] Order not found:', orderId);
      return;
    }

    try {
      console.log('[useOrderManagement] Updating order status:', order.firebaseId, 'to', status);
      await updateOrderStatusMutation.mutateAsync({ orderId: order.firebaseId, status });
      console.log('[useOrderManagement] Order status updated successfully');
    } catch (err) {
      console.error('[useOrderManagement] Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  return {
    handlePlaceOrder,
    handleCancelOrder,
    handleUpdateOrderStatus,
  };
};
