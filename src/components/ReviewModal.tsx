import { X, Star, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  sellerName: string;
  itemNames: string[];
}

const ReviewModal = ({ isOpen, onClose, onSubmit, sellerName, itemNames }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(rating, comment.trim());
      setRating(0);
      setComment('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-lg rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3A3A3A] p-6">
          <h2 className="text-2xl font-bold text-white">Leave a Review</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[#A0A0A0] transition-colors hover:text-white disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Seller Info */}
          <div>
            <p className="mb-1 text-sm text-[#A0A0A0]">Reviewing order from</p>
            <p className="text-lg font-semibold text-white">{sellerName}</p>
            {itemNames.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-xs text-[#888888]">Items:</p>
                <div className="flex flex-wrap gap-2">
                  {itemNames.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-[#2A2A2A] px-2 py-1 text-xs text-[#E0E0E0]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Star Rating */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-[#E0E0E0]">
              Rating <span className="text-[#CC0000]">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                  className="transform transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={36}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'fill-[#FFD700] text-[#FFD700]'
                        : 'fill-none text-[#4A4A4A]'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-[#A0A0A0]">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              className="w-full resize-none rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#888888] transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none disabled:opacity-50"
              placeholder="Share your experience with this seller..."
              rows={4}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-[#888888]">{comment.length}/500 characters</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 rounded-xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#CC0000]" />
              <p className="text-sm text-[#FFB0B0]">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t-2 border-[#3A3A3A] p-6">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-[#3A3A3A] py-3 text-base font-semibold text-white transition-all hover:bg-[#4A4A4A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className={`flex-1 rounded-xl py-3 text-base font-semibold text-white transition-all ${
              rating > 0 && !isSubmitting
                ? 'bg-[#CC0000] hover:bg-[#AA0000] hover:shadow-lg'
                : 'cursor-not-allowed bg-[#666666]'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
