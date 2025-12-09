import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { renderSellerRoutes } from '../../src/routes/sellerRoutes';
import { useAuthStore } from '../../src/stores/authStore';
import { useNavigationStore } from '../../src/stores/navigationStore';
import { useCartStore } from '../../src/stores/cartStore';
import type { AppRoutesProps } from '../../src/routes/types';
import type { ProfileData } from '../../src/types';
import type { User } from 'firebase/auth';

jest.mock('../../src/pages/seller/SellerDashboard', () => () => <div>Seller Dashboard</div>);
jest.mock('../../src/pages/seller/CreateListing', () => () => <div>Create Listing</div>);
jest.mock('../../src/pages/seller/EditListing', () => () => <div>Edit Listing</div>);
jest.mock('../../src/pages/seller/SellerListings', () => () => <div>Seller Listings</div>);
jest.mock('../../src/pages/seller/SellerOrders', () => () => <div>Seller Orders</div>);

jest.mock('../../src/hooks/queries/useListingsQuery', () => ({
  useSellerListingsQuery: jest.fn(() => ({ data: [], isLoading: false })),
}));

jest.mock('../../src/hooks/queries/useOrdersQuery', () => ({
  useSellerOrdersQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    refetch: jest.fn(),
    isFetching: false,
  })),
}));

jest.mock('../../src/hooks/queries/useReviewsQuery', () => ({
  useOrderReviewsQuery: jest.fn(() => ({})),
}));

const baseProfile: ProfileData = {
  email: 'user@example.com',
  firstName: 'Test',
  lastName: 'User',
  studentId: '12345',
  bio: '',
  photo: null,
  isSeller: false,
};

const defaultProps: AppRoutesProps = {
  setProfileData: jest.fn(),
  addToCart: jest.fn(),
  updateCartQuantity: jest.fn(),
  removeFromCart: jest.fn(),
  handleCreateProfile: jest.fn(async () => {}),
  handleLogin: jest.fn(async () => true),
  handleSaveProfile: jest.fn(async () => {}),
  handleSignOut: jest.fn(async () => {}),
  handlePlaceOrder: jest.fn(async () => {}),
  handleCancelOrder: jest.fn(async () => {}),
  handleUpdateOrderStatus: jest.fn(async () => {}),
  handleSubmitReview: jest.fn(async () => {}),
  handleCreateListing: jest.fn(async () => {}),
  handleToggleAvailability: jest.fn(),
  handleDeleteListing: jest.fn(),
  handleUpdateListing: jest.fn(async () => {}),
  handleResendVerification: jest.fn(async () => {}),
  handleReloadUser: jest.fn(async () => {}),
  authLoading: false,
};

const resetStores = () => {
  jest.clearAllMocks();
  useAuthStore.getState().clearAuth();
  useNavigationStore.getState().resetNavigation();
  useCartStore.setState({ cart: [] });
  localStorage.clear();
  sessionStorage.clear();
};

const makeUser = (uid: string): User => ({ uid }) as unknown as User;

const renderAt = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {renderSellerRoutes(defaultProps, useAuthStore.getState().user)}
        <Route path="/browse" element={<div>Browse Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Seller route role enforcement', () => {
  beforeEach(() => {
    resetStores();
  });

  it('allows all logged-in users to access seller routes', async () => {
    useAuthStore.setState({ user: makeUser('user-1'), profileData: baseProfile });

    renderAt('/seller/dashboard');

    expect(await screen.findByText('Seller Dashboard')).toBeInTheDocument();
  });

  it('allows sellers to access seller routes', async () => {
    useAuthStore.setState({
      user: makeUser('seller-1'),
      profileData: { ...baseProfile, isSeller: true },
    });

    renderAt('/seller/dashboard');

    expect(await screen.findByText('Seller Dashboard')).toBeInTheDocument();
  });
});
