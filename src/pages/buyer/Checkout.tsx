import { ArrowLeft, Wallet, Clock, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { UserMode, CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface CheckoutProps {
  cart: CartItem[];
  profileData: ProfileData;
  userMode: UserMode;
  onBackToCart: () => void;
  onPlaceOrder: (paymentMethod: string, pickupTimes: Record<string, string>, notes?: string) => void;
  onSignOut: () => void;
  onProfileClick: () => void;
}

type PaymentMethod = 'Cash' | 'CashApp' | 'Venmo' | 'Zelle';

const Checkout = ({
  cart,
  profileData,
  userMode,
  onBackToCart,
  onPlaceOrder,
  onSignOut,
  onProfileClick
}: CheckoutProps) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Cash');
  const [pickupTimesBySeller, setPickupTimesBySeller] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<string>('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const paymentMethods: PaymentMethod[] = ['Cash', 'CashApp', 'Venmo', 'Zelle'];

  const itemsBySeller = cart.reduce((acc, item) => {
    if (!acc[item.seller]) {
      acc[item.seller] = [];
    }
    acc[item.seller].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

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
      const totalMinutes = adjustedStartMinute + (i * 15);
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
    setPickupTimesBySeller(prev => ({
      ...prev,
      [seller]: time
    }));
  };

  const handlePlaceOrder = () => {
    const missingTimes = sellers.filter(seller => !pickupTimesBySeller[seller]);
    
    if (missingTimes.length > 0) {
      alert(`Please select a pickup time for: ${missingTimes.join(', ')}`);
      return;
    }
    
    onPlaceOrder(selectedPayment, pickupTimesBySeller, notes);
  };

  const allTimesSelected = sellers.every(seller => pickupTimesBySeller[seller]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        cartItems={cart} 
        profileData={profileData} 
        onCartClick={onBackToCart}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        showCart={true}
        userMode={userMode}
      />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onBackToCart}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsBySeller).map(([seller, items]) => {
              const sellerTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              
              return (
                <div key={seller} className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
                  <div className="mb-4 pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={20} className="text-[#CC0000]" />
                      <h2 className="text-xl font-bold text-gray-900">
                        {seller}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600">{items[0].location}</p>
                  </div>

                  {/* Items List */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <ShoppingBag size={16} />
                      Items ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-[#FAFAFA] rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.image}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-bold text-[#CC0000]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t-2 border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Subtotal</span>
                      <span className="font-bold text-[#CC0000]">${sellerTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Pickup Time Selection */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock size={16} />
                      Select Pickup Time
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      {timeSlots.slice(0, 16).map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelection(seller, time)}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                            pickupTimesBySeller[seller] === time
                              ? 'bg-[#CC0000] text-white border-[#CC0000]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#CC0000]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    {!pickupTimesBySeller[seller] && (
                      <div className="p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                        <p className="text-sm text-gray-700">
                          ⚠️ Please select a pickup time for this seller
                        </p>
                      </div>
                    )}

                    {pickupTimesBySeller[seller] && (
                      <div className="p-3 bg-green-50 rounded-xl border-2 border-green-200">
                        <p className="text-sm text-gray-700">
                          ✅ Pickup scheduled for <span className="font-bold">{pickupTimesBySeller[seller]}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet size={20} />
                Payment Method
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedPayment(method)}
                    className={`px-4 py-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selectedPayment === method
                        ? 'bg-[#CC0000] text-white border-[#CC0000]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#CC0000]'
                    }`}
                  >
                    {method === 'Cash' ? '💵' : method === 'CashApp' ? '💸' : method === 'Venmo' ? '💳' : '🏦'} {method}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-700">
                  {selectedPayment === 'Cash' 
                    ? '💵 Pay each seller in person when you pick up your orders'
                    : `💳 After placing your order, each seller will share their ${selectedPayment} details for payment`}
                </p>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Special Instructions (Optional)
              </h2>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requests or dietary restrictions..."
                className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all resize-none bg-white min-h-[100px]"
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 pb-4 border-b-2 border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Items ({cart.length})</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Sellers</span>
                  <span className="font-semibold">{sellers.length}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Payment</span>
                  <span className="font-semibold">{selectedPayment}</span>
                </div>
              </div>

              {/* Pickup Times Summary */}
              {sellers.length > 0 && (
                <div className="mb-4 pb-4 border-b-2 border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-2">Pickup Times:</p>
                  <div className="space-y-2">
                    {sellers.map(seller => (
                      <div key={seller} className="text-sm">
                        <p className="font-semibold text-gray-900">{seller}</p>
                        <p className={`text-xs ${pickupTimesBySeller[seller] ? 'text-green-600' : 'text-red-600'}`}>
                          {pickupTimesBySeller[seller] || 'Not selected'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span className="text-[#CC0000]">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!allTimesSelected}
                className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg transition-all transform ${
                  allTimesSelected
                    ? 'bg-[#CC0000] hover:shadow-xl hover:scale-102 active:scale-98'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {allTimesSelected ? (
                  <>
                    <CheckCircle size={20} className="inline mr-2" />
                    Place Order
                  </>
                ) : (
                  'Select All Pickup Times'
                )}
              </button>

              <div className="mt-6 p-4 bg-[#F5F5F5] rounded-xl">
                <p className="text-xs text-gray-600 text-center">
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