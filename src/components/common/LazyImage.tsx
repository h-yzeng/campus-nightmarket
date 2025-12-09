import { useState, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  placeholderColor?: string;
}

/**
 * LazyImage component with blur placeholder effect
 * Shows a blurred placeholder while the image loads, then fades in the full image
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  placeholderColor = '#1F1F1F',
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-[#1F1F1F] ${className}`}
        role="img"
        aria-label={`Failed to load: ${alt}`}
      >
        <span className="text-4xl">🍽️</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Blur placeholder */}
      <div
        className={`lazy-image-placeholder absolute inset-0 scale-110 blur-[10px] transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        data-placeholder-color={placeholderColor}
      />

      {/* Shimmer effect while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse">
          <div className="shimmer-effect h-full w-full" data-shimmer-color={placeholderColor} />
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />

      <style>{`
        .lazy-image-placeholder {
          background-color: var(--placeholder-color, #1F1F1F);
        }
        .lazy-image-placeholder[data-placeholder-color] {
          background-color: attr(data-placeholder-color color, #1F1F1F);
        }
        .shimmer-effect {
          background: linear-gradient(90deg, var(--shimmer-color, #1F1F1F) 0%, #2A2A2A 50%, var(--shimmer-color, #1F1F1F) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LazyImage;
