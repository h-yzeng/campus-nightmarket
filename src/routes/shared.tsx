/**
 * Shared Routing Utilities
 *
 * Common components and helpers used across all route files.
 *
 * Components:
 * 1. RequireAuth:
 *    - Route guard for protected routes
 *    - Redirects to /login if not authenticated
 *    - Redirects to /verify-required if email not verified
 *    - Wraps children in error boundary and suspense
 *
 * 2. PageLoadingFallback:
 *    - Loading spinner for lazy-loaded routes
 *    - Full-screen centered spinner
 *    - Consistent UX across all page transitions
 *
 * Helpers:
 * 1. makeLogoToBrowse:
 *    - Creates handler for logo click → navigate to /browse
 *    - Scrolls to top on navigation
 *    - Used in headers across app
 *
 * 2. makeSignOutToHome:
 *    - Creates handler for signout → navigate to /
 *    - Calls handleSignOut then redirects
 *    - Used in headers and profile pages
 *
 * 3. useNavBasics:
 *    - Combines common navigation needs
 *    - Returns navigate, logoToBrowse, signOutToHome
 *    - Reduces boilerplate in route files
 *
 * Email Verification:
 * - Most routes require verified email
 * - Whitelisted emails bypass verification (for testing/development)
 * - Verification status checked in RequireAuth guard
 */

/* eslint-disable react-refresh/only-export-components */
import { Navigate, useNavigate } from 'react-router-dom';
import { Suspense, type ReactElement } from 'react';
import type { User } from 'firebase/auth';
import type { NavigateFunction } from 'react-router-dom';
import LoadingState from '../components/common/LoadingState';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';
import { shouldBypassVerification } from '../config/emailWhitelist';

export type NavigateFn = NavigateFunction;

// Loading fallback component for lazy loaded routes
export const PageLoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B]">
    <LoadingState variant="spinner" size="lg" text="Loading page..." />
  </div>
);

export const RequireAuth = ({
  children,
  user,
  loading,
  routeName,
}: {
  children: ReactElement;
  user: User | null;
  loading: boolean;
  routeName?: string;
}) => {
  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.email && !user.emailVerified && !shouldBypassVerification(user.email)) {
    return <Navigate to="/verify-required" replace />;
  }

  return (
    <RouteErrorBoundary routeName={routeName}>
      <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
    </RouteErrorBoundary>
  );
};

export const makeSignOutToHome =
  (navigate: NavigateFn, handleSignOut: () => Promise<void>) => () => {
    void (async () => {
      await handleSignOut();
      navigate('/');
    })();
  };

export const useNavBasics = (handleSignOut: () => Promise<void>) => {
  const navigate = useNavigate();
  const logoToBrowse = makeLogoToBrowse(navigate);
  const signOutToHome = makeSignOutToHome(navigate, handleSignOut);

  return { navigate, logoToBrowse, signOutToHome };
};

export const makeLogoToBrowse = (navigate: NavigateFn) => () => {
  navigate('/browse');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
