
import React from 'react';

interface BrandLogoProps {
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "h-10 w-auto" }) => {
  return (
    <img 
      src="/assets/brand/logo.png" 
      alt="Sobek Play" 
      className={`${className} object-contain`}
    />
  );
};

export default BrandLogo;
