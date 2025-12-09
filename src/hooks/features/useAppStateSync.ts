import { useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { ProfileData } from '../../types';
import type { Notification } from './useNotifications';
import { useAuthStore, useNotificationStore, useNavigationStore } from '../../stores';

interface SyncArgs {
  user: User | null;
  profileData: ProfileData;
  notifications: Notification[];
  unreadCount: number;
  handlers: {
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
  };
  permission: {
    permissionState: NotificationPermission | 'unsupported';
    isRequestingPermission: boolean;
    requestPermission?: () => Promise<void>;
    refreshNotifications?: () => Promise<void>;
  };
}

/**
 * Synchronize derived hook state into Zustand stores so components can consume without prop drilling.
 */
export const useAppStateSync = ({
  user,
  profileData,
  notifications,
  unreadCount,
  handlers,
  permission,
}: SyncArgs) => {
  const setUser = useAuthStore((state) => state.setUser);
  const setStoreProfileData = useAuthStore((state) => state.setProfileData);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const setNotificationHandlers = useNotificationStore((state) => state.setHandlers);
  const setPermissionState = useNotificationStore((state) => state.setPermissionState);
  const setPermissionControls = useNotificationStore((state) => state.setPermissionControls);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    setStoreProfileData(profileData);
  }, [profileData, setStoreProfileData]);

  useEffect(() => {
    setNotifications(notifications, unreadCount);
  }, [notifications, unreadCount, setNotifications]);

  useEffect(() => {
    setNotificationHandlers(handlers);
  }, [handlers, setNotificationHandlers]);

  useEffect(() => {
    setPermissionState(permission.permissionState);
    setPermissionControls({
      isRequestingPermission: permission.isRequestingPermission,
      requestPermission: permission.requestPermission,
      refreshNotifications: permission.refreshNotifications,
    });
  }, [permission, setPermissionControls, setPermissionState]);

  const clearAllAppState = () => {
    clearAuth();
    resetNavigation();
  };

  return { clearAllAppState };
};
