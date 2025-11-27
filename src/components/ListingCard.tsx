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
  const isPopular =
    item.name.toLowerCase().includes('ramen') ||
    item.name.toLowerCase().includes('sushi') ||
    item.name.toLowerCase().includes('pizza') ||
    item.name.toLowerCase().includes('taco');

  return (
    <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-[#3A3A3A]">
      <div className="relative p-6 pb-4 bg-[#2A2A2A]">
        {item.image.startsWith('http') ? (
          <div className="w-full h-40 flex items-center justify-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="text-7xl text-center mb-2">{item.image}</div>
        )}
        {isPopular && (
          <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full text-white font-bold shadow-md bg-[#FF9900]">
            POPULAR
          </span>
        )}
      </div>

      <div className="p-4 pt-3">
        <h3 className="font-bold text-lg mb-1 leading-tight text-[#E0E0E0]">
          {item.name}
        </h3>
        <p className="text-sm mb-1 text-[#A0A0A0]">
          {item.description}
        </p>
        <button
          type="button"
          onClick={() => onViewProfile(item.sellerId)}
          className="text-sm mb-3 font-medium text-[#FF4444] hover:text-[#CC0000] hover:underline transition-colors"
        >
          by {item.seller.split(' ')[0]}
        </button>

        <div className="flex items-center gap-2 mb-4">
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
          <span className="text-3xl font-bold text-[#CC0000]">
            ${item.price}
          </span>
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="px-5 py-2.5 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-[#CC0000]"
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
