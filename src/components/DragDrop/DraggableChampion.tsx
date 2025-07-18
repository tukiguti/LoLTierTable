import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Champion } from '../../types';
import { ChampionIcon } from '../ChampionPanel/ChampionIcon';

interface DraggableChampionProps {
  champion: Champion;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  uniqueId?: string;
}

export const DraggableChampion: React.FC<DraggableChampionProps> = ({
  champion,
  size = 'medium',
  className = '',
  onClick,
  uniqueId,
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

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        ${isDragging ? 'dragging z-50' : ''}
        ${className}
      `}
    >
      <ChampionIcon
        champion={champion}
        size={size}
        className={isDragging ? 'opacity-50' : ''}
        onClick={onClick}
      />
    </div>
  );
};