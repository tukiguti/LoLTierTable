import React from 'react';
import type { PlacedChampion } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';

interface QuadrantGridProps {
  champions: PlacedChampion[];
  topLabel: string;
  bottomLabel: string;
  leftLabel: string;
  rightLabel: string;
  quadrantLabels: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  quadrantSize?: number;
  cellSize?: number;
}

type QuadrantType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

const QUADRANT_CONFIG = {
  topLeft: { bg: 'bg-blue-50', border: 'border-blue-300', label: 'bg-blue-600' },
  topRight: { bg: 'bg-green-50', border: 'border-green-300', label: 'bg-green-600' },
  bottomLeft: { bg: 'bg-purple-50', border: 'border-purple-300', label: 'bg-purple-600' },
  bottomRight: { bg: 'bg-red-50', border: 'border-red-300', label: 'bg-red-600' }
} as const;

export const QuadrantGrid: React.FC<QuadrantGridProps> = ({
  champions,
  quadrantLabels,
  quadrantSize = 4,
  cellSize = 45,
}) => {
  // Get champions for a specific quadrant
  const getChampionsInQuadrant = (quadrant: QuadrantType) => {
    return champions.filter(pc => 
      pc.quadrant === quadrant &&
      pc.x >= 0 && pc.x < quadrantSize && 
      pc.y >= 0 && pc.y < quadrantSize
    );
  };

  // Render a single quadrant
  const renderQuadrant = (quadrantType: QuadrantType) => {
    const config = QUADRANT_CONFIG[quadrantType];
    const quadrantChampions = getChampionsInQuadrant(quadrantType);
    
    const cells = [];
    for (let row = 0; row < quadrantSize; row++) {
      for (let col = 0; col < quadrantSize; col++) {
        const localX = col;
        const localY = quadrantSize - 1 - row;
        
        const champion = quadrantChampions.find(pc => 
          pc.x === localX && pc.y === localY
        );
        
        const cellId = `${quadrantType}-${localX}-${localY}`;

        cells.push(
          <DroppableZone
            key={cellId}
            id={cellId}
            data={{ 
              x: localX, 
              y: localY, 
              type: 'quadrant-cell', 
              quadrant: quadrantType 
            }}
            className={`${config.bg} border border-gray-400 flex items-center justify-center relative cursor-pointer hover:bg-opacity-80 transition-all`}
            style={{ width: cellSize, height: cellSize }}
            activeClassName="ring-2 ring-blue-400 bg-blue-100"
          >
            {champion && (
              <DraggableChampion
                uniqueId={`${quadrantType}-${champion.champion.id}-${localX}-${localY}`}
                champion={champion.champion}
                size="small"
              />
            )}
          </DroppableZone>
        );
      }
    }

    return (
      <div className={`relative border-2 ${config.border} rounded-lg shadow-md bg-white bg-opacity-90 p-2`}>
        <div 
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${quadrantSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${quadrantSize}, ${cellSize}px)`
          }}
        >
          {cells}
        </div>
      </div>
    );
  };

  // Render quadrant label
  const renderQuadrantLabel = (quadrantType: QuadrantType) => {
    const config = QUADRANT_CONFIG[quadrantType];
    const label = quadrantLabels[quadrantType];
    
    return (
      <div className={`${config.label} text-white text-xs font-bold px-2 py-1 rounded shadow-md`}>
        {label}
      </div>
    );
  };

  const quadrantSizeWithPadding = quadrantSize * cellSize + 16; // +16 for internal padding
  const gridGap = 24; // gap between quadrants
  const totalGridSize = quadrantSizeWithPadding * 2 + gridGap;
  const labelSpace = 60; // Space for labels outside grid
  const containerPadding = 20;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Large container with space for external labels */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl"
        style={{ 
          width: totalGridSize + labelSpace * 2 + containerPadding * 2,
          height: totalGridSize + labelSpace * 2 + containerPadding * 2,
          padding: `${labelSpace + containerPadding}px`
        }}
      >
        {/* External Labels - positioned outside the grid area */}
        <div 
          className="absolute"
          style={{ top: containerPadding, left: containerPadding }}
        >
          {renderQuadrantLabel('topLeft')}
        </div>
        <div 
          className="absolute"
          style={{ top: containerPadding, right: containerPadding }}
        >
          {renderQuadrantLabel('topRight')}
        </div>
        <div 
          className="absolute"
          style={{ bottom: containerPadding, left: containerPadding }}
        >
          {renderQuadrantLabel('bottomLeft')}
        </div>
        <div 
          className="absolute"
          style={{ bottom: containerPadding, right: containerPadding }}
        >
          {renderQuadrantLabel('bottomRight')}
        </div>

        {/* Quadrant Background Colors */}
        <div 
          className="absolute grid z-0"
          style={{
            top: labelSpace + containerPadding,
            left: labelSpace + containerPadding,
            width: totalGridSize,
            height: totalGridSize,
            gridTemplateColumns: `repeat(2, 1fr)`,
            gridTemplateRows: `repeat(2, 1fr)`,
            gap: '24px'
          }}
        >
          {/* Top Left Background (第二象限) */}
          <div className="bg-blue-100 rounded-lg border border-blue-200"></div>
          {/* Top Right Background (第一象限) */}
          <div className="bg-green-100 rounded-lg border border-green-200"></div>
          {/* Bottom Left Background (第三象限) */}
          <div className="bg-purple-100 rounded-lg border border-purple-200"></div>
          {/* Bottom Right Background (第四象限) */}
          <div className="bg-red-100 rounded-lg border border-red-200"></div>
        </div>

        {/* Central Cross Lines - only in grid area */}
        <div 
          className="absolute flex items-center justify-center pointer-events-none z-20"
          style={{
            top: labelSpace + containerPadding,
            left: labelSpace + containerPadding,
            width: totalGridSize,
            height: totalGridSize
          }}
        >
          <div className="absolute w-1 h-full bg-gray-600 opacity-50"></div>
          <div className="absolute h-1 w-full bg-gray-600 opacity-50"></div>
        </div>

        {/* Main 2x2 Quadrant Grid - centered in container */}
        <div 
          className="grid gap-6 relative z-30"
          style={{
            gridTemplateColumns: `repeat(2, ${quadrantSizeWithPadding}px)`,
            gridTemplateRows: `repeat(2, ${quadrantSizeWithPadding}px)`
          }}
        >
          {renderQuadrant('topLeft')}
          {renderQuadrant('topRight')}
          {renderQuadrant('bottomLeft')}
          {renderQuadrant('bottomRight')}
        </div>
      </div>
    </div>
  );
};