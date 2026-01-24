
import React, { useState, ImgHTMLAttributes, useEffect } from 'react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  fallbackSrc = '/public/assets/posters/coming_soon.png', 
  alt, 
  className,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      if (props.onError) {
        props.onError(e);
      }
    }
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={`${className} ${hasError ? 'grayscale sepia-[.5] opacity-80' : ''}`}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
