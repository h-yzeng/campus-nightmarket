import { ShoppingCart, User, ChevronDown, LogOut, Package, Store, LayoutGrid } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';
import { useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import Tooltip from './common/Tooltip';
import { useNotificationStore } from '../stores';
import { getRouteConfig } from '../utils/routeConfig';
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
  onShowSellerOnboarding?: () => void;
  onSellerDashboardClick?: () => void;
  onLogoClick?: () => void;
  showCart?: boolean;
  pendingOrdersCount?: number;
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
  onShowSellerOnboarding,
  onSellerDashboardClick,
  onLogoClick,
  showCart = false,
  pendingOrdersCount = 0,
}: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<UserMode | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Get notifications from store
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const handlers = useNotificationStore((state) => state.handlers);
  const permissionState = useNotificationStore((state) => state.permissionState);
  const isRequestingPermission = useNotificationStore((state) => state.isRequestingPermission);
  const requestPermission = useNotificationStore((state) => state.requestPermission);
  const refreshNotifications = useNotificationStore((state) => state.refreshNotifications);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Get current route config
  const routeConfig = getRouteConfig(location.pathname);
  const isOnBuyerOnlyPage = routeConfig?.type === 'buyer-only';
  const isOnSellerOnlyPage = routeConfig?.type === 'seller-only';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (confirmDialogRef.current && !confirmDialogRef.current.contains(event.target as Node)) {
        setShowModeConfirm(false);
        setPendingMode(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeChangeClick = (mode: UserMode) => {
    if (!onModeChange) return;

    // If already in this mode, do nothing
    if (mode === userMode) return;

    // If switching to seller mode and user is not a seller yet, show onboarding
    if (mode === 'seller' && !profileData.isSeller && onShowSellerOnboarding) {
      onShowSellerOnboarding();
      return;
    }

    // Check if we need confirmation
    const needsConfirmation =
      (mode === 'seller' && isOnBuyerOnlyPage) || (mode === 'buyer' && isOnSellerOnlyPage);

    if (needsConfirmation) {
      setPendingMode(mode);
      setShowModeConfirm(true);
    } else {
      // No confirmation needed, switch directly
      onModeChange(mode);
    }
  };

  const handleConfirmModeChange = () => {
    if (pendingMode && onModeChange) {
      onModeChange(pendingMode);
    }
    setShowModeConfirm(false);
    setPendingMode(null);
  };

  const handleCancelModeChange = () => {
    setShowModeConfirm(false);
    setPendingMode(null);
  };

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
            aria-label="Go to Night Market home page"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CC0000] md:h-11 md:w-11">
              <span className="text-xl leading-none md:text-2xl">🌙</span>
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-[#CC0000] md:text-xl">Night Market</h1>
              <p className="text-[11px] text-[#B0B0B0] md:text-xs">
                Campus Late-Night Food Exchange
              </p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {onModeChange && (
              <div className="flex items-center gap-2">
                <div className="relative flex items-center rounded-xl bg-[#252525] p-1">
                  <div
                    className={`absolute top-1 bottom-1 left-1 w-24 rounded-lg bg-[#3A3A3A] shadow-md transition-transform duration-300 ease-out ${
                      userMode === 'seller' ? 'translate-x-24' : 'translate-x-0'
                    }`}
                  />

                  <button
                    onClick={() => handleModeChangeClick('buyer')}
                    disabled={userMode === 'buyer'}
                    className={`relative z-10 flex w-24 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      userMode === 'buyer'
                        ? 'cursor-default text-[#CC0000]'
                        : 'cursor-pointer text-[#888888] hover:text-[#B0B0B0]'
                    }`}
                    type="button"
                    aria-label="Switch to buyer mode"
                    title="Switch to Buyer mode to browse and order food"
                  >
                    <ShoppingCart
                      size={16}
                      className={`transition-all duration-300 ${userMode === 'buyer' ? 'scale-110' : ''}`}
                    />
                    Buyer
                  </button>
                  <button
                    onClick={() => handleModeChangeClick('seller')}
                    disabled={userMode === 'seller'}
                    className={`relative z-10 flex w-24 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      userMode === 'seller'
                        ? 'cursor-default text-[#CC0000]'
                        : 'cursor-pointer text-[#888888] hover:text-[#B0B0B0]'
                    }`}
                    type="button"
                    aria-label="Switch to seller mode"
                    title="Switch to Seller mode to create listings and manage orders"
                  >
                    <Store
                      size={16}
                      className={`transition-all duration-300 ${userMode === 'seller' ? 'scale-110' : ''}`}
                    />
                    Seller
                  </button>
                </div>
                <Tooltip content="Toggle between buying food and selling food" position="bottom" />
              </div>
            )}

            {/* Mode Switch Confirmation Dialog */}
            {showModeConfirm && (
              <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div
                  ref={confirmDialogRef}
                  className="mx-4 w-full max-w-md rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-2xl"
                >
                  <h3 className="mb-3 text-xl font-bold text-[#E0E0E0]">
                    Switch to {pendingMode === 'buyer' ? 'Buyer' : 'Seller'} Mode?
                  </h3>
                  <p className="mb-6 text-sm text-[#B0B0B0]">
                    {pendingMode === 'buyer'
                      ? "You'll be redirected to the Browse page to shop for food items."
                      : "You'll be redirected to the Seller Dashboard to manage your listings."}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelModeChange}
                      className="flex-1 rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-2.5 font-semibold text-[#E0E0E0] transition-colors hover:bg-[#2A2A2A]"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmModeChange}
                      className="flex-1 rounded-xl bg-[#CC0000] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#B00000]"
                      type="button"
                    >
                      Switch Mode
                    </button>
                  </div>
                </div>
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
                permissionState={permissionState}
                onRequestPermission={requestPermission}
                isRequestingPermission={isRequestingPermission}
                onRefresh={refreshNotifications}
              />
            )}

            {showCart && userMode === 'buyer' && (
              <button
                onClick={onCartClick}
                className="relative rounded-lg p-2 transition-colors hover:bg-[#252525]"
                aria-label={`Shopping cart with ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
                type="button"
              >
                <ShoppingCart size={24} className="text-[#B0B0B0]" aria-hidden="true" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#CC0000] text-xs font-bold text-white"
                    aria-hidden="true"
                  >
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
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
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
                    loading="lazy"
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
                <div
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border-2 border-[#3A3A3A] bg-[#252525] shadow-xl"
                  role="menu"
                  aria-label="User account menu"
                >
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
                      {userMode === 'seller' && pendingOrdersCount > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#CC0000] text-xs font-bold text-white">
                          {pendingOrdersCount}
                        </span>
                      )}
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
                      {userMode === 'seller' && pendingOrdersCount > 0 && (
                        <span className="ml-auto flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-[#CC0000] text-xs font-bold text-white">
                          {pendingOrdersCount}
                        </span>
                      )}
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
