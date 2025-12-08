import { create } from 'zustand';
import type { Notification } from '../hooks/useNotifications';

interface NotificationHandlers {
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  handlers: NotificationHandlers | null;
  permissionState: NotificationPermission | 'unsupported';
  isRequestingPermission: boolean;
  requestPermission?: () => Promise<void>;
  refreshNotifications?: () => Promise<void>;
  setNotifications: (notifications: Notification[], unreadCount: number) => void;
  setHandlers: (handlers: NotificationHandlers) => void;
  setPermissionState: (permissionState: NotificationState['permissionState']) => void;
  setPermissionControls: (
    controls: Pick<
      NotificationState,
      'isRequestingPermission' | 'requestPermission' | 'refreshNotifications'
    >
  ) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  handlers: null,
  permissionState: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
  isRequestingPermission: false,
  requestPermission: undefined,
  refreshNotifications: undefined,
  setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount }),
  setHandlers: (handlers) => set({ handlers }),
  setPermissionState: (permissionState) => set({ permissionState }),
  setPermissionControls: (controls) => set(controls),
}));
