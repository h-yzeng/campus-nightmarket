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
  aspectRatio = 'auto'
}: ImageWithLoadingProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 ${aspectClasses[aspectRatio]} ${className}`}>
        <div className="text-center text-gray-500">
          <ImageOff className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectClasses[aspectRatio]} ${className}`}>
      {/* Loading placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-[#CC0000] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};

export default ImageWithLoading;
