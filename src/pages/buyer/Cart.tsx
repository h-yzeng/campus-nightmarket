import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import type { UserMode,CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface CartProps {
  cart: CartItem[];
  profileData: ProfileData;
  userMode: UserMode;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onLogoClick?: () => void;
}

const Cart = ({
  cart,
  profileData,
  userMode,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  onSignOut,
  onProfileClick,
  onLogoClick
}: CartProps) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#040707]">
      <Header
        cartItems={cart}
        profileData={profileData}
        onCartClick={() => {}}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onLogoClick={onLogoClick}
        showCart={false}
        userMode={userMode}
      />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onContinueShopping}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-white">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16 bg-neutral-800 rounded-2xl shadow-md border-2 border-neutral-700">
            <div className="text-7xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={onContinueShopping}
              className="px-8 py-3 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 bg-[#CC0000]"
            >
              Browse Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-800 rounded-2xl shadow-md border-2 border-neutral-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="shrink-0 w-24 h-24 rounded-xl flex items-center justify-center bg-[#2A2A2A] border-2 border-[#3A3A3A] overflow-hidden">
                      {item.image.startsWith('http') ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl">{item.image}</span>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-[#E0E0E0] mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-[#B0B0B0] mb-1">
                        by {item.seller.split(' ')[0]}
                      </p>
                      <p className="text-sm text-[#888888] mb-3">
                        {item.location}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-[#4A4A4A] hover:border-[#CC0000] hover:bg-[#2A0A0A] transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            title="Decrease quantity"
                          >
                            <Minus size={16} className="text-[#E0E0E0]" />
                          </button>

                          <span className="w-12 text-center font-bold text-[#E0E0E0]">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-[#4A4A4A] hover:border-[#CC0000] hover:bg-[#2A0A0A] transition-colors"
                            title="Increase quantity"
                          >
                            <Plus size={16} className="text-[#E0E0E0]" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#CC0000]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-[#888888]">
                            ${item.price} each
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#2A0A0A] transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={20} className="text-[#888888] hover:text-[#CC0000]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-800 rounded-2xl shadow-md border-2 border-neutral-700 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-[#E0E0E0] mb-4 flex items-center gap-2">
                  <ShoppingBag size={20} />
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6 pb-6 border-b-2 border-[#3A3A3A]">
                  <div className="flex justify-between text-[#B0B0B0]">
                    <span>Total ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold text-[#E0E0E0]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-[#E0E0E0] mb-6">
                  <span>Total</span>
                  <span className="text-[#CC0000]">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 bg-[#CC0000] mb-3"
                >
                  Proceed to Checkout →
                </button>

                <button
                  onClick={onContinueShopping}
                  className="w-full py-3 text-[#CC0000] text-base font-semibold rounded-xl border-2 border-[#CC0000] hover:bg-[#2A0A0A] transition-colors"
                >
                  Continue Shopping
                </button>

                <div className="mt-6 p-4 bg-[#2A2A2A] rounded-xl border border-[#3A3A3A]">
                  <p className="text-xs text-[#A0A0A0] text-center">
                    🎓 Student-to-Student · Campus pickup only
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;