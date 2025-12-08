import { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  onForegroundMessage,
  saveFCMToken,
  removeFCMToken,
} from '../services/notifications/notificationService';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '../utils/logger';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  read: boolean;
}

interface FCMPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

export const useNotifications = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const requestPermission = async () => {
    if (!userId || typeof Notification === 'undefined') return;
    setIsRequestingPermission(true);

    try {
      const token = await requestNotificationPermission();
      setPermissionState(Notification.permission);

      if (token) {
        setHasPermission(true);
        await saveFCMToken(userId, token);
      } else {
        setHasPermission(false);
      }
    } catch (err) {
      logger.error('Notification permission request failed', err);
      setHasPermission(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Request permission and save token when already granted
  useEffect(() => {
    if (!userId) return;
    if (typeof Notification === 'undefined') {
      setPermissionState('unsupported');
      setHasPermission(false);
      return;
    }

    setPermissionState(Notification.permission);

    const syncGrantedPermission = async () => {
      if (Notification.permission !== 'granted') {
        setHasPermission(false);
        return;
      }

      const token = await requestNotificationPermission();
      if (token) {
        setHasPermission(true);
        await saveFCMToken(userId, token);
      }
    };

    void syncGrantedPermission();

    // Clean up on unmount or user change
    return () => {
      if (userId) {
        removeFCMToken(userId).catch((err) => logger.error(err));
      }
    };
  }, [userId]);

  // Listen for foreground messages
  useEffect(() => {
    if (!hasPermission) return;

    const unsubscribe = onForegroundMessage((payload) => {
      logger.general('Received foreground notification:', payload);

      // Cast payload to FCMPayload type
      const fcmPayload = payload as FCMPayload;

      // Add notification to list
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: fcmPayload.notification?.title || 'Notification',
        body: fcmPayload.notification?.body || '',
        data: fcmPayload.data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.body,
          icon: '/icon.png',
          tag: newNotification.id,
        });
      }

      // Invalidate relevant queries based on notification type
      if (fcmPayload.data?.type === 'order_update' || fcmPayload.data?.type === 'new_order') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    });

    return unsubscribe;
  }, [hasPermission, queryClient]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refreshNotifications = async () => {
    await requestPermission();
  };

  return {
    notifications,
    unreadCount,
    hasPermission,
    permissionState,
    isRequestingPermission,
    requestPermission,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  };
};
