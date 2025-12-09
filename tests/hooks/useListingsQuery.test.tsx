import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useListingsQuery } from '../../src/hooks/queries/useListingsQuery';
import { getAllListings } from '../../src/services/listings/listingService';

// Mock firebase config before importing the service
jest.mock('../../src/config/firebase', () => ({
  getFirestoreDb: jest.fn(),
  db: {},
  auth: {},
  storage: {},
}));

// Mock the listing service
jest.mock('../../src/services/listings/listingService');

const mockGetAllListings = getAllListings as jest.MockedFunction<typeof getAllListings>;

describe('useListingsQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch listings successfully', async () => {
    const mockListings = [
      {
        id: '1',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12.99,
        imageURL: '🍕',
        sellerName: 'John Doe',
        sellerId: 'seller1',
        location: 'Campus Center',
        category: 'Food',
        isActive: true,
        isAvailable: true,
      },
    ];

    mockGetAllListings.mockResolvedValue(mockListings as never);

    const { result } = renderHook(() => useListingsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockListings);
    expect(mockGetAllListings).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state', () => {
    mockGetAllListings.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const { result } = renderHook(() => useListingsQuery(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch listings');
    mockGetAllListings.mockRejectedValue(mockError);

    const { result } = renderHook(() => useListingsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should cache listings data', async () => {
    const mockListings = [
      {
        id: '1',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12.99,
        imageURL: '🍕',
        sellerName: 'John Doe',
        sellerId: 'seller1',
        location: 'Campus Center',
        category: 'Food',
        isActive: true,
        isAvailable: true,
      },
    ];

    mockGetAllListings.mockResolvedValue(mockListings as never);

    // First render
    const { result: result1, unmount } = renderHook(() => useListingsQuery(), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    unmount();

    // Second render should use cached data
    const { result: result2 } = renderHook(() => useListingsQuery(), { wrapper });

    // Data should be immediately available from cache
    expect(result2.current.data).toEqual(mockListings);
    expect(mockGetAllListings).toHaveBeenCalledTimes(1); // Only called once, not twice
  });

  it('should refetch listings when invalidated', async () => {
    const mockListings = [
      {
        id: '1',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12.99,
        imageURL: '🍕',
        sellerName: 'John Doe',
        sellerId: 'seller1',
        location: 'Campus Center',
        category: 'Food',
        isActive: true,
        isAvailable: true,
      },
    ];

    mockGetAllListings.mockResolvedValue(mockListings as never);

    const { result } = renderHook(() => useListingsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetAllListings).toHaveBeenCalledTimes(1);

    // Invalidate and refetch
    await queryClient.invalidateQueries({ queryKey: ['listings'] });

    await waitFor(() => {
      expect(mockGetAllListings).toHaveBeenCalledTimes(2);
    });
  });

  it('should return empty array when no listings exist', async () => {
    mockGetAllListings.mockResolvedValue([]);

    const { result } = renderHook(() => useListingsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
