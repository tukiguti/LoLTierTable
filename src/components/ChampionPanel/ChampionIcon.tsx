import React, { useState } from 'react';
import type { Champion } from '../../types';

interface ChampionIconProps {
  champion: Champion;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-12 h-12',
  large: 'w-16 h-16',
};

export const ChampionIcon: React.FC<ChampionIconProps> = ({
  champion,
  onClick,
  size = 'medium',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`
        champion-icon relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200
        ${sizeClasses[size]} ${className}
      `}
      onClick={onClick}
      title={`${champion.name} - ${champion.title}`}
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
};