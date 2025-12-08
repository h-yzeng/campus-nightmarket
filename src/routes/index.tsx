import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { renderPublicRoutes } from './publicRoutes';
import { renderAuthRoutes } from './authRoutes';
import { renderBuyerRoutes } from './buyerRoutes';
import { renderSellerRoutes } from './sellerRoutes';
import type { AppRoutesProps } from './types';
export { RequireAuth } from './shared';

export const AppRoutes = (props: AppRoutesProps) => {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;

    void Promise.all([
      import('../pages/buyer/Browse'),
      import('../pages/buyer/Cart'),
      import('../pages/buyer/Checkout'),
      import('../pages/buyer/UserOrders'),
      import('../pages/seller/SellerDashboard'),
    ]);
  }, [user]);

  return (
    <Routes>
      {renderPublicRoutes()}
      {renderAuthRoutes(props)}
      {renderBuyerRoutes(props, user)}
      {renderSellerRoutes(props, user)}
      <Route path="*" element={<Navigate to={user ? '/browse' : '/'} replace />} />
    </Routes>
  );
};
