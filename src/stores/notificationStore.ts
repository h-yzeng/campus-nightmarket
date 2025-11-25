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
  setNotifications: (notifications: Notification[], unreadCount: number) => void;
  setHandlers: (handlers: NotificationHandlers) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  handlers: null,
  setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount }),
  setHandlers: (handlers) => set({ handlers }),
}));
