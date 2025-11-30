import { CheckCircle } from 'lucide-react';
import type { CartItem } from '../../types';

interface OrderSummaryProps {
  cart: CartItem[];
  sellers: string[];
  selectedPayment: string;
  pickupTimesBySeller: Record<string, string>;
  total: number;
  allTimesSelected: boolean;
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
}

const OrderSummary = ({
  cart,
  sellers,
  selectedPayment,
  pickupTimesBySeller,
  total,
  allTimesSelected,
  isPlacingOrder,
  onPlaceOrder,
}: OrderSummaryProps) => {
  return (
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
          type="button"
          onClick={onPlaceOrder}
          disabled={!allTimesSelected || isPlacingOrder}
          className={`w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all ${
            allTimesSelected && !isPlacingOrder
              ? 'bg-[#CC0000] hover:scale-102 hover:shadow-xl active:scale-98'
              : 'cursor-not-allowed bg-[#666666]'
          }`}
          aria-label={
            isPlacingOrder
              ? 'Placing order'
              : allTimesSelected
                ? 'Place order'
                : 'Select all pickup times to continue'
          }
          aria-busy={isPlacingOrder ? 'true' : 'false'}
        >
          {isPlacingOrder ? (
            <>
              <div
                className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                role="status"
                aria-label="Loading"
              />
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
  );
};

export default OrderSummary;
