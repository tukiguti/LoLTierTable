import React from 'react';
import type { PlacedChampion } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';

interface MatrixGridProps {
  champions: PlacedChampion[];
  gridSize: { width: number; height: number };
  xAxisLabel: string;
  yAxisLabel: string;
  cellSize?: number;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  champions,
  gridSize,
  xAxisLabel,
  yAxisLabel,
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

  // Calculate center positions for label positioning
  const centerX = Math.floor(gridSize.width / 2);
  const centerY = Math.floor(gridSize.height / 2);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      {/* Grid container with overlaid labels */}
      <div className="relative">
        <div 
          className="grid gap-1 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize.width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize.height}, ${cellSize}px)`,
            width: `${gridSize.width * (cellSize + 4)}px`,
            height: `${gridSize.height * (cellSize + 4)}px`
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
        
        {/* Y-axis Label - Positioned at center column */}
        <div 
          className="absolute top-0 text-sm font-medium text-gray-700 bg-white px-2 py-1 border border-gray-300 rounded"
          style={{ 
            left: `${centerX * (cellSize + 4) + (cellSize / 2) - 10}px`,
            top: '-30px'
          }}
        >
          {yAxisLabel}
        </div>
        
        {/* X-axis Label - Positioned at center row */}
        <div 
          className="absolute right-0 text-sm font-medium text-gray-700 bg-white px-2 py-1 border border-gray-300 rounded"
          style={{ 
            right: '-40px',
            top: `${(gridSize.height - 1 - centerY) * (cellSize + 4) + (cellSize / 2) - 10}px`
          }}
        >
          {xAxisLabel}
        </div>
      </div>
    </div>
  );
};