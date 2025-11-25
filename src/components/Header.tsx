import { ShoppingCart, User, ChevronDown, LogOut, Package, Store, LayoutGrid } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
  showCart = false 
}: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-[#1A1A1B] border-b-2 border-[#2A2A2A] shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            type="button"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#CC0000]">
              <span className="text-2xl">🌙</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#CC0000]">Night Market</h1>
              <p className="text-xs text-[#B0B0B0]">Campus Late-Night Food Exchange</p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {onModeChange && (
              <div className="relative flex items-center bg-[#252525] rounded-xl p-1">
                <div
                  className={`absolute top-1 bottom-1 left-1 w-24 bg-[#3A3A3A] rounded-lg shadow-md transition-transform duration-300 ease-out ${
                    userMode === 'seller' ? 'translate-x-24' : 'translate-x-0'
                  }`}
                />

                <button
                  onClick={() => onModeChange('buyer')}
                  className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 w-24 ${
                    userMode === 'buyer'
                      ? 'text-[#CC0000]'
                      : 'text-[#888888] hover:text-[#B0B0B0]'
                  }`}
                  type="button"
                >
                  <ShoppingCart size={16} className={`transition-all duration-300 ${userMode === 'buyer' ? 'scale-110' : ''}`} />
                  Buyer
                </button>
                <button
                  onClick={() => onModeChange('seller')}
                  className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 w-24 ${
                    userMode === 'seller'
                      ? 'text-[#CC0000]'
                      : 'text-[#888888] hover:text-[#B0B0B0]'
                  }`}
                  type="button"
                >
                  <Store size={16} className={`transition-all duration-300 ${userMode === 'seller' ? 'scale-110' : ''}`} />
                  Seller
                </button>
              </div>
            )}

            {showCart && userMode === 'buyer' && (
              <button
                onClick={onCartClick}
                className="relative p-2 hover:bg-[#252525] rounded-lg transition-colors"
                title="Shopping Cart"
                type="button"
              >
                <ShoppingCart size={24} className="text-[#B0B0B0]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full bg-[#CC0000]">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#252525] rounded-lg transition-colors"
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
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#3A3A3A]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#3A3A3A] bg-[#252525]">
                    <User size={20} className="text-[#888888]" />
                  </div>
                )}

                <ChevronDown
                  size={18}
                  className={`text-[#888888] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-65 bg-[#252525] rounded-xl shadow-xl border-2 border-[#3A3A3A] overflow-hidden">
                  <div className="p-4 border-b border-[#3A3A3A]">
                    <p className="font-semibold text-[#E0E0E0]">
                      {profileData.firstName} {profileData.lastName}
                    </p>
                    <p className="text-sm text-[#B0B0B0]">{profileData.email}</p>
                    <p className="text-xs text-[#888888] mt-1">{profileData.studentId}</p>
                  </div>

                  {onProfileClick && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onProfileClick();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#3A3A3A] transition-colors text-[#E0E0E0] font-medium border-b border-[#3A3A3A]"
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#3A3A3A] transition-colors text-[#E0E0E0] font-medium border-b border-[#3A3A3A]"
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#3A3A3A] transition-colors text-[#E0E0E0] font-medium border-b border-[#3A3A3A]"
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#2A0A0A] transition-colors text-[#CC0000] font-medium"
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

export default Header;