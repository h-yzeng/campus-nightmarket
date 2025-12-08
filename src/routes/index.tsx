import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { renderPublicRoutes } from './publicRoutes';
import { renderAuthRoutes } from './authRoutes';
import { renderBuyerRoutes } from './buyerRoutes';
import { renderSellerRoutes } from './sellerRoutes';
import { PageLoadingFallback } from './shared';
import type { AppRoutesProps } from './types';
export { RequireAuth } from './shared';

export const AppRoutes = (props: AppRoutesProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {renderPublicRoutes()}
        {renderAuthRoutes(props)}
        {renderBuyerRoutes(props, user)}
        {renderSellerRoutes(props, user)}
        <Route path="*" element={<Navigate to={user ? '/browse' : '/'} replace />} />
      </Routes>
    </Suspense>
  );
};
