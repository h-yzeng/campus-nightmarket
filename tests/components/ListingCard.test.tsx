import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListingCard from '../../src/components/ListingCard';
import type { FoodItem } from '../../src/types';

// Mock the useFavorites hook
jest.mock('../../src/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favoriteIds: [],
    isLoading: false,
    isFavorited: jest.fn(() => false),
    toggleFavorite: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    isToggling: false,
  }),
}));

// Mock the useAuth hook
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    loading: false,
  }),
}));

describe('ListingCard', () => {
  const mockItem: FoodItem = {
    id: 1,
    name: 'Delicious Pizza',
    description: 'Fresh pizza with cheese and toppings',
    price: 12.99,
    image: '🍕',
    seller: 'John Doe',
    sellerId: 'seller123',
    location: 'Campus Center',
    rating: '4.5',
    category: 'Food',
    isActive: true,
    isAvailable: true,
    purchaseCount: 15,
  };

  const mockCallbacks = {
    onAddToCart: jest.fn(),
    onViewProfile: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render listing card with item details', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByText('Delicious Pizza')).toBeInTheDocument();
    expect(screen.getByText(/Fresh pizza with cheese/)).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText(/by John/)).toBeInTheDocument();
    expect(screen.getByText('Campus Center')).toBeInTheDocument();
  });

  it('should display seller rating when provided', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should not display rating when null', () => {
    render(<ListingCard item={mockItem} sellerRating={null} {...mockCallbacks} />);

    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
  });

  it('should show popular badge when purchase count > 10', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByText(/POPULAR/)).toBeInTheDocument();
  });

  it('should not show popular badge when purchase count <= 10', () => {
    const unpopularItem = { ...mockItem, purchaseCount: 5 };
    render(<ListingCard item={unpopularItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.queryByText(/POPULAR/)).not.toBeInTheDocument();
  });

  it('should display availability status', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByText('✓ AVAILABLE')).toBeInTheDocument();
  });

  it('should show sold out when not available', () => {
    const soldOutItem = { ...mockItem, isAvailable: false };
    render(<ListingCard item={soldOutItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByText('✕ SOLD OUT')).toBeInTheDocument();
  });

  it('should display category badge', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('should display purchase count', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByText('15 bought')).toBeInTheDocument();
  });

  it('should call onAddToCart when add button is clicked', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    const addButton = screen.getByRole('button', { name: /Add.*to cart/i });
    fireEvent.click(addButton);

    expect(mockCallbacks.onAddToCart).toHaveBeenCalledWith(mockItem);
    expect(mockCallbacks.onAddToCart).toHaveBeenCalledTimes(1);
  });

  it('should call onViewProfile when seller link is clicked', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    const sellerButton = screen.getByRole('button', { name: /View.*profile/i });
    fireEvent.click(sellerButton);

    expect(mockCallbacks.onViewProfile).toHaveBeenCalledWith('seller123');
    expect(mockCallbacks.onViewProfile).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA labels for accessibility', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByRole('article')).toHaveAttribute(
      'aria-label',
      'Delicious Pizza listing by John Doe'
    );

    expect(screen.getByRole('button', { name: /Add.*to cart/i })).toHaveAttribute(
      'aria-label',
      'Add Delicious Pizza to cart - $12.99'
    );

    expect(screen.getByRole('button', { name: /View.*profile/i })).toHaveAttribute(
      'aria-label',
      "View John Doe's profile"
    );
  });

  it('should support keyboard navigation - Enter key on card', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    const card = screen.getByRole('article');
    fireEvent.keyDown(card, { key: 'Enter' });

    // Should focus the view profile button
    const viewProfileButton = screen.getByRole('button', { name: /View.*profile/i });
    expect(document.activeElement).toBe(viewProfileButton);
  });

  it('should support keyboard navigation - Space key on add to cart button', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    const addButton = screen.getByRole('button', { name: /Add.*to cart/i });
    fireEvent.keyDown(addButton, { key: ' ' });

    expect(mockCallbacks.onAddToCart).toHaveBeenCalledWith(mockItem);
  });

  it('should render image emoji when image is not a URL', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    expect(screen.getByText('🍕')).toBeInTheDocument();
  });

  it('should render img element when image is a URL', () => {
    const itemWithUrl = { ...mockItem, image: 'https://example.com/pizza.jpg' };
    render(<ListingCard item={itemWithUrl} sellerRating="4.5" {...mockCallbacks} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/pizza.jpg');
    expect(img).toHaveAttribute('alt', expect.stringContaining('Delicious Pizza'));
  });

  it('should have focus-visible styles on interactive elements', () => {
    render(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    const addButton = screen.getByRole('button', { name: /Add.*to cart/i });
    expect(addButton).toHaveClass('focus:outline-none');
    expect(addButton).toHaveClass('focus:ring-2');
  });

  it('should memoize and not re-render with same props', () => {
    const { rerender } = render(
      <ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />
    );

    const initialElement = screen.getByText('Delicious Pizza');

    // Re-render with same props
    rerender(<ListingCard item={mockItem} sellerRating="4.5" {...mockCallbacks} />);

    const afterRerender = screen.getByText('Delicious Pizza');
    expect(afterRerender).toBe(initialElement);
  });
});
