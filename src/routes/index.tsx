import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { renderPublicRoutes } from './publicRoutes';
import { renderAuthRoutes } from './authRoutes';
import { renderBuyerRoutes } from './buyerRoutes';
import { renderSellerRoutes } from './sellerRoutes';
import { PageLoadingFallback } from './shared';
import type { AppRoutesProps } from './types';
export { RequireAuth } from './shared';

const NotFound = lazy(() => import('../pages/shared/NotFound'));

export const AppRoutes = (props: AppRoutesProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {renderPublicRoutes()}
        {renderAuthRoutes(props)}
        {renderBuyerRoutes(props, user)}
        {renderSellerRoutes(props, user)}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
