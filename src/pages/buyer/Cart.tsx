import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import type { UserMode, CartItem, ProfileData } from '../../types';
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
  onOrdersClick?: () => void;
  onModeChange?: (mode: UserMode) => void;
  onSellerDashboardClick?: () => void;
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
  onOrdersClick,
  onModeChange,
  onSellerDashboardClick,
  onLogoClick,
}: CartProps) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#040707]">
      <Header
        cartItems={cart}
        profileData={profileData}
        onCartClick={() => {}}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onOrdersClick={onOrdersClick}
        onModeChange={onModeChange}
        onSellerDashboardClick={onSellerDashboardClick}
        onLogoClick={onLogoClick}
        showCart={false}
        userMode={userMode}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onContinueShopping}
            className="flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-white">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 py-16 text-center shadow-md">
            <div className="mb-4 text-7xl">🛒</div>
            <h2 className="mb-2 text-2xl font-bold text-white">Your cart is empty</h2>
            <p className="mb-6 text-gray-400">Add some delicious items to get started!</p>
            <button
              onClick={onContinueShopping}
              className="transform rounded-xl bg-[#CC0000] px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Browse Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A]">
                      {item.image.startsWith('http') ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl">{item.image}</span>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-lg font-bold text-[#E0E0E0]">{item.name}</h3>
                      <p className="mb-1 text-sm text-[#B0B0B0]">by {item.seller.split(' ')[0]}</p>
                      <p className="mb-3 text-sm text-[#888888]">{item.location}</p>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#4A4A4A] transition-colors hover:border-[#CC0000] hover:bg-[#2A0A0A] disabled:opacity-50"
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
                            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#4A4A4A] transition-colors hover:border-[#CC0000] hover:bg-[#2A0A0A]"
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
                          <p className="text-xs text-[#888888]">${item.price} each</p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[#2A0A0A]"
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
              <div className="sticky top-24 rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#E0E0E0]">
                  <ShoppingBag size={20} />
                  Order Summary
                </h2>

                <div className="mb-6 space-y-3 border-b-2 border-[#3A3A3A] pb-6">
                  <div className="flex justify-between text-[#B0B0B0]">
                    <span>
                      Total ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-semibold text-[#E0E0E0]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-6 flex justify-between text-xl font-bold text-[#E0E0E0]">
                  <span>Total</span>
                  <span className="text-[#CC0000]">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="mb-3 w-full transform rounded-xl bg-[#CC0000] py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98"
                >
                  Proceed to Checkout →
                </button>

                <button
                  onClick={onContinueShopping}
                  className="w-full rounded-xl border-2 border-[#CC0000] py-3 text-base font-semibold text-[#CC0000] transition-colors hover:bg-[#2A0A0A]"
                >
                  Continue Shopping
                </button>

                <div className="mt-6 rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
                  <p className="text-center text-xs text-[#A0A0A0]">
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
