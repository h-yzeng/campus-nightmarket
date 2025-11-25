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
}

const NotificationBell = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  onClearAll,
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

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#252525] rounded-lg transition-colors"
        type="button"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-[#B0B0B0]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full bg-[#CC0000]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#252525] rounded-xl shadow-xl border-2 border-[#3A3A3A] overflow-hidden max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#3A3A3A] flex items-center justify-between">
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

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="text-[#4A4A4A] mx-auto mb-3" />
                <p className="text-[#888888]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[#3A3A3A] hover:bg-[#2A2A2A] transition-colors ${
                    !notification.read ? 'bg-[#2A1A1A]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#CC0000]" />
                        )}
                        <h4 className="font-semibold text-[#E0E0E0] text-sm">
                          {notification.title}
                        </h4>
                      </div>
                      <p className="text-sm text-[#B0B0B0] mb-2">{notification.body}</p>
                      <p className="text-xs text-[#888888]">{formatTime(notification.timestamp)}</p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-xs text-[#CC0000] hover:underline whitespace-nowrap"
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
