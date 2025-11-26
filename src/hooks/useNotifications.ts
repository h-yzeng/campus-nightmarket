import { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  onForegroundMessage,
  saveFCMToken,
  removeFCMToken,
} from '../services/notifications/notificationService';
import { useQueryClient } from '@tanstack/react-query';

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

  // Request permission and save token
  useEffect(() => {
    if (!userId) return;

    const setupNotifications = async () => {
      const token = await requestNotificationPermission();

      if (token) {
        setHasPermission(true);
        await saveFCMToken(userId, token);
      }
    };

    setupNotifications();

    // Clean up on unmount or user change
    return () => {
      if (userId) {
        removeFCMToken(userId).catch(console.error);
      }
    };
  }, [userId]);

  // Listen for foreground messages
  useEffect(() => {
    if (!hasPermission) return;

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Received foreground notification:', payload);

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

  return {
    notifications,
    unreadCount,
    hasPermission,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  };
};
