import React from 'react';
import type { PlacedChampion } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';

interface ZoneScatterGridProps {
  champions: PlacedChampion[];
  topLabel: string;
  bottomLabel: string;
  leftLabel: string;
  rightLabel: string;
  zoneLabels: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  zoneSize?: number;
  cellSize?: number;
}

type ZoneType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

const ZONE_CONFIG = {
  topLeft: { bg: '#dbeafe', border: 'border-blue-400', label: 'bg-blue-600' }, // blue-100
  topRight: { bg: '#dcfce7', border: 'border-green-400', label: 'bg-green-600' }, // green-100
  bottomLeft: { bg: '#f3e8ff', border: 'border-purple-400', label: 'bg-purple-600' }, // purple-100
  bottomRight: { bg: '#fee2e2', border: 'border-red-400', label: 'bg-red-600' } // red-100
} as const;

export const ZoneScatterGrid: React.FC<ZoneScatterGridProps> = ({
  champions,
  zoneLabels,
  cellSize = 50,
}) => {

  // Render the complete 11x11 grid
  const renderFullGrid = () => {
    const cells = [];
    const totalSize = 11; // 11x11 grid
    const centerIndex = 5; // Center position (0-indexed)
    
    for (let row = 0; row < totalSize; row++) {
      for (let col = 0; col < totalSize; col++) {
        // Determine which zone this cell belongs to, or if it's center axis
        let zoneType: ZoneType | null = null;
        let localX: number = 0, localY: number = 0;
        let backgroundColor = '#ffffff'; // Default for center axis
        
        const isCenterRow = row === centerIndex;
        const isCenterCol = col === centerIndex;
        
        if (!isCenterRow && !isCenterCol) {
          // Not on center axis - determine zone and calculate local coordinates
          if (row < centerIndex && col < centerIndex) {
            // Top-left zone (ゾーン2) - Blue
            zoneType = 'topLeft';
            localX = col;
            localY = (centerIndex - 1) - row;
            backgroundColor = ZONE_CONFIG.topLeft.bg;
          } else if (row < centerIndex && col > centerIndex) {
            // Top-right zone (ゾーン1) - Green
            zoneType = 'topRight';
            localX = col - (centerIndex + 1);
            localY = (centerIndex - 1) - row;
            backgroundColor = ZONE_CONFIG.topRight.bg;
          } else if (row > centerIndex && col < centerIndex) {
            // Bottom-left zone (ゾーン3) - Purple
            zoneType = 'bottomLeft';
            localX = col;
            localY = row - (centerIndex + 1);
            backgroundColor = ZONE_CONFIG.bottomLeft.bg;
          } else if (row > centerIndex && col > centerIndex) {
            // Bottom-right zone (ゾーン4) - Red
            zoneType = 'bottomRight';
            localX = col - (centerIndex + 1);
            localY = row - (centerIndex + 1);
            backgroundColor = ZONE_CONFIG.bottomRight.bg;
          }
        }
        
        
        // Find champion in this position
        const champion = zoneType 
          ? champions.find(pc => 
              pc.quadrant === zoneType && 
              pc.x === localX && 
              pc.y === localY
            )
          : champions.find(pc => 
              pc.quadrant === 'center' && 
              pc.x === col && 
              pc.y === row
            );
            
            
            
        
        const cellId = zoneType 
          ? `${zoneType}-${localX}-${localY}`
          : `center-${row}-${col}`;

        cells.push(
          <DroppableZone
            key={cellId}
            id={cellId}
            data={zoneType ? { 
              x: localX, 
              y: localY, 
              type: 'scatter-cell', 
              zone: zoneType 
            } : {
              x: col,
              y: row,
              type: 'center-axis'
            }}
            className="flex items-center justify-center relative transition-all border border-gray-200"
            style={{ 
              width: cellSize, 
              height: cellSize,
              backgroundColor: backgroundColor
            }}
            activeClassName="ring-2 ring-blue-400"
          >
            {champion && (
              <DraggableChampion
                uniqueId={zoneType 
                  ? `${zoneType}-${champion.champion.id}-${localX}-${localY}`
                  : `center-${champion.champion.id}-${col}-${row}`
                }
                champion={champion.champion}
                size="small"
              />
            )}
          </DroppableZone>
        );
      }
    }
    
    
    return cells;
  };

  // Render zone label
  const renderZoneLabel = (zoneType: ZoneType) => {
    const config = ZONE_CONFIG[zoneType];
    const label = zoneLabels[zoneType];
    
    return (
      <div className={`${config.label} text-white text-xs font-bold px-2 py-1 rounded shadow-md`}>
        {label}
      </div>
    );
  };

  const totalSize = 11;

  const gridWidth = totalSize * cellSize;
  const halfGrid = gridWidth / 2;

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Container with labels */}
      <div className="relative" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        {/* External Labels - positioned at corners of each zone */}
        <div 
          className="absolute"
          style={{ 
            top: '10px', 
            left: `${halfGrid/2 - 40}px`,
          }}
        >
          {renderZoneLabel('topLeft')}
        </div>
        <div 
          className="absolute"
          style={{ 
            top: '10px', 
            right: `${halfGrid/2 - 40}px`,
          }}
        >
          {renderZoneLabel('topRight')}
        </div>
        <div 
          className="absolute"
          style={{ 
            bottom: '10px', 
            left: `${halfGrid/2 - 40}px`,
          }}
        >
          {renderZoneLabel('bottomLeft')}
        </div>
        <div 
          className="absolute"
          style={{ 
            bottom: '10px', 
            right: `${halfGrid/2 - 40}px`,
          }}
        >
          {renderZoneLabel('bottomRight')}
        </div>

        {/* 11x11 Grid */}
        <div 
          className="grid bg-white rounded-lg shadow-lg p-2"
          style={{
            gridTemplateColumns: `repeat(${totalSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${totalSize}, ${cellSize}px)`,
            gap: '0px'
          }}
        >
          {renderFullGrid()}
        </div>
      </div>
    </div>
  );
};