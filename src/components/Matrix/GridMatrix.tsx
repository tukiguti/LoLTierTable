import React, { useState } from 'react';
import { useMatrixStore } from '../../store/matrixStore';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { ChampionGroupManager } from '../ChampionGroup/ChampionGroupManager';
import { useAppStore } from '../../store/appStore';

export const GridMatrix: React.FC = () => {
  const { 
    champions, 
    topLabel,
    bottomLabel,
    leftLabel,
    rightLabel,
    updateTopLabel,
    updateBottomLabel,
    updateLeftLabel,
    updateRightLabel,
    setMatrixType,
    addChampionsToStaging
  } = useMatrixStore();
  
  const { champions: allChampions } = useAppStore();
  
  // Set matrix type to grid when this component mounts
  React.useEffect(() => {
    setMatrixType('grid');
  }, [setMatrixType]);
  
  const [editingDirection, setEditingDirection] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);

  const gridSize = 10;
  const cellSize = 55; // Increased from 45 to 55

  // Get champions that are in grid mode only (quadrant is exactly undefined)
  const gridChampions = champions.filter(pc => pc.quadrant === undefined);

  const handleDirectionEdit = (direction: 'top' | 'bottom' | 'left' | 'right', currentLabel: string) => {
    setEditingDirection(direction);
    setEditValue(currentLabel);
  };

  const handleDirectionSave = (direction: 'top' | 'bottom' | 'left' | 'right') => {
    if (editValue.trim()) {
      switch (direction) {
        case 'top':
          updateTopLabel(editValue.trim());
          break;
        case 'bottom':
          updateBottomLabel(editValue.trim());
          break;
        case 'left':
          updateLeftLabel(editValue.trim());
          break;
        case 'right':
          updateRightLabel(editValue.trim());
          break;
      }
    }
    setEditingDirection(null);
    setEditValue('');
  };

  const handleDirectionCancel = () => {
    setEditingDirection(null);
    setEditValue('');
  };

  const handleDirectionKeyPress = (e: React.KeyboardEvent, direction: 'top' | 'bottom' | 'left' | 'right') => {
    if (e.key === 'Enter') {
      handleDirectionSave(direction);
    } else if (e.key === 'Escape') {
      handleDirectionCancel();
    }
  };

  const handleReset = () => {
    if (window.confirm('グリッドマトリクスをリセットしますか？配置されたチャンピオンも削除されます。')) {
      // Remove only grid champions (keep all quadrant mode champions)
      const { removeChampion } = useMatrixStore.getState();
      const gridChampionsToRemove = champions.filter(pc => pc.quadrant === undefined);
      gridChampionsToRemove.forEach(pc => {
        removeChampion(pc.champion.id);
      });
    }
  };

  const handleImportToStaging = (importedChampions: any[]) => {
    console.log('GridMatrix: Importing champions to staging:', importedChampions.length);
    
    // Use the new batch function for reliable import
    addChampionsToStaging(importedChampions);
    
    console.log('GridMatrix: Import completed using batch function');
  };

  // Get champion at specific position (grid mode only)
  const getChampionAt = (x: number, y: number) => {
    return gridChampions.find(pc => pc.x === x && pc.y === y);
  };

  // Render grid cells
  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col;
        const y = gridSize - 1 - row; // Flip Y axis so 0 is at bottom
        const champion = getChampionAt(x, y);
        const cellId = `grid-${x}-${y}`;

        // Highlight center dividing lines
        const isCenterX = col === Math.floor(gridSize / 2);
        const isCenterY = row === Math.floor(gridSize / 2);

        cells.push(
          <DroppableZone
            key={cellId}
            id={cellId}
            data={{ x, y, type: 'grid-cell' }}
            className="border border-gray-200 flex items-center justify-center relative cursor-pointer transition-all hover:bg-blue-50 bg-white drop-zone-grid min-h-[55px] min-w-[55px]"
            style={{ 
              width: cellSize, 
              height: cellSize,
              borderLeftWidth: isCenterX ? '3px' : '1px',
              borderLeftColor: isCenterX ? '#3b82f6' : '#e5e7eb',
              borderTopWidth: isCenterY ? '3px' : '1px', 
              borderTopColor: isCenterY ? '#3b82f6' : '#e5e7eb'
            }}
            activeClassName="bg-blue-200 border-blue-500 ring-2 ring-blue-400"
          >
            {champion && (
              <DraggableChampion
                uniqueId={`grid-${champion.champion.id}-${x}-${y}`}
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

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">グリッドマトリクス</h2>
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

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">軸ラベル設定</h3>
            
            <div className="space-y-3">
              {/* Top Label */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[60px]">上：</label>
                {editingDirection === 'top' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleDirectionKeyPress(e, 'top')}
                    onBlur={() => handleDirectionSave('top')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleDirectionEdit('top', topLabel)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    {topLabel || 'クリックして編集'}
                  </div>
                )}
              </div>

              {/* Right Label */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[60px]">右：</label>
                {editingDirection === 'right' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleDirectionKeyPress(e, 'right')}
                    onBlur={() => handleDirectionSave('right')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleDirectionEdit('right', rightLabel)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    {rightLabel || 'クリックして編集'}
                  </div>
                )}
              </div>

              {/* Left Label */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[60px]">左：</label>
                {editingDirection === 'left' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleDirectionKeyPress(e, 'left')}
                    onBlur={() => handleDirectionSave('left')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleDirectionEdit('left', leftLabel)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    {leftLabel || 'クリックして編集'}
                  </div>
                )}
              </div>

              {/* Bottom Label */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[60px]">下：</label>
                {editingDirection === 'bottom' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleDirectionKeyPress(e, 'bottom')}
                    onBlur={() => handleDirectionSave('bottom')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleDirectionEdit('bottom', bottomLabel)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
                  >
                    {bottomLabel || 'クリックして編集'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Matrix Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Top Label */}
            <div className="text-center mb-4 text-base font-semibold text-gray-700">
              {topLabel || '上'}
            </div>

            <div className="flex items-center">
              {/* Left Label */}
              <div 
                className="mr-4 text-base font-semibold text-gray-700"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                {leftLabel || '左'}
              </div>

              {/* Grid */}
              <div 
                className="grid bg-gray-50 border-2 border-gray-400"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`
                }}
              >
                {renderGrid()}
              </div>

              {/* Right Label */}
              <div 
                className="ml-4 text-base font-semibold text-gray-700"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                {rightLabel || '右'}
              </div>
            </div>

            {/* Bottom Label */}
            <div className="text-center mt-4 text-base font-semibold text-gray-700">
              {bottomLabel || '下'}
            </div>
          </div>
        </div>
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
              currentMode="matrix"
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
        配置済みチャンピオン: {gridChampions.length} 体 | 一時保存: {champions.filter(pc => pc.quadrant === 'staging').length} 体
      </div>
    </div>
  );
};