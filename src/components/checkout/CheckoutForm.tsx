import { MapPin, ShoppingBag, Clock } from 'lucide-react';
import type { CartItem } from '../../types';
import PaymentMethodSelector from './PaymentMethodSelector';

type PaymentMethod = 'Cash' | 'CashApp' | 'Venmo' | 'Zelle';

interface CheckoutFormProps {
  itemsBySeller: Record<string, CartItem[]>;
  pickupTimesBySeller: Record<string, string>;
  onTimeSelection: (seller: string, time: string) => void;
  selectedPayment: PaymentMethod;
  onPaymentChange: (method: PaymentMethod) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  timeErrors: Record<string, string>;
  hasSubmitted: boolean;
}

const CheckoutForm = ({
  itemsBySeller,
  pickupTimesBySeller,
  onTimeSelection,
  selectedPayment,
  onPaymentChange,
  notes,
  onNotesChange,
  timeErrors,
  hasSubmitted,
}: CheckoutFormProps) => {
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

  return (
    <div className="space-y-6 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#2F2F2F] bg-[#161616] px-4 py-3 text-sm text-[#B0B0B0]">
        <span className="font-semibold text-[#E0E0E0]">Review & schedule pickup</span>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[#222] px-3 py-1 font-semibold text-[#E0E0E0]">
            {Object.values(itemsBySeller)
              .flat()
              .reduce((sum, item) => sum + item.quantity, 0)}{' '}
            items
          </span>
          <span className="rounded-full bg-[#222] px-3 py-1 font-semibold text-[#E0E0E0]">
            {Object.keys(itemsBySeller).length} seller
            {Object.keys(itemsBySeller).length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      {Object.entries(itemsBySeller).map(([seller, items]) => {
        const sellerTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const timeError = timeErrors[seller];
        const timeErrorId = `pickup-error-${seller.replace(/\s+/g, '-').toLowerCase()}`;

        return (
          <div
            key={seller}
            className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b-2 border-[#3A3A3A] pb-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MapPin size={20} className="text-[#CC0000]" />
                  <h2 className="text-xl font-bold text-[#E0E0E0]">{seller}</h2>
                </div>
                <p className="text-sm text-[#A0A0A0]">{items[0].location}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#222] px-3 py-1 text-xs font-semibold text-[#E0E0E0]">
                <ShoppingBag size={14} />
                {items.length} item{items.length === 1 ? '' : 's'} · ${sellerTotal.toFixed(2)}
              </div>
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
                            decoding="async"
                            sizes="(max-width: 768px) 64px, 96px"
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
              <div className="mt-3 flex items-center justify-between border-t-2 border-[#3A3A3A] pt-3 text-sm">
                <span className="font-bold text-[#E0E0E0]">Subtotal</span>
                <span className="font-bold text-[#F25C54]">${sellerTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Pickup Time Selection */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#B0B0B0]">
                <Clock size={16} />
                Select Pickup Time
              </h3>

              <div
                className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4"
                role="radiogroup"
                aria-label={`Pickup time for ${seller}`}
                aria-invalid={timeError ? 'true' : 'false'}
                aria-describedby={timeError ? timeErrorId : undefined}
              >
                {timeSlots.slice(0, 12).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onTimeSelection(seller, time)}
                    className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                      pickupTimesBySeller[seller] === time
                        ? 'border-[#CC0000] bg-[#CC0000] text-white'
                        : 'border-[#4A4A4A] bg-[#2A2A2A] text-[#E0E0E0] hover:border-[#CC0000]'
                    }`}
                    role="radio"
                    aria-checked={pickupTimesBySeller[seller] === time ? 'true' : 'false'}
                    aria-label={time}
                    aria-describedby={timeError ? timeErrorId : undefined}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {timeError && (
                <div
                  id={timeErrorId}
                  className="rounded-xl border-2 border-[#4A2A1A] bg-[#2A1A0A] p-3"
                  role="alert"
                  aria-live="assertive"
                >
                  <p className="text-sm text-[#FFD699]">⚠️ {timeError}</p>
                </div>
              )}

              {!pickupTimesBySeller[seller] && !timeError && hasSubmitted && (
                <div className="rounded-xl border-2 border-[#4A2A1A] bg-[#2A1A0A] p-3" role="alert">
                  <p className="text-sm text-[#FFD699]">
                    ⚠️ Please select a pickup time for this seller
                  </p>
                </div>
              )}

              {pickupTimesBySeller[seller] && (
                <div
                  className="rounded-xl border-2 border-[#1A4A1A] bg-[#0A2A0A] p-3"
                  role="status"
                >
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
      <PaymentMethodSelector selectedPayment={selectedPayment} onPaymentChange={onPaymentChange} />

      {/* Special Instructions */}
      <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-[#E0E0E0]">Special Instructions (Optional)</h2>
          <span className="text-xs tracking-wide text-[#8A8A8A] uppercase">
            All sellers see this
          </span>
        </div>

        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add dietary needs, handoff notes, or arrival details..."
          className="min-h-[110px] w-full resize-none rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#888888] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
          aria-label="Special instructions for your order"
        />
      </div>
    </div>
  );
};

export default CheckoutForm;
