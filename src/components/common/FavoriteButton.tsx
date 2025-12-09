import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Heart-shaped favorite/wishlist button with animation
 */
export default function FavoriteButton({
  isFavorited,
  onToggle,
  isLoading = false,
  size = 'md',
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={isLoading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
        isFavorited
          ? 'bg-[#CC0000] text-white shadow-lg shadow-[#CC0000]/30'
          : 'border-2 border-[#3A3A3A] bg-[#1E1E1E] text-[#A0A0A0] hover:border-[#CC0000] hover:text-[#CC0000]'
      }`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
    >
      <Heart
        size={iconSizes[size]}
        className={`transition-all ${isFavorited ? 'fill-current' : ''}`}
      />
    </button>
  );
}
