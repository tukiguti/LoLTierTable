import React from 'react';
import type { Champion } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';

interface ChampionGridProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
  selectedChampion?: Champion | null;
}

export const ChampionGrid: React.FC<ChampionGridProps> = ({
  champions,
  onChampionSelect,
  selectedChampion,
}) => {
  if (champions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">チャンピオンが見つかりません</div>
          <div className="text-sm">検索条件を変更してください</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-8 gap-2 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(2rem, 1fr))' }}>
      {champions.map((champion) => (
        <DraggableChampion
          key={champion.id}
          champion={champion}
          size="small"
          onClick={() => onChampionSelect(champion)}
          className={`
            ${selectedChampion?.id === champion.id 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : ''
            }
          `}
        />
      ))}
    </div>
  );
};