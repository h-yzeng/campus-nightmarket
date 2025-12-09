import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../src/components/Header';
import type { CartItem, ProfileData } from '../../src/types';

// Mock NotificationBell component
jest.mock('../../src/components/NotificationBell', () => {
  return function MockNotificationBell() {
    return <div data-testid="notification-bell">Notifications</div>;
  };
});

// Mock Tooltip component
jest.mock('../../src/components/common/Tooltip', () => {
  return function MockTooltip({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});

// Mock stores
jest.mock('../../src/stores', () => ({
  useNotificationStore: jest.fn(() => ({
    notifications: [],
    unreadCount: 0,
    handlers: {
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      clearNotification: jest.fn(),
      clearAll: jest.fn(),
    },
    permissionState: 'default',
    isRequestingPermission: false,
    requestPermission: jest.fn(),
    refreshNotifications: jest.fn(),
  })),
}));

// Mock route config
jest.mock('../../src/utils/routeConfig', () => ({
  getRouteConfig: jest.fn(() => ({ type: 'shared' })),
}));

describe('Header', () => {
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
  ];

  const mockProfileData: ProfileData = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    studentId: 'STU123',
    bio: 'Test user bio',
    photo: null,
    isSeller: false,
  };

  const mockProps = {
    cartItems: mockCartItems,
    profileData: mockProfileData,
    userMode: 'buyer' as const,
    onCartClick: jest.fn(),
    onSignOut: jest.fn(),
    onProfileClick: jest.fn(),
    onOrdersClick: jest.fn(),
    onModeChange: jest.fn(),
    onSellerDashboardClick: jest.fn(),
    onLogoClick: jest.fn(),
    showCart: true,
    pendingOrdersCount: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHeader = (props = {}) =>
    render(
      <BrowserRouter>
        <Header {...mockProps} {...props} />
      </BrowserRouter>
    );

  it('should render header with logo', () => {
    renderHeader();

    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(screen.getByText('Night Market')).toBeInTheDocument();
  });

  it('should display cart with correct item count', () => {
    renderHeader();

    expect(screen.getByLabelText(/Shopping cart with 2 item/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should call onCartClick when cart button is clicked', () => {
    renderHeader();

    const cartButton = screen.getByLabelText(/Shopping cart/);
    fireEvent.click(cartButton);

    expect(mockProps.onCartClick).toHaveBeenCalledTimes(1);
  });

  it('should not show cart when showCart is false', () => {
    renderHeader({ showCart: false });

    expect(screen.queryByLabelText(/Shopping cart/)).not.toBeInTheDocument();
  });

  it('should display user name', () => {
    renderHeader();

    expect(screen.getByText('Jane S.')).toBeInTheDocument();
  });

  it('should open user dropdown menu when clicked', async () => {
    renderHeader();

    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('My Orders')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('should call onProfileClick when My Profile is clicked', async () => {
    renderHeader();

    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const profileButton = screen.getByText('My Profile');
      fireEvent.click(profileButton);
    });

    expect(mockProps.onProfileClick).toHaveBeenCalledTimes(1);
  });

  it('should call onOrdersClick when My Orders is clicked', async () => {
    renderHeader();

    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const ordersButton = screen.getByText('My Orders');
      fireEvent.click(ordersButton);
    });

    expect(mockProps.onOrdersClick).toHaveBeenCalledTimes(1);
  });

  it('should call onSignOut when Sign Out is clicked', async () => {
    renderHeader();

    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);
    });

    expect(mockProps.onSignOut).toHaveBeenCalledTimes(1);
  });

  it('should show mode switcher when user has both buyer and seller account types', () => {
    const bothAccountsProfile = {
      ...mockProfileData,
      accountType: 'both' as const,
    };

    renderHeader({ profileData: bothAccountsProfile });

    expect(screen.getByLabelText('Switch to buyer mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to seller mode')).toBeInTheDocument();
  });

  it('should highlight active mode in mode switcher', () => {
    const bothAccountsProfile = {
      ...mockProfileData,
      accountType: 'both' as const,
    };

    renderHeader({ profileData: bothAccountsProfile, userMode: 'buyer' });

    const buyerButton = screen.getByLabelText('Switch to buyer mode');
    expect(buyerButton).toHaveClass('bg-[#CC0000]');
  });

  it('should call onModeChange when switching modes', () => {
    const bothAccountsProfile = {
      ...mockProfileData,
      accountType: 'both' as const,
    };

    renderHeader({ profileData: bothAccountsProfile, userMode: 'buyer' });

    const sellerButton = screen.getByLabelText('Switch to seller mode');
    fireEvent.click(sellerButton);

    expect(mockProps.onModeChange).toHaveBeenCalledWith('seller');
  });

  it('should call onLogoClick when logo is clicked', () => {
    renderHeader();

    const logo = screen.getByLabelText('Go to Night Market home page');
    fireEvent.click(logo);

    expect(mockProps.onLogoClick).toHaveBeenCalledTimes(1);
  });

  it('should display pending orders count for sellers', () => {
    const sellerProfile = {
      ...mockProfileData,
      accountType: 'seller' as const,
    };

    renderHeader({ profileData: sellerProfile, userMode: 'seller', pendingOrdersCount: 5 });

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    renderHeader();

    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });

    // Click outside the dropdown
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
    });
  });

  it('should render notification bell component', () => {
    renderHeader();

    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('should have proper ARIA labels for accessibility', () => {
    renderHeader();

    expect(screen.getByLabelText('Go to Night Market home page')).toBeInTheDocument();
    expect(screen.getByLabelText(/Shopping cart with/)).toBeInTheDocument();
    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('should show seller dashboard link for sellers in dropdown', async () => {
    const sellerProfile = {
      ...mockProfileData,
      accountType: 'seller' as const,
    };

    renderHeader({ profileData: sellerProfile, userMode: 'seller' });

    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
    });
  });

  it('should call onSellerDashboardClick when dashboard link is clicked', async () => {
    const sellerProfile = {
      ...mockProfileData,
      accountType: 'seller' as const,
    };

    renderHeader({ profileData: sellerProfile, userMode: 'seller' });

    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const dashboardButton = screen.getByText('Seller Dashboard');
      fireEvent.click(dashboardButton);
    });

    expect(mockProps.onSellerDashboardClick).toHaveBeenCalledTimes(1);
  });
});
