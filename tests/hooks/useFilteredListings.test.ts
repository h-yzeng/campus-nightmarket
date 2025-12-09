import { renderHook } from '@testing-library/react';
import { useFilteredListings } from '../../src/hooks/data/useFilteredListings';
import type { FoodItem } from '../../src/types';

describe('useFilteredListings', () => {
  const mockItems: FoodItem[] = [
    {
      id: 1,
      name: 'Pizza',
      seller: 'John Doe',
      sellerId: 'seller1',
      price: 10,
      image: 'pizza.jpg',
      location: 'North Dorm',
      rating: '4.5',
      description: 'Delicious cheese pizza',
      category: 'Main Dish',
      isActive: true,
      isAvailable: true,
      datePosted: '2024-01-01T00:00:00.000Z',
      purchaseCount: 5,
    },
    {
      id: 2,
      name: 'Burger',
      seller: 'Jane Smith',
      sellerId: 'seller2',
      price: 8,
      image: 'burger.jpg',
      location: 'South Dorm',
      rating: '4.0',
      description: 'Juicy beef burger',
      category: 'Main Dish',
      isActive: true,
      isAvailable: false,
      datePosted: '2024-01-02T00:00:00.000Z',
      purchaseCount: 3,
    },
    {
      id: 3,
      name: 'Salad',
      seller: 'Bob Johnson',
      sellerId: 'seller3',
      price: 15,
      image: 'salad.jpg',
      location: 'North Dorm',
      rating: '3.5',
      description: 'Fresh garden salad',
      category: 'Appetizer',
      isActive: true,
      isAvailable: true,
      datePosted: '2024-01-03T00:00:00.000Z',
      purchaseCount: 2,
    },
  ];

  const defaultParams = {
    items: mockItems,
    searchQuery: '',
    selectedLocation: 'All Dorms',
    selectedCategory: 'All Categories',
    priceRange: [0, 50] as [number, number],
    sortBy: 'newest',
    showAvailableOnly: false,
    sellerRatings: {
      seller1: '4.5',
      seller2: '4.0',
      seller3: '3.5',
    },
  };

  it('should return all items when no filters are applied', () => {
    const { result } = renderHook(() => useFilteredListings(defaultParams));
    expect(result.current).toHaveLength(3);
  });

  it('should filter by search query', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        searchQuery: 'pizza',
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Pizza');
  });

  it('should filter by location', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        selectedLocation: 'North Dorm',
      })
    );
    expect(result.current).toHaveLength(2);
  });

  it('should filter by category', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        selectedCategory: 'Appetizer',
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Salad');
  });

  it('should filter by price range', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        priceRange: [0, 10],
      })
    );
    expect(result.current).toHaveLength(2);
  });

  it('should filter by availability when showAvailableOnly is true', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        showAvailableOnly: true,
      })
    );
    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.isAvailable !== false)).toBe(true);
  });

  it('should sort by price low to high', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        sortBy: 'price-low',
      })
    );
    expect(result.current[0].price).toBe(8);
    expect(result.current[2].price).toBe(15);
  });

  it('should sort by price high to low', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        sortBy: 'price-high',
      })
    );
    expect(result.current[0].price).toBe(15);
    expect(result.current[2].price).toBe(8);
  });

  it('should sort by rating', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        sortBy: 'rating',
      })
    );
    expect(result.current[0].name).toBe('Pizza'); // 4.5 rating
    expect(result.current[2].name).toBe('Salad'); // 3.5 rating
  });

  it('should sort by rating and popularity when ratings are equal', () => {
    const itemsWithSameRating: FoodItem[] = [
      {
        id: 1,
        name: 'Popular Pizza',
        seller: 'John Doe',
        sellerId: 'seller1',
        price: 10,
        image: 'pizza.jpg',
        location: 'North Dorm',
        rating: '4.5',
        description: 'Very popular',
        category: 'Main Dish',
        isActive: true,
        isAvailable: true,
        datePosted: '2024-01-01T00:00:00.000Z',
        purchaseCount: 50, // High popularity
      },
      {
        id: 2,
        name: 'Less Popular Pizza',
        seller: 'Jane Smith',
        sellerId: 'seller2',
        price: 10,
        image: 'pizza2.jpg',
        location: 'South Dorm',
        rating: '4.5',
        description: 'Less popular',
        category: 'Main Dish',
        isActive: true,
        isAvailable: true,
        datePosted: '2024-01-02T00:00:00.000Z',
        purchaseCount: 10, // Lower popularity
      },
    ];

    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        items: itemsWithSameRating,
        sellerRatings: {
          seller1: '4.5',
          seller2: '4.5', // Same rating
        },
        sortBy: 'rating',
      })
    );

    // Should sort by popularity when ratings are equal
    expect(result.current[0].name).toBe('Popular Pizza'); // 50 purchases
    expect(result.current[1].name).toBe('Less Popular Pizza'); // 10 purchases
  });

  it('should apply multiple filters together', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        selectedLocation: 'North Dorm',
        priceRange: [0, 12],
        showAvailableOnly: true,
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Pizza');
  });

  it('should search by seller name', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        searchQuery: 'Jane Smith',
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].seller).toBe('Jane Smith');
  });

  it('should search by description', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        searchQuery: 'cheese',
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Pizza');
  });

  it('should be case insensitive when searching', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        searchQuery: 'PIZZA',
      })
    );
    expect(result.current).toHaveLength(1);
  });

  it('should be case insensitive when filtering by category', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        selectedCategory: 'main dish',
      })
    );
    expect(result.current).toHaveLength(2);
  });

  it('should filter out inactive items', () => {
    const itemsWithInactive: FoodItem[] = [
      ...mockItems,
      {
        id: 4,
        name: 'Inactive Item',
        seller: 'Test Seller',
        sellerId: 'seller4',
        price: 5,
        image: 'test.jpg',
        location: 'North Dorm',
        rating: '4.0',
        description: 'This is inactive',
        category: 'Main Dish',
        isActive: false, // Inactive
        isAvailable: true,
        datePosted: '2024-01-04T00:00:00.000Z',
        purchaseCount: 0,
      },
    ];

    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        items: itemsWithInactive,
      })
    );
    expect(result.current).toHaveLength(3);
    expect(result.current.some((item) => item.name === 'Inactive Item')).toBe(false);
  });

  it('should sort by newest (datePosted) by default', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        sortBy: 'newest',
      })
    );
    // Salad has the most recent date (2024-01-03)
    expect(result.current[0].name).toBe('Salad');
    expect(result.current[2].name).toBe('Pizza');
  });

  it('should handle items without datePosted when sorting by newest', () => {
    const itemsWithoutDate: FoodItem[] = [
      {
        id: 1,
        name: 'No Date Item 1',
        seller: 'Seller',
        sellerId: 'seller1',
        price: 10,
        image: 'img.jpg',
        location: 'North Dorm',
        rating: '4.0',
        description: 'No date',
        category: 'Main Dish',
        isActive: true,
        isAvailable: true,
        purchaseCount: 0,
        // No datePosted
      },
      {
        id: 2,
        name: 'No Date Item 2',
        seller: 'Seller',
        sellerId: 'seller2',
        price: 12,
        image: 'img2.jpg',
        location: 'South Dorm',
        rating: '4.5',
        description: 'Also no date',
        category: 'Main Dish',
        isActive: true,
        isAvailable: true,
        purchaseCount: 0,
        // No datePosted
      },
    ];

    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        items: itemsWithoutDate,
        sellerRatings: { seller1: '4.0', seller2: '4.5' },
        sortBy: 'newest',
      })
    );
    // Should maintain order when no dates
    expect(result.current).toHaveLength(2);
  });

  it('should handle items without purchaseCount when sorting by rating', () => {
    const itemsWithoutPurchaseCount: FoodItem[] = [
      {
        id: 1,
        name: 'Item 1',
        seller: 'Seller 1',
        sellerId: 'seller1',
        price: 10,
        image: 'img.jpg',
        location: 'North Dorm',
        rating: '4.0',
        description: 'Test',
        category: 'Main Dish',
        isActive: true,
        isAvailable: true,
        datePosted: '2024-01-01',
        // No purchaseCount
      },
      {
        id: 2,
        name: 'Item 2',
        seller: 'Seller 2',
        sellerId: 'seller2',
        price: 12,
        image: 'img2.jpg',
        location: 'South Dorm',
        rating: '4.0',
        description: 'Test 2',
        category: 'Main Dish',
        isActive: true,
        isAvailable: true,
        datePosted: '2024-01-02',
        // No purchaseCount
      },
    ];

    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        items: itemsWithoutPurchaseCount,
        sellerRatings: { seller1: '4.0', seller2: '4.0' },
        sortBy: 'rating',
      })
    );
    // Should handle undefined purchaseCount (defaults to 0)
    expect(result.current).toHaveLength(2);
  });

  it('should handle items without description when searching', () => {
    const itemsWithoutDescription: FoodItem[] = [
      {
        id: 1,
        name: 'Test Item',
        seller: 'Seller',
        sellerId: 'seller1',
        price: 10,
        image: 'img.jpg',
        location: 'North Dorm',
        rating: '4.0',
        // No description
        category: 'Main Dish',
        isActive: true,
        isAvailable: true,
        datePosted: '2024-01-01',
        purchaseCount: 0,
      },
    ];

    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        items: itemsWithoutDescription,
        sellerRatings: { seller1: '4.0' },
        searchQuery: 'Test',
      })
    );
    expect(result.current).toHaveLength(1);
  });

  it('should handle missing seller ratings gracefully', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        sellerRatings: {}, // Empty ratings
        sortBy: 'rating',
      })
    );
    // Should still work, treating missing ratings as 0
    expect(result.current).toHaveLength(3);
  });

  it('should handle items without category', () => {
    const itemsWithoutCategory: FoodItem[] = [
      {
        id: 1,
        name: 'No Category Item',
        seller: 'Seller',
        sellerId: 'seller1',
        price: 10,
        image: 'img.jpg',
        location: 'North Dorm',
        rating: '4.0',
        description: 'Test',
        // No category
        isActive: true,
        isAvailable: true,
        datePosted: '2024-01-01',
        purchaseCount: 0,
      },
    ];

    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        items: itemsWithoutCategory,
        sellerRatings: { seller1: '4.0' },
        selectedCategory: 'Main Dish',
      })
    );
    // Should filter out items without matching category
    expect(result.current).toHaveLength(0);
  });

  it('should return empty array when no items match filters', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        searchQuery: 'nonexistent item xyz',
      })
    );
    expect(result.current).toHaveLength(0);
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() =>
      useFilteredListings({
        ...defaultParams,
        items: [],
      })
    );
    expect(result.current).toHaveLength(0);
  });
});
