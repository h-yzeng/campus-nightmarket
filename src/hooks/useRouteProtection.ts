import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteConfig } from '../utils/routeConfig';
import type { UserMode } from '../types';

/**
 * Hook to handle automatic mode syncing with routes
 *
 * This hook ensures that the user mode stays in sync with the current route
 * without forcing redirects or blocking navigation.
 *
 * @param currentMode - The current user mode
 * @param setUserMode - Function to update the user mode
 */
export const useRouteProtection = (
  currentMode: UserMode,
  setUserMode: (mode: UserMode) => void
) => {
  const location = useLocation();

  useEffect(() => {
    const config = getRouteConfig(location.pathname);

    if (!config || !config.defaultMode) return;

    // Sync mode with route default mode, but don't redirect
    // This ensures the mode reflects where the user is
    if (config.defaultMode !== currentMode) {
      setUserMode(config.defaultMode);
    }
  }, [location.pathname, currentMode, setUserMode]);
};
