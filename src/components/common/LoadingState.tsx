import { Loader2 } from 'lucide-react';

type LoadingVariant = 'spinner' | 'skeleton' | 'inline' | 'dots';

interface LoadingStateProps {
  variant?: LoadingVariant;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingState = ({
  variant = 'spinner',
  size = 'md',
  text,
  className = '',
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (variant === 'spinner') {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        role="status"
        aria-live="polite"
      >
        <Loader2 className={`${sizeClasses[size]} animate-spin text-[#CC0000]`} />
        {text && <span className="ml-3 text-[#E0E0E0]">{text}</span>}
        <span className="sr-only">{text || 'Loading...'}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className={`inline-flex items-center gap-2 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[#CC0000] border-t-transparent`}
        />
        {text && <span className="text-sm text-[#E0E0E0]">{text}</span>}
        <span className="sr-only">{text || 'Loading...'}</span>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div
        className={`flex items-center justify-center gap-2 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex space-x-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-[#CC0000] [animation-delay:0ms]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-[#CC0000] [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-[#CC0000] [animation-delay:300ms]" />
        </div>
        {text && <span className="ml-3 text-sm text-[#E0E0E0]">{text}</span>}
        <span className="sr-only">{text || 'Loading...'}</span>
      </div>
    );
  }

  // skeleton variant
  return (
    <div className={`animate-pulse ${className}`} role="status" aria-live="polite">
      <div className="space-y-3">
        <div className="h-4 rounded bg-[#2A2A2A]" />
        <div className="h-4 w-5/6 rounded bg-[#2A2A2A]" />
        <div className="h-4 w-4/6 rounded bg-[#2A2A2A]" />
      </div>
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );
};

export default LoadingState;
