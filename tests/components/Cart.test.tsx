import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../../src/pages/buyer/Cart';
import type { CartItem, ProfileData } from '../../src/types';

// Mock Header component
jest.mock('../../src/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
});

// Mock Footer component
jest.mock('../../src/components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

describe('Cart', () => {
  const mockCartItems: CartItem[] = [
    {
      id: 1,
      name: 'Pizza',
      price: 12.99,
      quantity: 2,
      image: '🍕',
      seller: 'John Doe',
      sellerId: 'seller1',
      location: 'Campus Center',
      rating: '4.5',
      description: 'Delicious pizza',
    },
    {
      id: 2,
      name: 'Burger',
      price: 8.99,
      quantity: 1,
      image: '🍔',
      seller: 'Jane Smith',
      sellerId: 'seller2',
      location: 'North Campus',
      rating: '4.8',
      description: 'Tasty burger',
    },
  ];

  const mockProfileData: ProfileData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    studentId: 'STU456',
    bio: 'Test bio',
    photo: null,
    isSeller: false,
  };

  const mockProps = {
    cart: mockCartItems,
    profileData: mockProfileData,
    userMode: 'buyer' as const,
    onUpdateQuantity: jest.fn(),
    onRemoveItem: jest.fn(),
    onCheckout: jest.fn(),
    onContinueShopping: jest.fn(),
    onSignOut: jest.fn(),
    onProfileClick: jest.fn(),
    onOrdersClick: jest.fn(),
    onModeChange: jest.fn(),
    onSellerDashboardClick: jest.fn(),
    onLogoClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCart = (props = {}) =>
    render(
      <BrowserRouter>
        <Cart {...mockProps} {...props} />
      </BrowserRouter>
    );

  it('should render cart page with items', () => {
    renderCart();

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
  });

  it('should display correct item details', () => {
    renderCart();

    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText(/by John/)).toBeInTheDocument();
    expect(screen.getByText('Campus Center')).toBeInTheDocument();
    expect(screen.getByText('$25.98')).toBeInTheDocument(); // 12.99 * 2
  });

  it('should calculate total correctly', () => {
    renderCart();

    // Pizza: 12.99 * 2 = 25.98, Burger: 8.99 * 1 = 8.99, Total: 34.97
    expect(screen.getAllByText('$34.97')).toHaveLength(2); // Once in summary, once in total
  });

  it('should call onUpdateQuantity when increasing quantity', () => {
    renderCart();

    const increaseButtons = screen.getAllByLabelText(/Increase quantity/);
    fireEvent.click(increaseButtons[0]); // Increase pizza quantity

    expect(mockProps.onUpdateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('should call onUpdateQuantity when decreasing quantity', () => {
    renderCart();

    const decreaseButtons = screen.getAllByLabelText(/Decrease quantity/);
    fireEvent.click(decreaseButtons[0]); // Decrease pizza quantity

    expect(mockProps.onUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it('should disable decrease button when quantity is 1', () => {
    renderCart();

    const decreaseButtons = screen.getAllByLabelText(/Decrease quantity/);
    // Burger has quantity 1, so its decrease button should be disabled
    expect(decreaseButtons[1]).toBeDisabled();
  });

  it('should call onRemoveItem when remove button is clicked', () => {
    renderCart();

    const removeButtons = screen.getAllByLabelText(/Remove.*from cart/);
    fireEvent.click(removeButtons[0]);

    expect(mockProps.onRemoveItem).toHaveBeenCalledWith(1);
  });

  it('should call onCheckout when checkout button is clicked', () => {
    renderCart();

    const checkoutButton = screen.getByRole('button', { name: /Proceed to checkout/i });
    fireEvent.click(checkoutButton);

    expect(mockProps.onCheckout).toHaveBeenCalledTimes(1);
  });

  it('should call onContinueShopping when continue shopping is clicked', () => {
    renderCart();

    const continueButtons = screen.getAllByRole('button', { name: /Continue shopping/i });
    fireEvent.click(continueButtons[0]);

    expect(mockProps.onContinueShopping).toHaveBeenCalledTimes(1);
  });

  it('should display order summary with correct item count', () => {
    renderCart();

    expect(screen.getByText(/Total \(2 items\)/)).toBeInTheDocument();
  });

  it('should render empty cart state when cart is empty', () => {
    renderCart({ cart: [] });

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some delicious items to get started!')).toBeInTheDocument();
  });

  it('should show Browse Food button in empty cart state', () => {
    renderCart({ cart: [] });

    const browseButton = screen.getByRole('button', { name: /Browse Food/i });
    expect(browseButton).toBeInTheDocument();

    fireEvent.click(browseButton);
    expect(mockProps.onContinueShopping).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA labels for accessibility', () => {
    renderCart();

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('list', { name: 'Cart items' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Order summary' })).toBeInTheDocument();
  });

  it('should have ARIA labels on quantity controls', () => {
    renderCart();

    expect(screen.getByLabelText('Quantity controls for Pizza')).toBeInTheDocument();
    expect(screen.getByLabelText('Increase quantity of Pizza')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease quantity of Pizza')).toBeInTheDocument();
  });

  it('should have ARIA labels on remove buttons', () => {
    renderCart();

    expect(screen.getByLabelText('Remove Pizza from cart')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Burger from cart')).toBeInTheDocument();
  });

  it('should display item price per unit', () => {
    renderCart();

    expect(screen.getByText('$12.99 each')).toBeInTheDocument();
    expect(screen.getByText('$8.99 each')).toBeInTheDocument();
  });

  it('should render item images correctly', () => {
    renderCart();

    expect(screen.getByText('🍕')).toBeInTheDocument();
    expect(screen.getByText('🍔')).toBeInTheDocument();
  });

  it('should render HTTP image URLs as img elements', () => {
    const cartWithImageUrls = [
      {
        ...mockCartItems[0],
        image: 'https://example.com/pizza.jpg',
      },
    ];

    renderCart({ cart: cartWithImageUrls });

    const img = screen.getByRole('img', { name: 'Pizza' });
    expect(img).toHaveAttribute('src', 'https://example.com/pizza.jpg');
  });

  it('should display campus pickup notice', () => {
    renderCart();

    expect(screen.getByText(/Student-to-Student.*Campus pickup only/)).toBeInTheDocument();
  });

  it('should have focus management on main content', () => {
    renderCart();

    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('tabIndex', '-1');
  });

  it('should have focus rings on interactive elements', () => {
    renderCart();

    const checkoutButton = screen.getByRole('button', { name: /Proceed to checkout/i });
    expect(checkoutButton.className).toContain('focus:outline-none');
    expect(checkoutButton.className).toContain('focus:ring-2');
  });

  it('should display correct singular/plural item text', () => {
    const singleItemCart = [mockCartItems[0]];
    renderCart({ cart: singleItemCart });

    expect(screen.getByText(/Total \(1 item\)/)).toBeInTheDocument();
  });

  it('should render header and footer components', () => {
    renderCart();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
