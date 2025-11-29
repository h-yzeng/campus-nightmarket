import { ShoppingCart, User, ChevronDown, LogOut, Package, Store, LayoutGrid } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';
import NotificationBell from './NotificationBell';
import { useNotificationStore } from '../stores';
import type { CartItem, ProfileData, UserMode } from '../types';

interface HeaderProps {
  cartItems: CartItem[];
  profileData: ProfileData;
  userMode: UserMode;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick?: () => void;
  onOrdersClick?: () => void;
  onModeChange?: (mode: UserMode) => void;
  onSellerDashboardClick?: () => void;
  onLogoClick?: () => void;
  showCart?: boolean;
}

const Header = ({
  cartItems,
  profileData,
  userMode,
  onCartClick,
  onSignOut,
  onProfileClick,
  onOrdersClick,
  onModeChange,
  onSellerDashboardClick,
  onLogoClick,
  showCart = false,
}: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get notifications from store
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const handlers = useNotificationStore((state) => state.handlers);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else if (onModeChange) {
      onModeChange('buyer');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#2A2A2A] bg-[#1A1A1B] shadow-sm transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CC0000]">
              <span className="text-2xl">🌙</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#CC0000]">Night Market</h1>
              <p className="text-xs text-[#B0B0B0]">Campus Late-Night Food Exchange</p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {onModeChange && (
              <div className="relative flex items-center rounded-xl bg-[#252525] p-1">
                <div
                  className={`absolute top-1 bottom-1 left-1 w-24 rounded-lg bg-[#3A3A3A] shadow-md transition-transform duration-300 ease-out ${
                    userMode === 'seller' ? 'translate-x-24' : 'translate-x-0'
                  }`}
                />

                <button
                  onClick={() => onModeChange('buyer')}
                  className={`relative z-10 flex w-24 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                    userMode === 'buyer' ? 'text-[#CC0000]' : 'text-[#888888] hover:text-[#B0B0B0]'
                  }`}
                  type="button"
                >
                  <ShoppingCart
                    size={16}
                    className={`transition-all duration-300 ${userMode === 'buyer' ? 'scale-110' : ''}`}
                  />
                  Buyer
                </button>
                <button
                  onClick={() => onModeChange('seller')}
                  className={`relative z-10 flex w-24 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                    userMode === 'seller' ? 'text-[#CC0000]' : 'text-[#888888] hover:text-[#B0B0B0]'
                  }`}
                  type="button"
                >
                  <Store
                    size={16}
                    className={`transition-all duration-300 ${userMode === 'seller' ? 'scale-110' : ''}`}
                  />
                  Seller
                </button>
              </div>
            )}

            {/* Notification Bell */}
            {handlers && (
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handlers.markAsRead}
                onMarkAllAsRead={handlers.markAllAsRead}
                onClear={handlers.clearNotification}
                onClearAll={handlers.clearAll}
              />
            )}

            {showCart && userMode === 'buyer' && (
              <button
                onClick={onCartClick}
                className="relative rounded-lg p-2 transition-colors hover:bg-[#252525]"
                title="Shopping Cart"
                type="button"
              >
                <ShoppingCart size={24} className="text-[#B0B0B0]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#CC0000] text-xs font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-[#252525]"
                type="button"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#E0E0E0]">
                    {profileData.firstName} {profileData.lastName}
                  </p>
                  <p className="text-xs text-[#888888]">{profileData.studentId}</p>
                </div>

                {profileData.photo ? (
                  <img
                    src={profileData.photo}
                    alt="Profile"
                    className="h-10 w-10 rounded-full border-2 border-[#3A3A3A] object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#3A3A3A] bg-[#252525]">
                    <User size={20} className="text-[#888888]" />
                  </div>
                )}

                <ChevronDown
                  size={18}
                  className={`text-[#888888] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-65 overflow-hidden rounded-xl border-2 border-[#3A3A3A] bg-[#252525] shadow-xl">
                  <div className="border-b border-[#3A3A3A] p-4">
                    <p className="font-semibold text-[#E0E0E0]">
                      {profileData.firstName} {profileData.lastName}
                    </p>
                    <p className="text-sm text-[#B0B0B0]">{profileData.email}</p>
                    <p className="mt-1 text-xs text-[#888888]">{profileData.studentId}</p>
                  </div>

                  {onProfileClick && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onProfileClick();
                      }}
                      className="flex w-full items-center gap-3 border-b border-[#3A3A3A] px-4 py-3 text-left font-medium text-[#E0E0E0] transition-colors hover:bg-[#3A3A3A]"
                      type="button"
                    >
                      <User size={18} />
                      <span>View Profile</span>
                    </button>
                  )}

                  {onSellerDashboardClick && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSellerDashboardClick();
                      }}
                      className="flex w-full items-center gap-3 border-b border-[#3A3A3A] px-4 py-3 text-left font-medium text-[#E0E0E0] transition-colors hover:bg-[#3A3A3A]"
                      type="button"
                    >
                      <LayoutGrid size={18} />
                      <span>Seller Dashboard</span>
                    </button>
                  )}

                  {onOrdersClick && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOrdersClick();
                      }}
                      className="flex w-full items-center gap-3 border-b border-[#3A3A3A] px-4 py-3 text-left font-medium text-[#E0E0E0] transition-colors hover:bg-[#3A3A3A]"
                      type="button"
                    >
                      <Package size={18} />
                      <span>My Orders</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left font-medium text-[#CC0000] transition-colors hover:bg-[#2A0A0A]"
                    type="button"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Memoize Header to prevent unnecessary re-renders
// Header re-renders frequently but often with the same props
export default memo(Header);
