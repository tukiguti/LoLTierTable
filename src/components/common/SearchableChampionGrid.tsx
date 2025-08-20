import React from 'react';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';
import type { Champion, ChampionDisplayConfig } from '../../types';

interface SearchableChampionGridProps {
  champions: Champion[];
  config: ChampionDisplayConfig;
  onChampionClick?: (champion: Champion) => void;
  onChampionDoubleClick?: (champion: Champion) => void;
  className?: string;
}

export const SearchableChampionGrid: React.FC<SearchableChampionGridProps> = ({
  champions,
  config,
  onChampionClick,
  onChampionDoubleClick,
  className = ''
}) => {
  const { iconSize, gridColumns, maxItems, showItemCount } = config;

  // Limit champions if maxItems is specified
  const displayChampions = maxItems > 0 ? champions.slice(0, maxItems) : champions;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '8px',
    gridTemplateColumns: gridColumns === 'auto-fit' 
      ? `repeat(auto-fit, minmax(${iconSize === 'small' ? '48px' : iconSize === 'medium' ? '64px' : '80px'}, 1fr))`
      : `repeat(${gridColumns}, 1fr)`,
    padding: '12px',
    maxHeight: `${config.containerHeight}px`,
    overflowY: 'auto'
  };

  return (
    <div className={`champion-grid ${className}`}>
      {showItemCount && (
        <div className="px-3 py-2 text-sm text-gray-600 border-b bg-gray-50">
          {displayChampions.length} / {champions.length} champions
        </div>
      )}
      
      <DroppableZone
        id="champion-search-panel"
        data={{ type: 'champion-panel-return' }}
        className="h-full"
        activeClassName="bg-blue-50 border-blue-200"
      >
        <div style={gridStyle}>
          {displayChampions.map((champion) => (
            <DraggableChampion
              key={champion.id}
              uniqueId={`searchable-${champion.id}`}
              champion={champion}
              size={iconSize}
              onClick={() => onChampionClick?.(champion)}
              className="rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer transition-transform hover:scale-105"
            />
          ))}
        </div>
        
        {displayChampions.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div>No champions found</div>
            </div>
          </div>
        )}
      </DroppableZone>
    </div>
  );
};