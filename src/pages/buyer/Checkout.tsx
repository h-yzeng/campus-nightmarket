import { ArrowLeft, Wallet, Clock, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { UserMode, CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { logger } from '../../utils/logger';

interface CheckoutProps {
  cart: CartItem[];
  profileData: ProfileData;
  userMode: UserMode;
  onBackToCart: () => void;
  onPlaceOrder: (
    paymentMethod: string,
    pickupTimes: Record<string, string>,
    notes?: string
  ) => Promise<void>;
  onSignOut: () => void;
  onProfileClick: () => void;
  onLogoClick?: () => void;
}

type PaymentMethod = 'Cash' | 'CashApp' | 'Venmo' | 'Zelle';

const Checkout = ({
  cart,
  profileData,
  userMode,
  onBackToCart,
  onPlaceOrder,
  onSignOut,
  onProfileClick,
  onLogoClick,
}: CheckoutProps) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Cash');
  const [pickupTimesBySeller, setPickupTimesBySeller] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const paymentMethods: PaymentMethod[] = ['Cash', 'CashApp', 'Venmo', 'Zelle'];

  const itemsBySeller = cart.reduce(
    (acc, item) => {
      if (!acc[item.seller]) {
        acc[item.seller] = [];
      }
      acc[item.seller].push(item);
      return acc;
    },
    {} as Record<string, CartItem[]>
  );

  const sellers = Object.keys(itemsBySeller);

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const startMinute = Math.ceil(currentMinute / 15) * 15;
    const startHour = startMinute >= 60 ? currentHour + 1 : currentHour;
    const adjustedStartMinute = startMinute % 60;

    for (let i = 0; i < 32; i++) {
      const totalMinutes = adjustedStartMinute + i * 15;
      const slotHour = (startHour + Math.floor(totalMinutes / 60)) % 24;
      const slotMinute = totalMinutes % 60;

      const period = slotHour >= 12 ? 'PM' : 'AM';
      const displayHour = slotHour % 12 || 12;
      const displayMinute = slotMinute.toString().padStart(2, '0');

      slots.push(`${displayHour}:${displayMinute} ${period}`);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSelection = (seller: string, time: string) => {
    setPickupTimesBySeller((prev) => ({
      ...prev,
      [seller]: time,
    }));
  };

  const handlePlaceOrder = async () => {
    const missingTimes = sellers.filter((seller) => !pickupTimesBySeller[seller]);

    if (missingTimes.length > 0) {
      alert(`Please select a pickup time for: ${missingTimes.join(', ')}`);
      return;
    }

    setIsPlacingOrder(true);
    try {
      await onPlaceOrder(selectedPayment, pickupTimesBySeller, notes);
    } catch (error) {
      logger.error('Error placing order:', error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const allTimesSelected = sellers.every((seller) => pickupTimesBySeller[seller]);

  return (
    <div className="flex min-h-screen flex-col bg-[#040707]">
      <Header
        cartItems={cart}
        profileData={profileData}
        onCartClick={onBackToCart}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onLogoClick={onLogoClick}
        showCart={true}
        userMode={userMode}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onBackToCart}
            className="flex items-center gap-2 font-semibold text-[#CC0000] hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-white">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="space-y-6 lg:col-span-2">
            {Object.entries(itemsBySeller).map(([seller, items]) => {
              const sellerTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

              return (
                <div
                  key={seller}
                  className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md"
                >
                  <div className="mb-4 border-b-2 border-[#3A3A3A] pb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPin size={20} className="text-[#CC0000]" />
                      <h2 className="text-xl font-bold text-[#E0E0E0]">{seller}</h2>
                    </div>
                    <p className="text-sm text-[#A0A0A0]">{items[0].location}</p>
                  </div>

                  {/* Items List */}
                  <div className="mb-6">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#B0B0B0]">
                      <ShoppingBag size={16} />
                      Items ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-[#3A3A3A] bg-[#1E1E1E]">
                              {item.image.startsWith('http') ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">{item.image}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-[#E0E0E0]">{item.name}</p>
                              <p className="text-sm text-[#A0A0A0]">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-bold text-[#CC0000]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t-2 border-[#3A3A3A] pt-3">
                      <span className="font-bold text-[#E0E0E0]">Subtotal</span>
                      <span className="font-bold text-[#CC0000]">${sellerTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Pickup Time Selection */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#B0B0B0]">
                      <Clock size={16} />
                      Select Pickup Time
                    </h3>

                    <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                      {timeSlots.slice(0, 16).map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelection(seller, time)}
                          className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                            pickupTimesBySeller[seller] === time
                              ? 'border-[#CC0000] bg-[#CC0000] text-white'
                              : 'border-[#4A4A4A] bg-[#2A2A2A] text-[#E0E0E0] hover:border-[#CC0000]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    {!pickupTimesBySeller[seller] && (
                      <div className="rounded-xl border-2 border-[#4A2A1A] bg-[#2A1A0A] p-3">
                        <p className="text-sm text-[#FFD699]">
                          ⚠️ Please select a pickup time for this seller
                        </p>
                      </div>
                    )}

                    {pickupTimesBySeller[seller] && (
                      <div className="rounded-xl border-2 border-[#1A4A1A] bg-[#0A2A0A] p-3">
                        <p className="text-sm text-[#88FF88]">
                          ✅ Pickup scheduled for{' '}
                          <span className="font-bold">{pickupTimesBySeller[seller]}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Payment Method */}
            <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#E0E0E0]">
                <Wallet size={20} />
                Payment Method
              </h2>

              <div className="mb-4 grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedPayment(method)}
                    className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all ${
                      selectedPayment === method
                        ? 'border-[#CC0000] bg-[#CC0000] text-white'
                        : 'border-[#4A4A4A] bg-[#2A2A2A] text-[#E0E0E0] hover:border-[#CC0000]'
                    }`}
                  >
                    {method === 'Cash'
                      ? '💵'
                      : method === 'CashApp'
                        ? '💸'
                        : method === 'Venmo'
                          ? '💳'
                          : '🏦'}{' '}
                    {method}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border-2 border-[#1A3A4A] bg-[#0A1A2A] p-4">
                <p className="text-sm text-[#88CCFF]">
                  {selectedPayment === 'Cash'
                    ? '💵 Pay each seller in person when you pick up your orders'
                    : `💳 After placing your order, each seller will share their ${selectedPayment} details for payment`}
                </p>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-[#E0E0E0]">
                Special Instructions (Optional)
              </h2>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requests or dietary restrictions..."
                className="min-h-[100px] w-full resize-none rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#888888] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-[#E0E0E0]">Order Summary</h2>

              <div className="mb-4 space-y-3 border-b-2 border-[#3A3A3A] pb-4">
                <div className="flex justify-between text-[#B0B0B0]">
                  <span>Items ({cart.length})</span>
                  <span className="font-semibold text-[#E0E0E0]">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#B0B0B0]">
                  <span>Sellers</span>
                  <span className="font-semibold text-[#E0E0E0]">{sellers.length}</span>
                </div>
                <div className="flex justify-between text-[#B0B0B0]">
                  <span>Payment</span>
                  <span className="font-semibold text-[#E0E0E0]">{selectedPayment}</span>
                </div>
              </div>

              {/* Pickup Times Summary */}
              {sellers.length > 0 && (
                <div className="mb-4 border-b-2 border-[#3A3A3A] pb-4">
                  <p className="mb-2 text-sm font-bold text-[#B0B0B0]">Pickup Times:</p>
                  <div className="space-y-2">
                    {sellers.map((seller) => (
                      <div key={seller} className="text-sm">
                        <p className="font-semibold text-[#E0E0E0]">{seller}</p>
                        <p
                          className={`text-xs ${pickupTimesBySeller[seller] ? 'text-[#88FF88]' : 'text-[#FF8888]'}`}
                        >
                          {pickupTimesBySeller[seller] || 'Not selected'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 flex justify-between text-xl font-bold text-[#E0E0E0]">
                <span>Total</span>
                <span className="text-[#CC0000]">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!allTimesSelected || isPlacingOrder}
                className={`w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all ${
                  allTimesSelected && !isPlacingOrder
                    ? 'bg-[#CC0000] hover:scale-102 hover:shadow-xl active:scale-98'
                    : 'cursor-not-allowed bg-[#666666]'
                }`}
              >
                {isPlacingOrder ? (
                  <>
                    <div className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Placing Order...
                  </>
                ) : allTimesSelected ? (
                  <>
                    <CheckCircle size={20} className="mr-2 inline" />
                    Place Order
                  </>
                ) : (
                  'Select All Pickup Times'
                )}
              </button>

              <div className="mt-6 rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
                <p className="text-center text-xs text-[#A0A0A0]">
                  🎓 Student-to-Student · Campus pickup only
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
