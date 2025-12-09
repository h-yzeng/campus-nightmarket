import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface MutationErrorAlertProps {
  error: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  title?: string;
}

/**
 * MutationErrorAlert component
 * Displays an error message with retry functionality for failed mutations
 */
const MutationErrorAlert = ({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  title = 'Operation failed',
}: MutationErrorAlertProps) => {
  if (!error) return null;

  return (
    <div className="mb-4 rounded-xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FF8888]" />

        <div className="flex-1">
          <h4 className="font-semibold text-[#FF8888]">{title}</h4>
          <p className="mt-1 text-sm text-[#CC8888]">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="mt-3 flex items-center gap-2 rounded-lg bg-[#CC0000] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#AA0000] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[#888888] transition-colors hover:text-[#CC8888]"
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MutationErrorAlert;
