import { Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Notification } from '../hooks/useNotifications';

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: (id: string) => void;
  onClearAll: () => void;
  permissionState?: NotificationPermission | 'unsupported';
  onRequestPermission?: () => void;
  isRequestingPermission?: boolean;
  onRefresh?: () => void;
}

const NotificationBell = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  onClearAll,
  permissionState = 'default',
  onRequestPermission,
  isRequestingPermission = false,
  onRefresh,
}: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if date is valid
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return 'Recently';
      }

      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 transition-colors hover:bg-[#252525]"
        type="button"
        aria-label={
          unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications (none unread)'
        }
      >
        <Bell size={24} className="text-[#B0B0B0]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#CC0000] text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 flex max-h-[500px] w-96 flex-col overflow-hidden rounded-xl border-2 border-[#3A3A3A] bg-[#252525] shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3A3A3A] p-4">
            <h3 className="font-semibold text-[#E0E0E0]">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-[#CC0000] hover:underline"
                    type="button"
                  >
                    Mark all read
                  </button>
                )}
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="text-xs text-[#888888] hover:text-[#E0E0E0]"
                    type="button"
                  >
                    Refresh
                  </button>
                )}
                <button
                  onClick={onClearAll}
                  className="text-xs text-[#888888] hover:text-[#E0E0E0]"
                  type="button"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {permissionState !== 'granted' && (
            <div
              className="flex items-start gap-3 border-b border-[#3A3A3A] bg-[#1F1F1F] p-4 text-sm text-[#E0E0E0]"
              role="status"
              aria-live="polite"
            >
              <div className="mt-0.5 text-lg">🔔</div>
              <div className="flex-1">
                <p className="font-semibold">
                  {permissionState === 'denied'
                    ? 'Notifications are blocked in your browser settings'
                    : permissionState === 'unsupported'
                      ? 'Notifications are not supported on this device'
                      : 'Enable notifications to get live order updates'}
                </p>
                {permissionState !== 'unsupported' && onRequestPermission && (
                  <button
                    type="button"
                    onClick={onRequestPermission}
                    disabled={isRequestingPermission}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#3A3A3A] px-3 py-1 text-xs font-semibold text-white transition hover:border-[#CC0000] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRequestingPermission ? 'Requesting…' : 'Enable notifications'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto mb-3 text-[#4A4A4A]" />
                <p className="text-[#888888]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-[#3A3A3A] p-4 transition-colors hover:bg-[#2A2A2A] ${
                    !notification.read ? 'bg-[#2A1A1A]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-[#CC0000]" />
                        )}
                        <h4 className="text-sm font-semibold text-[#E0E0E0]">
                          {notification.title}
                        </h4>
                      </div>
                      <p className="mb-2 text-sm text-[#B0B0B0]">{notification.body}</p>
                      <p className="text-xs text-[#888888]">{formatTime(notification.timestamp)}</p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-xs whitespace-nowrap text-[#CC0000] hover:underline"
                          type="button"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => onClear(notification.id)}
                        className="text-xs text-[#888888] hover:text-[#E0E0E0]"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
