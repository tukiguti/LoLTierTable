import React from 'react';
import { StagingAreaPanel } from './StagingAreaPanel';

interface TierListStagingAreaProps {
  className?: string;
  style?: React.CSSProperties;
}

export const TierListStagingArea: React.FC<TierListStagingAreaProps> = ({
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`rounded-lg border-2 p-2 shadow-lg ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
        borderColor: '#fbbf24',
        boxShadow: '0 8px 25px rgba(251, 191, 36, 0.2)',
        ...style
      }}
    >
      <StagingAreaPanel />
    </div>
  );
};