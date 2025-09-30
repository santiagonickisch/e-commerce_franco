import React, { useState } from 'react';
import LazyImage from './LazyImage';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);

  // Generar srcSet para diferentes tamaños
  const generateSrcSet = (baseSrc) => {
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ');
  };

  // Generar placeholder optimizado
  const generatePlaceholder = (width = 400, height = 300) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
          </linearGradient>
        </defs>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
          Cargando...
        </text>
      </svg>
    `)}`;
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 text-gray-500 text-center p-4 ${className}`} {...props}>
        <div className="w-8 h-8 mx-auto mb-2">
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm">Error al cargar la imagen</p>
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      placeholder={
        <div className="bg-gray-200 animate-pulse">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      }
      onError={handleError}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={handleError}
      />
    </LazyImage>
  );
};

export default OptimizedImage;
