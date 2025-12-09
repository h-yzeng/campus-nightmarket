import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOrderManagement } from '../../src/hooks/data/useOrderManagement';
import type { ProfileData, CartItem } from '../../src/types';

const createOrderMock = jest.fn();
const cancelOrderMock = jest.fn();
const updateOrderStatusMock = jest.fn();

jest.mock('../../src/hooks/mutations/useOrderMutations', () => ({
  useCreateOrderMutation: () => ({ mutateAsync: createOrderMock }),
  useCancelOrderMutation: () => ({ mutateAsync: cancelOrderMock }),
  useUpdateOrderStatusMutation: () => ({ mutateAsync: updateOrderStatusMock }),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useOrderManagement', () => {
  const user = { uid: 'buyer-1' } as unknown as import('firebase/auth').User;
  const profileData: ProfileData = {
    email: 'test@hawk.illinoistech.edu',
    firstName: 'Test',
    lastName: 'User',
    studentId: 'A123',
    bio: '',
    photo: null,
    isSeller: false,
  };

  const cart: CartItem[] = [
    {
      id: 1,
      name: 'Noodles',
      price: 10,
      quantity: 1,
      image: 'img',
      seller: 'Seller A',
      sellerId: 'seller-a',
      location: 'North',
      category: 'Main',
      rating: '4.0',
      description: 'Tasty',
      isActive: true,
      isAvailable: true,
    },
    {
      id: 2,
      name: 'Dumplings',
      price: 8,
      quantity: 2,
      image: 'img',
      seller: 'Seller B',
      sellerId: 'seller-b',
      location: 'South',
      category: 'Main',
      rating: '4.5',
      description: 'Good',
      isActive: true,
      isAvailable: true,
    },
  ];

  beforeEach(() => {
    createOrderMock.mockReset();
    cancelOrderMock.mockReset();
    updateOrderStatusMock.mockReset();
    createOrderMock.mockResolvedValue('ok');
  });

  it('groups orders by seller and clears cart on full success', async () => {
    const clearCart = jest.fn();
    const { result } = renderHook(() => useOrderManagement({ user, profileData }), { wrapper });

    await act(async () => {
      await result.current.handlePlaceOrder(
        cart,
        'Cash',
        { 'Seller A': '5pm', 'Seller B': '6pm' },
        clearCart
      );
    });

    expect(createOrderMock).toHaveBeenCalledTimes(2);
    expect(clearCart).toHaveBeenCalled();
  });
});
