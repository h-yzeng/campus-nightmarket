import { X, DollarSign, MapPin, Phone, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { LOCATIONS } from '../../constants';

interface SellerOnboardingProps {
  onComplete: (sellerInfo: {
    phone: string;
    paymentMethods: {
      cashApp?: string;
      venmo?: string;
      zelle?: string;
    };
    preferredLocations: string[];
  }) => void;
  onCancel: () => void;
}

const SellerOnboarding = ({ onComplete, onCancel }: SellerOnboardingProps) => {
  const [phone, setPhone] = useState('');
  const [cashApp, setCashApp] = useState('');
  const [venmo, setVenmo] = useState('');
  const [zelle, setZelle] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const hasAtLeastOnePaymentMethod = cashApp || venmo || zelle;
  const isValid = phone && location && hasAtLeastOnePaymentMethod;

  const handleSubmit = () => {
    if (!isValid) {
      setError('Please fill in all required fields and at least one payment method');
      return;
    }

    onComplete({
      phone,
      paymentMethods: {
        ...(cashApp && { cashApp }),
        ...(venmo && { venmo }),
        ...(zelle && { zelle }),
      },
      preferredLocations: [location],
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[#3A3A3A] bg-[#1E1E1E] px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-[#CC0000]">Become a Seller</h2>
            <p className="text-sm text-[#B0B0B0]">
              Set up your seller profile to start posting food listings
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-[#888888] transition-colors hover:bg-[#2A2A2A] hover:text-[#E0E0E0]"
            aria-label="Close seller onboarding"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Info Banner */}
          <div className="flex gap-3 rounded-xl border-2 border-[#1A3A4A] bg-[#0A1A2A] p-4">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#88CCFF]" />
            <div className="text-sm text-[#D0E0FF]">
              <p className="mb-2 font-semibold">Why do we need this information?</p>
              <ul className="space-y-1 text-xs opacity-90">
                <li>• Buyers need a way to pay you for their orders</li>
                <li>• Contact info helps coordinate pickups and answer questions</li>
                <li>• Your preferred location helps buyers find your listings</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="flex gap-3 rounded-xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#CC0000]" />
              <p className="text-sm text-[#FFB0B0]">{error}</p>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
              <Phone size={16} />
              Phone Number <span className="text-[#CC0000]">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(123) 456-7890"
              className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-3 text-[#E0E0E0] placeholder-[#666666] transition-colors focus:border-[#CC0000] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#888888]">
              Buyers will use this to coordinate pickup times
            </p>
          </div>

          {/* Preferred Location */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
              <MapPin size={16} />
              Preferred Pickup Location <span className="text-[#CC0000]">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-3 text-[#E0E0E0] transition-colors focus:border-[#CC0000] focus:outline-none"
              aria-label="Preferred pickup location"
            >
              <option value="">Select a location</option>
              {LOCATIONS.filter((loc) => loc !== ('All Dorms' as string)).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[#888888]">
              Where you'll typically meet buyers for pickup
            </p>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
              <DollarSign size={16} />
              Payment Methods <span className="text-[#CC0000]">*</span>
              <span className="ml-auto text-xs font-normal text-[#888888]">(Add at least one)</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#B0B0B0]">
                  CashApp Username
                </label>
                <input
                  type="text"
                  value={cashApp}
                  onChange={(e) => setCashApp(e.target.value)}
                  placeholder="$yourcashapp"
                  className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-2.5 text-[#E0E0E0] placeholder-[#666666] transition-colors focus:border-[#CC0000] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#B0B0B0]">
                  Venmo Username
                </label>
                <input
                  type="text"
                  value={venmo}
                  onChange={(e) => setVenmo(e.target.value)}
                  placeholder="@yourvenmo"
                  className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-2.5 text-[#E0E0E0] placeholder-[#666666] transition-colors focus:border-[#CC0000] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#B0B0B0]">
                  Zelle Email/Phone
                </label>
                <input
                  type="text"
                  value={zelle}
                  onChange={(e) => setZelle(e.target.value)}
                  placeholder="your@email.com or phone"
                  className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-2.5 text-[#E0E0E0] placeholder-[#666666] transition-colors focus:border-[#CC0000] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-6 py-3 font-semibold text-[#E0E0E0] transition-colors hover:bg-[#2A2A2A]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`flex-1 rounded-xl px-6 py-3 font-semibold text-white transition-all ${
                isValid
                  ? 'bg-[#CC0000] hover:bg-[#B00000] hover:shadow-lg'
                  : 'cursor-not-allowed bg-[#4A4A4A] text-[#888888]'
              }`}
            >
              Complete Setup
            </button>
          </div>

          <p className="text-center text-xs text-[#888888]">
            You can update this information anytime in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerOnboarding;
