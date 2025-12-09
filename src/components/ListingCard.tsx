import { MapPin, Star, Tag, TrendingUp } from 'lucide-react';
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
  const hasCategory = Boolean(item.category);

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Allow Enter/Space to focus first interactive element (view profile button)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const viewProfileButton = e.currentTarget.querySelector(
        'button[aria-label*="View"]'
      ) as HTMLButtonElement;
      viewProfileButton?.focus();
    }
  };

  const handleAddToCartKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAddToCart(item);
    }
  };

  const handleViewProfileKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewProfile(item.sellerId);
    }
  };

  return (
    <div
      className="transform overflow-hidden rounded-2xl border-2 border-[#2F2F2F] bg-[#151515] shadow-md transition-all focus-within:ring-2 focus-within:ring-[#E23E57] focus-within:ring-offset-2 focus-within:ring-offset-[#0A0A0A] hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]"
      role="article"
      aria-label={`${item.name} listing by ${item.seller}`}
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
    >
      <div className="relative bg-linear-to-br from-[#1F1F1F] via-[#1A1A1A] to-[#111111] p-5 pb-4">
        {item.image.startsWith('http') ? (
          <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-[#2F2F2F] bg-[#0F0F0F]">
            <img
              src={item.image}
              srcSet={`${item.image} 640w, ${item.image} 960w, ${item.image} 1280w`}
              sizes="(min-width: 1280px) 260px, (min-width: 1024px) 240px, (min-width: 640px) 300px, 100vw"
              alt={`${item.name} - ${item.description || 'Food listing'} by ${item.seller}`}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={320}
              height={176}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-2 text-center text-7xl">{item.image}</div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 text-xs font-semibold">
          {isPopular && (
            <span className="flex items-center gap-1 rounded-full bg-[#FF9900] px-3 py-1 text-white shadow-md">
              <TrendingUp size={14} />
              🔥 POPULAR
            </span>
          )}
          {item.isAvailable !== undefined && (
            <span
              className={`rounded-full px-3 py-1 shadow-md ${
                item.isAvailable ? 'bg-[#0A6A0A] text-[#88FF88]' : 'bg-[#6A0A0A] text-[#FF8888]'
              }`}
            >
              {item.isAvailable ? '✓ AVAILABLE' : '✕ SOLD OUT'}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 pt-3">
        <div className="mb-2 flex items-start gap-2">
          <h3 className="text-lg leading-tight font-bold text-[#F5F5F5]">{item.name}</h3>
          {hasCategory && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#222] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#E0E0E0] uppercase">
              <Tag size={12} />
              {item.category}
            </span>
          )}
        </div>
        <p className="mb-2 line-clamp-2 text-sm text-[#A8A8A8]">{item.description}</p>
        <button
          type="button"
          onClick={() => onViewProfile(item.sellerId)}
          onKeyDown={handleViewProfileKeyDown}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#FF5555] transition-colors hover:text-[#FF7777] hover:underline focus:ring-2 focus:ring-[#FF5555] focus:ring-offset-2 focus:ring-offset-[#151515] focus:outline-none"
          aria-label={`View ${item.seller}'s profile`}
        >
          by {item.seller.split(' ')[0]}
        </button>

        <div className="mb-4 flex items-center gap-2 text-xs text-[#B0B0B0]">
          <MapPin size={14} className="text-[#888888]" />
          <span>{item.location}</span>
          {sellerRating && (
            <div className="ml-auto flex items-center gap-1">
              <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
              <span className="text-xs font-semibold text-[#E0E0E0]">{sellerRating}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-[#F25C54]">${item.price.toFixed(2)}</span>
            {item.purchaseCount !== undefined && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#9C9C9C]">
                <TrendingUp size={12} /> {item.purchaseCount} bought
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            onKeyDown={handleAddToCartKeyDown}
            className="transform rounded-lg bg-linear-to-r from-[#CC0000] to-[#E23E57] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-[#CC0000]/30 focus:ring-2 focus:ring-[#E23E57] focus:ring-offset-2 focus:ring-offset-[#151515] focus:outline-none active:scale-95"
            aria-label={`Add ${item.name} to cart - $${item.price.toFixed(2)}`}
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
