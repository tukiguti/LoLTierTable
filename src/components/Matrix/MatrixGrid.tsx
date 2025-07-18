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

    return (
      <DroppableZone
        key={cellId}
        id={cellId}
        data={{ x, y, type: 'matrix-cell' }}
        className="border border-gray-300 bg-gray-50 flex items-center justify-center relative cursor-pointer"
        style={{ width: cellSize, height: cellSize }}
        activeClassName="bg-blue-100 border-blue-500"
      >
        {champion && (
          <DraggableChampion
            uniqueId={`matrix-${champion.champion.id}-${x}-${y}`}
            champion={champion.champion}
            size="small"
            className="w-full h-full"
          />
        )}
      </DroppableZone>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      {/* Axis Labels */}
      <div className="mb-2 text-center">
        <div className="text-sm font-medium text-gray-700">{yAxisLabel}</div>
      </div>
      
      {/* Grid */}
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
      </div>
      
      {/* X-axis Label */}
      <div className="mt-2 text-right">
        <div className="text-sm font-medium text-gray-700">{xAxisLabel}</div>
      </div>
    </div>
  );
};