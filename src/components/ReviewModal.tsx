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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl border-2 border-[#3A3A3A] max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#3A3A3A]">
          <h2 className="text-2xl font-bold text-white">Leave a Review</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[#A0A0A0] hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Seller Info */}
          <div>
            <p className="text-sm text-[#A0A0A0] mb-1">Reviewing order from</p>
            <p className="text-lg font-semibold text-white">{sellerName}</p>
            {itemNames.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-[#888888] mb-1">Items:</p>
                <div className="flex flex-wrap gap-2">
                  {itemNames.map((item, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-[#2A2A2A] text-[#E0E0E0] rounded-lg"
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
            <label className="block text-sm font-semibold mb-3 text-[#E0E0E0]">
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
                  className="transition-all transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
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
              <p className="text-sm text-[#A0A0A0] mt-2">
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
            <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all resize-none bg-[#252525] disabled:opacity-50"
              placeholder="Share your experience with this seller..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-[#888888] mt-1">{comment.length}/500 characters</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 p-4 rounded-xl bg-[#2A0A0A] border-2 border-[#4A1A1A]">
              <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
              <p className="text-sm text-[#FFB0B0]">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-[#3A3A3A]">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[#3A3A3A] text-white text-base font-semibold rounded-xl hover:bg-[#4A4A4A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className={`flex-1 py-3 text-white text-base font-semibold rounded-xl transition-all ${
              rating > 0 && !isSubmitting
                ? 'bg-[#CC0000] hover:bg-[#AA0000] hover:shadow-lg'
                : 'bg-[#666666] cursor-not-allowed'
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
