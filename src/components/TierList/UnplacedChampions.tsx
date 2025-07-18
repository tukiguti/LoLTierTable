import React from 'react';
import type { Champion } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';

interface UnplacedChampionsProps {
  champions: Champion[];
}

export const UnplacedChampions: React.FC<UnplacedChampionsProps> = ({ champions }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">
          未配置チャンピオン ({champions.length})
        </h3>
      </div>
      
      <DroppableZone
        id="unplaced"
        data={{ type: 'unplaced' }}
        className="p-3"
        activeClassName="bg-gray-50"
      >
        {champions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">🎉</div>
            <div>すべてのチャンピオンが配置されました</div>
          </div>
        ) : (
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(2rem, 1fr))' }}>
            {champions.map((champion) => (
              <DraggableChampion
                key={champion.id}
                champion={champion}
                size="small"
              />
            ))}
          </div>
        )}
      </DroppableZone>
    </div>
  );
};