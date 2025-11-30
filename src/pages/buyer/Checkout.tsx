import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { UserMode, CartItem, ProfileData } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import OrderSummary from '../../components/checkout/OrderSummary';
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
            aria-label="Back to cart"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-white">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <CheckoutForm
            itemsBySeller={itemsBySeller}
            pickupTimesBySeller={pickupTimesBySeller}
            onTimeSelection={handleTimeSelection}
            selectedPayment={selectedPayment}
            onPaymentChange={setSelectedPayment}
            notes={notes}
            onNotesChange={setNotes}
          />

          <OrderSummary
            cart={cart}
            sellers={sellers}
            selectedPayment={selectedPayment}
            pickupTimesBySeller={pickupTimesBySeller}
            total={total}
            allTimesSelected={allTimesSelected}
            isPlacingOrder={isPlacingOrder}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
