import { MapPin, Star } from 'lucide-react';
import { memo } from 'react';
import type { FoodItem } from '../types';

interface ListingCardProps {
  item: FoodItem;
  sellerRating: string | null;
  onAddToCart: (item: FoodItem) => void;
  onViewProfile: (sellerId: string) => void;
}

const ListingCard = ({ item, sellerRating, onAddToCart, onViewProfile }: ListingCardProps) => {
  const isPopular = item.purchaseCount !== undefined && item.purchaseCount > 10;

  return (
    <div className="transform overflow-hidden rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative bg-[#2A2A2A] p-6 pb-4">
        {item.image.startsWith('http') ? (
          <div className="flex h-40 w-full items-center justify-center">
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="h-full w-full rounded-lg object-cover"
            />
          </div>
        ) : (
          <div className="mb-2 text-center text-7xl">{item.image}</div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isPopular && (
            <span className="rounded-full bg-[#FF9900] px-3 py-1 text-xs font-bold text-white shadow-md">
              🔥 POPULAR
            </span>
          )}
          {item.isAvailable !== undefined && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold shadow-md ${
                item.isAvailable ? 'bg-[#0A6A0A] text-[#88FF88]' : 'bg-[#6A0A0A] text-[#FF8888]'
              }`}
            >
              {item.isAvailable ? '✓ AVAILABLE' : '✕ SOLD OUT'}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 pt-3">
        <h3 className="mb-1 text-lg leading-tight font-bold text-[#E0E0E0]">{item.name}</h3>
        <p className="mb-1 text-sm text-[#A0A0A0]">{item.description}</p>
        <button
          type="button"
          onClick={() => onViewProfile(item.sellerId)}
          className="mb-3 text-sm font-medium text-[#FF4444] transition-colors hover:text-[#CC0000] hover:underline"
        >
          by {item.seller.split(' ')[0]}
        </button>

        <div className="mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-[#888888]" />
          <span className="text-xs text-[#B0B0B0]">{item.location}</span>
          {sellerRating && (
            <div className="ml-auto flex items-center gap-1">
              <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
              <span className="text-xs font-semibold text-[#E0E0E0]">{sellerRating}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-3xl font-bold text-[#CC0000]">${item.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="transform rounded-lg bg-[#CC0000] px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            Add +
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize ListingCard to prevent re-rendering when parent re-renders
// Only re-render if item, sellerRating, or callbacks change
export default memo(ListingCard, (prevProps, nextProps) => {
  // Custom comparison function for better control
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.sellerRating === nextProps.sellerRating
    // Don't compare callbacks as they may be recreated
  );
});
