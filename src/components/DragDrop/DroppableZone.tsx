import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableZoneProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
  activeClassName?: string;
  data?: Record<string, unknown>;
  style?: React.CSSProperties;
}

export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  children,
  className = '',
  activeClassName = 'drop-zone active',
  data,
  style,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        drop-zone
        ${className}
        ${isOver ? activeClassName : ''}
      `}
    >
      {children}
    </div>
  );
};