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
        style={{ width, height }}
        role="img"
        aria-label={`Failed to load: ${alt}`}
      >
        <span className="text-4xl">🍽️</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ width: '100%', height: '100%' }}>
      {/* Blur placeholder */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundColor: placeholderColor,
          filter: 'blur(10px)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Shimmer effect while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse">
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(90deg, ${placeholderColor} 0%, #2A2A2A 50%, ${placeholderColor} 100%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
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
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LazyImage;
