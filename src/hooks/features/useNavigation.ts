import { useState } from 'react';
import type { UserMode } from '../../types';

export type PageType =
  | 'home'
  | 'login'
  | 'signup'
  | 'browse'
  | 'profile'
  | 'viewProfile'
  | 'cart'
  | 'checkout'
  | 'userOrders'
  | 'orderDetails'
  | 'sellerDashboard'
  | 'createListing'
  | 'editListing'
  | 'sellerListings'
  | 'sellerOrders';

export const useNavigation = () => {
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [userMode, setUserMode] = useState<UserMode>('buyer');

  const handleModeChange = (mode: UserMode, setCurrentPage: (page: PageType) => void) => {
    setUserMode(mode);
    if (mode === 'buyer') {
      setCurrentPage('browse');
    } else {
      setCurrentPage('sellerDashboard');
    }
  };

  const handleViewProfile = (sellerId: string, setCurrentPage: (page: PageType) => void) => {
    setSelectedSellerId(sellerId);
    setCurrentPage('viewProfile');
  };

  const handleViewOrderDetails = (orderId: number, setCurrentPage: (page: PageType) => void) => {
    setSelectedOrderId(orderId);
    setCurrentPage('orderDetails');
  };

  const handleEditListing = (listingId: string, setCurrentPage: (page: PageType) => void) => {
    setSelectedListingId(listingId);
    setCurrentPage('editListing');
  };

  const handleBackToBrowse = (setCurrentPage: (page: PageType) => void) => {
    setCurrentPage('browse');
    setUserMode('buyer');
  };

  return {
    selectedSellerId,
    selectedOrderId,
    selectedListingId,
    userMode,
    setUserMode,
    handleModeChange,
    handleViewProfile,
    handleViewOrderDetails,
    handleEditListing,
    handleBackToBrowse,
  };
};
