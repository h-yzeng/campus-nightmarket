import { RefreshCw } from 'lucide-react';

interface RetryButtonProps {
  onRetry: () => void;
  isRetrying?: boolean;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * RetryButton component for failed mutation recovery
 * Provides a consistent UI for retrying failed operations
 */
const RetryButton = ({
  onRetry,
  isRetrying = false,
  label = 'Retry',
  className = '',
  variant = 'primary',
}: RetryButtonProps) => {
  const variantStyles = {
    primary: 'bg-[#CC0000] hover:bg-[#AA0000] text-white',
    secondary: 'bg-[#252525] hover:bg-[#3A3A3A] text-white border border-[#3A3A3A]',
    danger: 'bg-[#6A0A0A] hover:bg-[#8A0A0A] text-white',
  };

  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={isRetrying}
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${className}`}
    >
      <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
      {isRetrying ? 'Retrying...' : label}
    </button>
  );
};

export default RetryButton;
