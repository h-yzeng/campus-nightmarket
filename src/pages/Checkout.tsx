import { ArrowLeft, Wallet, Clock, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { CartItem, ProfileData } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CheckoutProps {
  cart: CartItem[];
  profileData: ProfileData;
  onBackToCart: () => void;
  onPlaceOrder: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
}

type PaymentMethod = 'Cash' | 'CashApp' | 'Venmo' | 'Zelle';

const Checkout = ({
  cart,
  profileData,
  onBackToCart,
  onPlaceOrder,
  onSignOut,
  onProfileClick
}: CheckoutProps) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Cash');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const paymentMethods: PaymentMethod[] = ['Cash', 'CashApp', 'Venmo', 'Zelle'];

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const startMinute = currentMinute < 30 ? 30 : 0;
    const startHour = currentMinute >= 30 ? currentHour + 1 : currentHour;

    for (let i = 0; i < 16; i++) {
      const slotHour = (startHour + Math.floor(i / 2)) % 24;
      const slotMinute = i % 2 === 0 ? startMinute : (startMinute + 30) % 60;
      
      const period = slotHour >= 12 ? 'PM' : 'AM';
      const displayHour = slotHour % 12 || 12;
      const displayMinute = slotMinute.toString().padStart(2, '0');
      
      slots.push(`${displayHour}:${displayMinute} ${period}`);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handlePlaceOrder = () => {
    if (!selectedTime) {
      alert('Please select a pickup time');
      return;
    }
    onPlaceOrder();
  };

  const itemsBySeller = cart.reduce((acc, item) => {
    if (!acc[item.seller]) {
      acc[item.seller] = [];
    }
    acc[item.seller].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        cartItems={cart} 
        profileData={profileData} 
        onCartClick={onBackToCart}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        showCart={true}
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
            {/* Order Items by Seller */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} />
                Your Order
              </h2>

              {Object.entries(itemsBySeller).map(([seller, items]) => (
                <div key={seller} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-[#CC0000]" />
                    <h3 className="font-bold text-gray-900">
                      {seller} · {items[0].location}
                    </h3>
                  </div>
                  
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
                </div>
              ))}
            </div>

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
                    ? '💵 Pay the seller in person when you pick up your order'
                    : `💳 After placing your order, the seller will share their ${selectedPayment} details for payment`}
                </p>
              </div>
            </div>

            {/* Pickup Time */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={20} />
                Pickup Time
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selectedTime === time
                        ? 'bg-[#CC0000] text-white border-[#CC0000]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#CC0000]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              {!selectedTime && (
                <div className="p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <p className="text-sm text-gray-700">
                    ⚠️ Please select a pickup time to continue
                  </p>
                </div>
              )}
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
                  <span>Payment</span>
                  <span className="font-semibold">{selectedPayment}</span>
                </div>
                {selectedTime && (
                  <div className="flex justify-between text-gray-700">
                    <span>Pickup</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span className="text-[#CC0000]">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!selectedTime}
                className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg transition-all transform ${
                  selectedTime
                    ? 'bg-[#CC0000] hover:shadow-xl hover:scale-102 active:scale-98'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {selectedTime ? (
                  <>
                    <CheckCircle size={20} className="inline mr-2" />
                    Place Order
                  </>
                ) : (
                  'Select Pickup Time'
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