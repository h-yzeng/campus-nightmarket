import { ArrowLeft, AlertCircle, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { UserMode, CartItem, ProfileData } from '../../types';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
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
  onModeChange?: (mode: UserMode) => void;
  onSellerDashboardClick?: () => void;
  onOrdersClick?: () => void;
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
  onModeChange,
  onSellerDashboardClick,
  onOrdersClick,
  onLogoClick,
}: CheckoutProps) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('Cash');
  const [pickupTimesBySeller, setPickupTimesBySeller] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [timeErrors, setTimeErrors] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const validationAlertRef = useRef<HTMLDivElement | null>(null);

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
    setTimeErrors((prev) => {
      const next = { ...prev };
      delete next[seller];
      return next;
    });
    if (validationError) {
      setValidationError('');
    }
  };

  const handlePlaceOrder = async () => {
    setHasSubmitted(true);
    const missingTimes = sellers.filter((seller) => !pickupTimesBySeller[seller]);

    if (missingTimes.length > 0) {
      const nextErrors = missingTimes.reduce<Record<string, string>>((acc, seller) => {
        acc[seller] = `Select a pickup time for ${seller}`;
        return acc;
      }, {});
      setTimeErrors(nextErrors);
      setValidationError(`Please select a pickup time for: ${missingTimes.join(', ')}`);
      requestAnimationFrame(() => {
        validationAlertRef.current?.focus();
      });
      return;
    }

    setTimeErrors({});
    setValidationError('');
    setIsPlacingOrder(true);
    try {
      await onPlaceOrder(selectedPayment, pickupTimesBySeller, notes);
    } catch (error) {
      logger.error('Error placing order:', error);
      setValidationError('Failed to place order. Please try again.');
      requestAnimationFrame(() => {
        validationAlertRef.current?.focus();
      });
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
        onModeChange={onModeChange}
        onSellerDashboardClick={onSellerDashboardClick}
        onOrdersClick={onOrdersClick}
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

        {validationError && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-4"
            role="alert"
            ref={validationAlertRef}
            tabIndex={-1}
            aria-live="assertive"
            id="checkout-validation-error"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#CC0000]" />
            <p className="flex-1 text-sm text-[#FFB0B0]">{validationError}</p>
            <button
              type="button"
              onClick={() => setValidationError('')}
              className="shrink-0 rounded-lg p-1 transition-colors hover:bg-[#4A1A1A]"
              aria-label="Dismiss error"
            >
              <X size={16} className="text-[#FFB0B0]" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <CheckoutForm
            itemsBySeller={itemsBySeller}
            pickupTimesBySeller={pickupTimesBySeller}
            onTimeSelection={handleTimeSelection}
            selectedPayment={selectedPayment}
            onPaymentChange={setSelectedPayment}
            notes={notes}
            onNotesChange={setNotes}
            timeErrors={timeErrors}
            hasSubmitted={hasSubmitted}
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
            validationMessageId={validationError ? 'checkout-validation-error' : undefined}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
