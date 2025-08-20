import React from 'react';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { useAppStore } from '../../store/appStore';
import { useTierListStore } from '../../store/tierListStore';
import { useMatrixStore } from '../../store/matrixStore';

export const StagingAreaPanel: React.FC = () => {
  const { currentMode } = useAppStore();
  
  // Use hooks to subscribe to store changes properly
  const tierListStagingChampions = useTierListStore(state => state.stagingChampions);
  const matrixChampions = useMatrixStore(state => state.champions);

  // Get staging champions based on current mode
  const getStagingChampions = () => {
    if (currentMode === 'tierlist') {
      return tierListStagingChampions;
    } else {
      return matrixChampions
        .filter(pc => pc.quadrant === 'staging')
        .map(pc => pc.champion);
    }
  };


  const handleClearStaging = () => {
    if (currentMode === 'tierlist') {
      const { clearStaging } = useTierListStore.getState();
      clearStaging();
    } else {
      const { champions, removeChampion } = useMatrixStore.getState();
      const stagingChampions = champions.filter(pc => pc.quadrant === 'staging');
      stagingChampions.forEach(pc => removeChampion(pc.champion.id));
    }
  };

  const stagingChampions = getStagingChampions();

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-4 p-3">
        {/* Enhanced Header with Clear Button */}
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <span 
              className="text-sm font-semibold"
              style={{ color: '#92400e' }}
            >
              {stagingChampions.length > 0 
                ? `${stagingChampions.length}体 準備中` 
                : ''
              }
            </span>
          </div>
          
          {stagingChampions.length > 0 && (
            <button
              onClick={handleClearStaging}
              className="px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: '1px solid #f87171',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
              }}
            >
              🗑️ 全て削除
            </button>
          )}
        </div>

        {/* Enhanced Staging Area */}
        <DroppableZone
          id="temp-staging"
          data={{ type: 'temp-staging' }}
          className="border-2 border-dashed rounded-xl p-4 transition-all duration-300"
          activeClassName="border-amber-400 bg-amber-50"
          style={{
            minHeight: '80px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(254, 243, 199, 0.8) 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 4px 15px rgba(251, 191, 36, 0.1)'
          }}
        >
          {stagingChampions.length === 0 ? (
            <div className="h-12 flex items-center justify-center">
              <div 
                className="text-center text-sm font-medium italic px-4 py-2 rounded-lg"
                style={{ 
                  color: '#92400e',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}
              >
                🎮 チャンピオンをここにドロップして一時保管
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stagingChampions.map((champion, index) => (
                <DraggableChampion
                  key={`${champion.id}-${index}`}
                  uniqueId={`staging-${champion.id}-${index}`}
                  champion={champion}
                  size="small"
                  className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-amber-400 hover:scale-105"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  }}
                />
              ))}
            </div>
          )}
        </DroppableZone>

      </div>
    </div>
  );
};