import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithLoadingProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export const ImageWithLoading = ({
  src,
  alt,
  className = '',
  aspectRatio = 'auto',
}: ImageWithLoadingProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  };

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 ${aspectClasses[aspectRatio]} ${className}`}
      >
        <div className="text-center text-gray-500">
          <ImageOff className="mx-auto mb-2 h-12 w-12" />
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectClasses[aspectRatio]} ${className}`}>
      {/* Loading placeholder */}
      {!loaded && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-700">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-[#CC0000]"></div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};

export default ImageWithLoading;
