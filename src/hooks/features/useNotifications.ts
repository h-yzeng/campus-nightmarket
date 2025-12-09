import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  requestNotificationPermission,
  onForegroundMessage,
  saveFCMToken,
  removeFCMToken,
} from '../../services/notifications/notificationService';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '../../utils/logger';
import { useNotificationStore } from '../../stores';

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
  const isMountedRef = useRef(true);
  const permissionRequestRef = useRef<Promise<void> | null>(null);
  const persistedNotifications = useNotificationStore((state) => state.notifications);
  const setNotificationStore = useNotificationStore((state) => state.setNotifications);

  // Ensure timestamps are Date objects (migration for corrupted data)
  const safeNotifications = useMemo(() => {
    return persistedNotifications.map((notification) => ({
      ...notification,
      timestamp:
        notification.timestamp instanceof Date
          ? notification.timestamp
          : new Date(notification.timestamp),
    }));
  }, [persistedNotifications]);

  const [notifications, setNotifications] = useState<Notification[]>(safeNotifications);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<void> => {
    if (!userId || typeof Notification === 'undefined') return;
    if (permissionRequestRef.current) return permissionRequestRef.current;

    setIsRequestingPermission(true);

    const permissionPromise = (async () => {
      try {
        const token = await requestNotificationPermission();

        if (!isMountedRef.current) return;

        setPermissionState(Notification.permission);

        if (token) {
          setHasPermission(true);
          await saveFCMToken(userId, token);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          logger.error('Notification permission request failed', err);
          setHasPermission(false);
        }
      } finally {
        if (isMountedRef.current) {
          setIsRequestingPermission(false);
        }
        permissionRequestRef.current = null;
      }
    })();

    permissionRequestRef.current = permissionPromise;
    return permissionPromise;
  }, [userId]);

  // Request permission and save token when already granted
  useEffect(() => {
    if (!userId) return undefined;
    if (typeof Notification === 'undefined') {
      setPermissionState('unsupported');
      setHasPermission(false);
      return undefined;
    }

    setPermissionState(Notification.permission);

    const syncGrantedPermission = async () => {
      if (Notification.permission !== 'granted') {
        setHasPermission(false);
        return;
      }

      await requestPermission();
    };

    void syncGrantedPermission();

    // Clean up on unmount or user change
    return () => {
      removeFCMToken(userId).catch((err) => logger.error(err));
    };
  }, [requestPermission, userId]);

  // Listen for foreground messages
  useEffect(() => {
    if (!hasPermission) return undefined;

    const unsubscribe = onForegroundMessage((payload) => {
      logger.general('Received foreground notification:', payload);

      const fcmPayload = payload as FCMPayload;

      const newNotification: Notification = {
        id: Date.now().toString(),
        title: fcmPayload.notification?.title || 'Notification',
        body: fcmPayload.notification?.body || '',
        data: fcmPayload.data,
        timestamp: new Date(),
        read: false,
      };

      if (isMountedRef.current) {
        setNotifications((prev) => [newNotification, ...prev]);
      }

      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.body,
          icon: '/icon.png',
          tag: newNotification.id,
        });
      }

      if (fcmPayload.data?.type === 'order_update' || fcmPayload.data?.type === 'new_order') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    });

    return unsubscribe;
  }, [hasPermission, queryClient]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sync notification state into the store for persistence/hydration
  useEffect(() => {
    setNotificationStore(notifications, unreadCount);
  }, [notifications, unreadCount, setNotificationStore]);

  const refreshNotifications = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  const handlers = useMemo(
    () => ({ markAsRead, markAllAsRead, clearNotification, clearAll, refreshNotifications }),
    [markAsRead, markAllAsRead, clearNotification, clearAll, refreshNotifications]
  );

  return {
    notifications,
    unreadCount,
    hasPermission,
    permissionState,
    isRequestingPermission,
    requestPermission,
    ...handlers,
  };
};
