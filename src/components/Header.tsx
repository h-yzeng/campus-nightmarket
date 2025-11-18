import { ShoppingCart, User, ChevronDown, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { CartItem, ProfileData } from '../types';

interface HeaderProps {
  cartItems: CartItem[];
  profileData: ProfileData;
  onCartClick: () => void;
  onSignOut: () => void;
  onProfileClick?: () => void;
  showCart?: boolean;
}

const Header = ({ 
  cartItems, 
  profileData, 
  onCartClick, 
  onSignOut,
  onProfileClick,
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

  return (
    <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#CC0000]">
              <span className="text-2xl">🌙</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#CC0000]">Night Market</h1>
              <p className="text-xs text-gray-600">Campus Late-Night Food Exchange</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showCart && (
              <button
                onClick={onCartClick}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Shopping Cart"
              >
                <ShoppingCart size={24} className="text-gray-700" />
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
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{profileData.studentId}</p>
                </div>
                
                {profileData.photo ? (
                  <img 
                    src={profileData.photo} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-200 bg-gray-100">
                    <User size={20} className="text-gray-600" />
                  </div>
                )}
                
                <ChevronDown 
                  size={18} 
                  className={`text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-65 bg-white rounded-xl shadow-xl border-2 border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">
                      {profileData.firstName} {profileData.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{profileData.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{profileData.studentId}</p>
                  </div>
                  
                  {onProfileClick && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onProfileClick();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-900 font-medium border-b border-gray-100"
                    >
                      <User size={18} />
                      <span>View Profile</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors text-[#CC0000] font-medium"
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