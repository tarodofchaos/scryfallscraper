import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = '🎴',
  loading = 'lazy',
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isInView ? (
        // Placeholder while not in view
        <div className="w-full h-full bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10 flex items-center justify-center animate-pulse">
          <span className="text-2xl opacity-50">{fallback}</span>
        </div>
      ) : imageError ? (
        // Error fallback
        <div className="w-full h-full bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10 flex items-center justify-center">
          <span className="text-2xl">{fallback}</span>
        </div>
      ) : (
        // Actual image
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-mtg-blue/10 to-mtg-gold/10 flex items-center justify-center animate-pulse">
              <span className="text-2xl opacity-50">{fallback}</span>
            </div>
          )}
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            loading={loading}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            {...props}
          />
        </>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallback: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
};

export default OptimizedImage;
