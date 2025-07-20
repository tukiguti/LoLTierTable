import React, { useState } from 'react';
import { useTierListStore } from '../../store/tierListStore';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { ChampionGroupManager } from '../ChampionGroup/ChampionGroupManager';
import { useAppStore } from '../../store/appStore';

export const SimpleTierList: React.FC = () => {
  const { 
    tiers, 
    stagingChampions, 
    addTier, 
    removeTier, 
    updateTierLabel, 
    updateTierColor, 
    resetTiers,
    addChampionToStaging,
    removeChampionFromStaging,
    clearStaging
  } = useTierListStore();
  
  const { champions: allChampions } = useAppStore();
  
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showGroupManager, setShowGroupManager] = useState(false);

  const handleLabelEdit = (tierId: string, currentLabel: string) => {
    setEditingTier(tierId);
    setEditValue(currentLabel);
  };

  const handleLabelSave = (tierId: string) => {
    if (editValue.trim()) {
      updateTierLabel(tierId, editValue.trim());
    }
    setEditingTier(null);
    setEditValue('');
  };

  const handleLabelCancel = () => {
    setEditingTier(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, tierId: string) => {
    if (e.key === 'Enter') {
      handleLabelSave(tierId);
    } else if (e.key === 'Escape') {
      handleLabelCancel();
    }
  };

  const handleReset = () => {
    if (window.confirm('すべてのティアをリセットしますか？配置されたチャンピオンも削除されます。')) {
      resetTiers();
    }
  };

  const handleImportToStaging = (importedChampions: any[]) => {
    // Clear existing staging champions first
    clearStaging();

    // Add imported champions to staging
    importedChampions.forEach((champion) => {
      addChampionToStaging(champion);
    });
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">ティアリスト</h2>
          <div className="flex gap-2">
            <button
              onClick={addTier}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              ティア追加
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              リセット
            </button>
          </div>
        </div>
      </div>

      {/* Tier List */}
      <div className="space-y-3">
        {tiers.map((tier) => (
          <div key={tier.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="flex">
              {/* Tier Label Section */}
              <div 
                className="flex-shrink-0 w-32 flex flex-col justify-center items-center p-4 border-r"
                style={{ backgroundColor: tier.color }}
              >
                {editingTier === tier.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, tier.id)}
                    onBlur={() => handleLabelSave(tier.id)}
                    className="w-full text-center font-bold text-white bg-transparent border border-white rounded px-2 py-1 text-lg"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleLabelEdit(tier.id, tier.label)}
                    className="cursor-pointer text-white font-bold text-lg hover:bg-black hover:bg-opacity-10 px-2 py-1 rounded transition-colors"
                  >
                    {tier.label}
                  </div>
                )}
                
                {/* Color Picker */}
                <input
                  type="color"
                  value={tier.color}
                  onChange={(e) => updateTierColor(tier.id, e.target.value)}
                  className="mt-2 w-8 h-6 rounded border-none cursor-pointer"
                  title="色を変更"
                />
                
                {/* Delete Button */}
                {tiers.length > 1 && (
                  <button
                    onClick={() => removeTier(tier.id)}
                    className="mt-2 text-white hover:text-red-200 transition-colors"
                    title="ティア削除"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Champions Drop Zone */}
              <DroppableZone
                id={tier.id}
                data={{ type: 'tier', tierId: tier.id }}
                className="flex-1 min-h-[80px] p-4 hover:bg-gray-50 transition-colors"
                activeClassName="bg-blue-50 border-blue-200"
              >
                <div className="flex flex-wrap gap-2">
                  {tier.champions.map((champion, index) => (
                    <DraggableChampion
                      key={`${champion.id}-${index}`}
                      uniqueId={`${tier.id}__${champion.id}__${index}`}
                      champion={champion}
                      size="medium"
                    />
                  ))}
                  {tier.champions.length === 0 && (
                    <div className="text-gray-400 text-sm flex items-center justify-center w-full h-12">
                      チャンピオンをここにドラッグ
                    </div>
                  )}
                </div>
              </DroppableZone>
            </div>
          </div>
        ))}
      </div>

      {/* Temporary Staging Area */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">一時設置エリア</h3>
          <button
            onClick={() => setShowGroupManager(!showGroupManager)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {showGroupManager ? ' 閉じる' : '管理'}
          </button>
        </div>
        <DroppableZone
          id="temp-staging"
          data={{ type: 'temp-staging' }}
          className="min-h-20 bg-gray-50 border-2 border-gray-300 border-dashed rounded-lg p-3 flex flex-wrap gap-2 justify-center items-center"
          activeClassName="bg-blue-50 border-blue-400"
        >
          {stagingChampions.length === 0 ? (
            <div className="text-gray-400 text-sm">チャンピオンをここにドラッグして一時保存</div>
          ) : (
            stagingChampions.map((champion, index) => (
              <DraggableChampion
                key={champion.id}
                uniqueId={`staging-${champion.id}-${index}`}
                champion={champion}
                size="small"
              />
            ))
          )}
        </DroppableZone>
        
        {/* Champion Group Manager */}
        {showGroupManager && (
          <div className="mt-4">
            <ChampionGroupManager
              champions={allChampions}
              onImportToStaging={handleImportToStaging}
              currentStagingChampions={stagingChampions}
              currentMode="tierlist"
            />
          </div>
        )}
      </div>

      {/* Trash Zone */}
      <div className="flex justify-center mt-6">
        <DroppableZone
          id="trash"
          data={{ type: 'trash' }}
          className="w-16 h-16 bg-red-100 border-2 border-red-300 border-dashed rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
          activeClassName="bg-red-200 border-red-500"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </DroppableZone>
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        配置済みチャンピオン: {tiers.reduce((sum, tier) => sum + tier.champions.length, 0)} 体 | 一時保存: {stagingChampions.length} 体
      </div>
    </div>
  );
};