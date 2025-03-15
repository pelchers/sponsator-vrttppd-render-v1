import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback = '',
  className = ''
}) => {
  const [error, setError] = React.useState(false);

  return (
    <div className={`relative inline-block rounded-full overflow-hidden bg-gray-200 ${className || 'h-10 w-10'}`}>
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-600 font-medium">
          {fallback}
        </div>
      )}
    </div>
  );
}; 