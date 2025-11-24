import type { CartItem, Order, ProfileData } from '../types';
import type { CreateOrder, FirebaseOrderItem } from '../types/firebase';
import type { PageType } from './useNavigation';
import type { User } from 'firebase/auth';

interface UseOrderManagementProps {
  createOrder: (orderData: CreateOrder) => Promise<string>;
  user: User | null;
  profileData: ProfileData;
  buyerOrders: Order[];
}

export const useOrderManagement = ({
  createOrder,
  user,
  profileData,
  buyerOrders,
}: UseOrderManagementProps) => {
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

    const itemsBySeller = cart.reduce((acc, item) => {
      if (!acc[item.seller]) {
        acc[item.seller] = [];
      }
      acc[item.seller].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    try {
      const orderPromises = Object.entries(itemsBySeller).map(async ([seller, items]) => {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
          sellerId: seller,
          sellerName: seller,
          items: orderItems,
          total,
          status: 'pending',
          paymentMethod: paymentMethod as 'Cash' | 'CashApp' | 'Venmo' | 'Zelle',
          pickupTime: pickupTimes[seller],
          sellerLocation: items[0].location,
          notes: notes || '',
        };

        return await createOrder(orderData);
      });

      await Promise.all(orderPromises);

      clearCart();
      setCurrentPage('userOrders');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: number, setCurrentPage: (page: PageType) => void) => {
    const order = buyerOrders.find(o => o.id === orderId);
    if (!order) return;

    try {
      console.log('Cancel order not yet implemented with Firebase');
      setCurrentPage('userOrders');
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: Order['status']) => {
    console.log('Update order status:', orderId, status);
  };

  return {
    handlePlaceOrder,
    handleCancelOrder,
    handleUpdateOrderStatus,
  };
};
