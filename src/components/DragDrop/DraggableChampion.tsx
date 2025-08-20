import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Champion, ChampionIconSize } from '../../types';
import { ChampionIcon } from '../ChampionPanel/ChampionIcon';

interface DraggableChampionProps {
  champion: Champion;
  size?: ChampionIconSize;
  className?: string;
  onClick?: () => void;
  uniqueId?: string;
  style?: React.CSSProperties;
}

export const DraggableChampion: React.FC<DraggableChampionProps> = React.memo(({
  champion,
  size = 'medium',
  className = '',
  onClick,
  uniqueId,
  style: customStyle,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: uniqueId || champion.id,
    data: { champion },
  });

  // Optimize transform calculation with useMemo and add smooth transition
  const style = React.useMemo(() => ({
    ...customStyle,
    ...(transform && {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      willChange: 'transform', // Optimize for animations
    }),
    // Smooth transition when not dragging for drop animation
    ...(!isDragging && !transform && {
      transition: 'transform 150ms cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Smooth drop animation
    }),
    // No transition during active drag
    ...(isDragging && {
      transition: 'none',
    })
  }), [customStyle, transform, isDragging]);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        ${isDragging ? 'dragging z-50' : 'z-40'}
        ${className}
      `}
      style={{
        ...style,
        // Slightly reduce opacity during drag for better visual feedback
        opacity: isDragging ? 0.8 : 1,
        // Keep visible during transition
        visibility: 'visible',
      }}
    >
      <ChampionIcon
        champion={champion}
        size={size}
        onClick={onClick}
      />
    </div>
  );
});