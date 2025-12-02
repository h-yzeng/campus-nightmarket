/**
 * Route configuration utility
 * Defines which routes are buyer-only, seller-only, or shared
 */

export type RouteType = 'buyer-only' | 'seller-only' | 'shared';

export interface RouteConfig {
  path: string;
  type: RouteType;
  defaultMode?: 'buyer' | 'seller';
}

/**
 * Route configurations
 * - buyer-only: Only accessible in buyer mode (shopping cart, checkout, orders, etc.)
 * - seller-only: Only accessible in seller mode (dashboard, create listing, etc.)
 * - shared: Accessible in both modes (home, login, signup, profile, etc.)
 */
export const ROUTE_CONFIGS: RouteConfig[] = [
  // Buyer-only routes
  { path: '/browse', type: 'buyer-only', defaultMode: 'buyer' },
  { path: '/cart', type: 'buyer-only', defaultMode: 'buyer' },
  { path: '/checkout', type: 'buyer-only', defaultMode: 'buyer' },
  { path: '/orders', type: 'buyer-only', defaultMode: 'buyer' },
  { path: '/orders/:orderId', type: 'buyer-only', defaultMode: 'buyer' },
  { path: '/seller/:sellerId', type: 'buyer-only', defaultMode: 'buyer' },

  // Seller-only routes
  { path: '/seller/dashboard', type: 'seller-only', defaultMode: 'seller' },
  { path: '/seller/listings/create', type: 'seller-only', defaultMode: 'seller' },
  { path: '/seller/listings/:listingId/edit', type: 'seller-only', defaultMode: 'seller' },
  { path: '/seller/listings', type: 'seller-only', defaultMode: 'seller' },
  { path: '/seller/orders', type: 'seller-only', defaultMode: 'seller' },

  // Shared routes (accessible in both modes)
  { path: '/', type: 'shared' },
  { path: '/login', type: 'shared' },
  { path: '/signup', type: 'shared' },
  { path: '/profile', type: 'shared' },
  { path: '/forgot-password', type: 'shared' },
];

/**
 * Get route config for a given path
 * Handles dynamic route parameters (e.g., /seller/:sellerId)
 */
export const getRouteConfig = (pathname: string): RouteConfig | undefined => {
  // First try exact match
  const exactMatch = ROUTE_CONFIGS.find((config) => config.path === pathname);
  if (exactMatch) return exactMatch;

  // Try pattern matching for dynamic routes
  return ROUTE_CONFIGS.find((config) => {
    const pattern = config.path
      .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
      .replace(/\//g, '\\/'); // Escape forward slashes
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
};

/**
 * Get the destination path when switching modes
 * Returns the appropriate path for the target mode
 */
export const getModeDestination = (mode: 'buyer' | 'seller'): string => {
  return mode === 'buyer' ? '/browse' : '/seller/dashboard';
};
