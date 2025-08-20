import React, { useState } from 'react';
import type { Champion, ChampionIconSize } from '../../types';

interface ChampionIconProps {
  champion: Champion;
  onClick?: () => void;
  size?: ChampionIconSize;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  'extra-small': 'w-8 h-8',
  small: 'w-12 h-12',
  medium: 'w-16 h-16',
  large: 'w-20 h-20',
};

export const ChampionIcon: React.FC<ChampionIconProps> = React.memo(({
  champion,
  onClick,
  size = 'medium',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div
      className={`
        champion-icon relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 z-30
        ${sizeClasses[size]} ${className}
      `}
      onClick={onClick}
      title={`${champion.name} - ${champion.title}`}
      style={{
        userSelect: 'none', // Prevent text selection during drag
        WebkitUserDrag: 'none', // Prevent default drag behavior
        backfaceVisibility: 'hidden', // Optimize for transforms
        perspective: '1000px', // Enable hardware acceleration
      }}
    >
      {!imageError ? (
        <img
          src={champion.iconUrl}
          alt={champion.name}
          className="w-full h-full object-cover rounded-lg"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
          <span className="text-xs font-semibold text-gray-600 text-center p-1">
            {champion.name}
          </span>
        </div>
      )}
      
    </div>
  );
});