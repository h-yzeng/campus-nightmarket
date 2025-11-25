import { Star, User } from 'lucide-react';
import type { Review } from '../types';

interface ReviewsListProps {
  reviews: Review[];
  loading?: boolean;
  emptyMessage?: string;
}

const ReviewsList = ({ reviews, loading = false, emptyMessage = 'No reviews yet' }: ReviewsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-5xl mb-3">⏳</div>
          <p className="text-[#A0A0A0]">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1E1E1E] rounded-xl border-2 border-[#3A3A3A]">
        <div className="text-6xl mb-3">💬</div>
        <p className="text-lg font-semibold text-[#A0A0A0]">{emptyMessage}</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'fill-[#FFD700] text-[#FFD700]'
                : 'fill-none text-[#4A4A4A]'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-[#1E1E1E] rounded-xl border-2 border-[#3A3A3A] p-5 hover:border-[#4A4A4A] transition-all"
        >
          {/* Review Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#3A3A3A] flex items-center justify-center shrink-0">
                <User size={20} className="text-[#A0A0A0]" />
              </div>

              {/* Buyer Info */}
              <div>
                <p className="font-semibold text-white">{review.buyerName}</p>
                <p className="text-xs text-[#888888]">{formatDate(review.createdAt)}</p>
              </div>
            </div>

            {/* Rating */}
            {renderStars(review.rating)}
          </div>

          {/* Items Reviewed */}
          {review.itemNames.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {review.itemNames.map((item, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-[#2A2A2A] text-[#A0A0A0] rounded-lg"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Review Comment */}
          {review.comment && (
            <p className="text-[#E0E0E0] leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
