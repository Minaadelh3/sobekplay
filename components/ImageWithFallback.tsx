
import React, { useState, ImgHTMLAttributes, useEffect } from 'react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  fallbackSrc, 
  alt, 
  className,
  ...props 
}) => {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setError(false);
    setImgSrc(src);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!error) {
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      } else {
        setError(true);
      }
      if (props.onError) {
        props.onError(e);
      }
    }
  };

  if (error) {
    return (
      <div 
        className={`${className} bg-gradient-to-br from-charcoal to-navy flex items-center justify-center`}
        role="img"
        aria-label={alt}
      >
        <svg className="w-1/3 h-1/3 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
};

export default ImageWithFallback;
