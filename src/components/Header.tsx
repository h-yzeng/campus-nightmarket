import { ShoppingCart, User } from 'lucide-react';
import type { CartItem, ProfileData } from '../types';

interface HeaderProps {
  cartItems: CartItem[];
  profileData: ProfileData;
  onCartClick: () => void;
  showCart?: boolean;
}

const Header = ({ 
  cartItems, 
  profileData, 
  onCartClick,
  showCart = false 
}: HeaderProps) => {
  const cartCount = cartItems.length;
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-[#CC0000]">
              🌙
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#CC0000]">
                Night Market
              </h1>
              <p className="text-xs text-gray-500">
                Campus Late-Night Food Exchange
              </p>
            </div>
          </div>

          {/* User Info and Cart */}
          <div className="flex items-center gap-6">
            {profileData.firstName && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profileData.studentId}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F5F5F5]">
                  <User size={20} className="text-[#CC0000]" />
                </div>
              </div>
            )}

            {showCart && (
              <button
                onClick={onCartClick}
                className={`relative flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all hover:shadow-md ${
                  cartCount > 0 
                    ? 'border-[#CC0000] bg-[#FFF5F5]' 
                    : 'border-[#E0E0E0] bg-white'
                }`}
              >
                <ShoppingCart 
                  size={24} 
                  className={cartCount > 0 ? 'text-[#CC0000]' : 'text-[#76777B]'}
                />
                {cartCount > 0 && (
                  <>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-600">Cart</span>
                      <span className="text-sm font-bold text-[#CC0000]">
                        {cartCount} items • ${totalPrice}
                      </span>
                    </div>
                    <span className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md bg-[#FF9900]">
                      {cartCount}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;