import React, { useState } from 'react';
import { useMatrixStore } from '../../store/matrixStore';
import { ZoneScatterGrid } from './ZoneScatterGrid';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { ChampionGroupManager } from '../ChampionGroup/ChampionGroupManager';
import { useAppStore } from '../../store/appStore';

export const ZoneScatterMatrix: React.FC = () => {
  const { 
    champions, 
    zoneLabels,
    updateZoneLabel,
    setMatrixType,
    addChampionsToStaging
  } = useMatrixStore();
  
  const { champions: allChampions } = useAppStore();
  
  // Set matrix type to scatter when this component mounts
  React.useEffect(() => {
    setMatrixType('scatter');
  }, [setMatrixType]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showGroupManager, setShowGroupManager] = useState(false);

  const handleZoneEdit = (zone: string, currentLabel: string) => {
    setEditingZone(zone);
    setEditValue(currentLabel);
  };

  const handleZoneSave = (zone: string) => {
    if (editValue.trim()) {
      updateZoneLabel(zone as 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', editValue.trim());
    }
    setEditingZone(null);
    setEditValue('');
  };

  const handleZoneCancel = () => {
    setEditingZone(null);
    setEditValue('');
  };

  const handleZoneKeyPress = (e: React.KeyboardEvent, zone: string) => {
    if (e.key === 'Enter') {
      handleZoneSave(zone);
    } else if (e.key === 'Escape') {
      handleZoneCancel();
    }
  };

  const handleReset = () => {
    if (window.confirm('ゾーンスキャッターをリセットしますか？配置されたチャンピオンも削除されます。')) {
      // Remove only scatter mode champions (keep grid mode champions)
      const { removeChampion } = useMatrixStore.getState();
      const scatterChampionsToRemove = champions.filter(pc => pc.quadrant !== undefined);
      scatterChampionsToRemove.forEach(pc => {
        removeChampion(pc.champion.id);
      });
    }
  };

  const handleImportToStaging = (importedChampions: any[]) => {
    console.log('ZoneScatterMatrix: Importing champions to staging:', importedChampions.length);
    
    // Use the new batch function for reliable import
    addChampionsToStaging(importedChampions);
    
    console.log('ZoneScatterMatrix: Import completed using batch function');
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">ゾーンスキャッター</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                showSettings 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showSettings ? '設定を隠す' : '設定を表示'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              リセット
            </button>
          </div>
        </div>

        {/* Settings Panel - Collapsible */}
        {showSettings && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">ゾーンスキャッター設定</h3>
            
            <div className="space-y-3">
              {/* Zone 1 (Top Right) */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[80px]">右上：</label>
                {editingZone === 'topRight' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleZoneKeyPress(e, 'topRight')}
                    onBlur={() => handleZoneSave('topRight')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    placeholder="例: 理想的"
                  />
                ) : (
                  <div
                    onClick={() => handleZoneEdit('topRight', zoneLabels.topRight)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    {zoneLabels.topRight || 'クリックして編集'}
                  </div>
                )}
              </div>

              {/* Zone 2 (Top Left) */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[80px]">左上：</label>
                {editingZone === 'topLeft' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleZoneKeyPress(e, 'topLeft')}
                    onBlur={() => handleZoneSave('topLeft')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    placeholder="例: 高コスト・強力"
                  />
                ) : (
                  <div
                    onClick={() => handleZoneEdit('topLeft', zoneLabels.topLeft)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    {zoneLabels.topLeft || 'クリックして編集'}
                  </div>
                )}
              </div>

              {/* Zone 3 (Bottom Left) */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[80px]">左下：</label>
                {editingZone === 'bottomLeft' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleZoneKeyPress(e, 'bottomLeft')}
                    onBlur={() => handleZoneSave('bottomLeft')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    placeholder="例: 低コスト・弱い"
                  />
                ) : (
                  <div
                    onClick={() => handleZoneEdit('bottomLeft', zoneLabels.bottomLeft)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    {zoneLabels.bottomLeft || 'クリックして編集'}
                  </div>
                )}
              </div>

              {/* Zone 4 (Bottom Right) */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[80px]">右下：</label>
                {editingZone === 'bottomRight' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleZoneKeyPress(e, 'bottomRight')}
                    onBlur={() => handleZoneSave('bottomRight')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    placeholder="例: 低コスト・強力"
                  />
                ) : (
                  <div
                    onClick={() => handleZoneEdit('bottomRight', zoneLabels.bottomRight)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    {zoneLabels.bottomRight || 'クリックして編集'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quadrant Matrix Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ZoneScatterGrid
          champions={champions}
          topLabel=""
          bottomLabel=""
          leftLabel=""
          rightLabel=""
          zoneLabels={zoneLabels}
          zoneSize={5}
          cellSize={55}
        />
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
          {champions.filter(pc => pc.quadrant === 'staging').length === 0 ? (
            <div className="text-gray-400 text-sm">チャンピオンをここにドラッグして一時保存</div>
          ) : (
            champions
              .filter(pc => pc.quadrant === 'staging')
              .map((pc, index) => (
                <DraggableChampion
                  key={pc.champion.id}
                  uniqueId={`staging-${pc.champion.id}-${index}`}
                  champion={pc.champion}
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
              currentStagingChampions={champions.filter(pc => pc.quadrant === 'staging').map(pc => pc.champion)}
              currentMode="scatter"
            />
          </div>
        )}
      </div>

      {/* Trash Zone */}
      <div className="flex justify-center">
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
        配置済みチャンピオン: {champions.filter(pc => pc.quadrant !== undefined && pc.quadrant !== 'staging').length} 体 | 一時保存: {champions.filter(pc => pc.quadrant === 'staging').length} 体
      </div>
    </div>
  );
};