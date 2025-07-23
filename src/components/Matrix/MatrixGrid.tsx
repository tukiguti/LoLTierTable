import React from 'react';
import type { PlacedChampion } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';

interface MatrixGridProps {
  champions: PlacedChampion[];
  gridSize: { width: number; height: number };
  topLabel: string;
  bottomLabel: string;
  leftLabel: string;
  rightLabel: string;
  cellSize?: number;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  champions,
  gridSize,
  topLabel,
  bottomLabel,
  leftLabel,
  rightLabel,
  cellSize = 48,
}) => {
  const getChampionAtPosition = (x: number, y: number) => {
    return champions.find(pc => pc.x === x && pc.y === y);
  };


  const renderGridCell = (x: number, y: number) => {
    const champion = getChampionAtPosition(x, y);
    const cellId = `matrix-${x}-${y}`;
    
    // Calculate center positions (for odd grids)
    const centerX = Math.floor(gridSize.width / 2);
    const centerY = Math.floor(gridSize.height / 2);
    
    // Check if this is a center axis tile (horizontal or vertical line)
    const isCenterX = x === centerX;
    const isCenterY = y === centerY;
    const isCenterTile = isCenterX && isCenterY;
    
    // Set background color for center axes
    let cellClass = "border border-gray-300 bg-gray-50 flex items-center justify-center relative cursor-pointer";
    if (isCenterTile) {
      cellClass = "border border-gray-300 bg-blue-200 flex items-center justify-center relative cursor-pointer";
    } else if (isCenterX || isCenterY) {
      cellClass = "border border-gray-300 bg-blue-100 flex items-center justify-center relative cursor-pointer";
    }

    return (
      <DroppableZone
        key={cellId}
        id={cellId}
        data={{ x, y, type: 'matrix-cell' }}
        className={cellClass}
        style={{ width: cellSize, height: cellSize }}
        activeClassName="bg-blue-100 border-blue-500"
      >
        {champion && (
          <div className="absolute inset-0 flex items-center justify-center">
            <DraggableChampion
              uniqueId={`matrix-${champion.champion.id}-${x}-${y}`}
              champion={champion.champion}
              size="small"
              className=""
            />
          </div>
        )}
      </DroppableZone>
    );
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      {/* Grid layout with integrated labels */}
      <div 
        className="grid gap-2"
        style={{ 
          gridTemplateColumns: '60px 1fr 60px',
          gridTemplateRows: '40px 1fr 40px'
        }}
      >
        {/* Top row */}
        <div></div>
        <div className="flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-50 rounded px-3 py-2">
          {topLabel}
        </div>
        <div></div>

        {/* Middle row */}
        <div className="flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-50 rounded px-2 py-3 writing-mode-vertical">
          <span className="transform -rotate-90 whitespace-nowrap">{leftLabel}</span>
        </div>
        
        {/* Matrix grid */}
        <div 
          className="grid gap-1"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize.width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize.height}, ${cellSize}px)`,
            justifyContent: 'center',
            alignContent: 'center'
          }}
        >
          {Array.from({ length: gridSize.height }, (_, row) =>
            Array.from({ length: gridSize.width }, (_, col) => {
              const x = col;
              const y = gridSize.height - 1 - row; // Invert Y axis
              return renderGridCell(x, y);
            })
          )}
        </div>
        
        <div className="flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-50 rounded px-2 py-3">
          <span className="transform rotate-90 whitespace-nowrap">{rightLabel}</span>
        </div>

        {/* Bottom row */}
        <div></div>
        <div className="flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-50 rounded px-3 py-2">
          {bottomLabel}
        </div>
        <div></div>
      </div>
    </div>
  );
};