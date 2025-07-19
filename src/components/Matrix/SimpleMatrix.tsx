import React, { useState } from 'react';
import { useMatrixStore } from '../../store/matrixStore';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { QuadrantGrid } from './QuadrantGrid';

export const SimpleMatrix: React.FC = () => {
  const { 
    champions, 
    resetMatrix,
    topLabel,
    bottomLabel,
    leftLabel,
    rightLabel,
    updateTopLabel,
    updateBottomLabel,
    updateLeftLabel,
    updateRightLabel,
    matrixType,
    setMatrixType,
    quadrantLabels,
    updateQuadrantLabel
  } = useMatrixStore();
  
  const [editingDirection, setEditingDirection] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingQuadrant, setEditingQuadrant] = useState<string | null>(null);

  const gridSize = 10; // 10x10 grid for more space
  const cellSize = 45; // Slightly smaller cells to fit better


  const handleQuadrantEdit = (quadrant: string, currentLabel: string) => {
    setEditingQuadrant(quadrant);
    setEditValue(currentLabel);
  };

  const handleQuadrantSave = (quadrant: string) => {
    if (editValue.trim()) {
      updateQuadrantLabel(quadrant as 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', editValue.trim());
    }
    setEditingQuadrant(null);
    setEditValue('');
  };

  const handleQuadrantCancel = () => {
    setEditingQuadrant(null);
    setEditValue('');
  };

  const handleQuadrantKeyPress = (e: React.KeyboardEvent, quadrant: string) => {
    if (e.key === 'Enter') {
      handleQuadrantSave(quadrant);
    } else if (e.key === 'Escape') {
      handleQuadrantCancel();
    }
  };

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
    if (window.confirm('マトリクスをリセットしますか？配置されたチャンピオンも削除されます。')) {
      resetMatrix();
    }
  };

  // Get champion at specific position
  const getChampionAt = (x: number, y: number) => {
    return champions.find(pc => pc.x === x && pc.y === y);
  };

  // Render grid cells
  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col;
        const y = gridSize - 1 - row; // Flip Y axis so 0 is at bottom
        const champion = getChampionAt(x, y);
        const cellId = `matrix-${x}-${y}`;

        // Highlight center dividing lines (for 10x10 grid: between 4-5 and 5-6)
        const isCenterRightX = x === gridSize / 2; // x === 5
        const isCenterTopY = y === gridSize / 2;   // y === 5

        cells.push(
          <DroppableZone
            key={cellId}
            id={cellId}
            data={{ x, y, type: 'matrix-cell' }}
            className={`
              border border-gray-300 flex items-center justify-center relative cursor-pointer
              transition-all hover:bg-blue-50 bg-white
              ${isCenterRightX ? 'border-l-4 border-l-blue-500' : ''}
              ${isCenterTopY ? 'border-b-4 border-b-blue-500' : ''}
            `}
            style={{ width: cellSize, height: cellSize }}
            activeClassName="bg-blue-200 border-blue-500"
          >
            {champion && (
              <DraggableChampion
                uniqueId={`matrix-${champion.champion.id}-${x}-${y}`}
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
          <h2 className="text-lg font-semibold text-gray-900">マトリクス分析</h2>
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
            {/* Matrix Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                マトリクスタイプ
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="matrixType"
                    value="grid"
                    checked={matrixType === 'grid'}
                    onChange={() => setMatrixType('grid')}
                    className="mr-2"
                  />
                  <span className="text-sm">グリッドマトリクス</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="matrixType"
                    value="quadrant"
                    checked={matrixType === 'quadrant'}
                    onChange={() => setMatrixType('quadrant')}
                    className="mr-2"
                  />
                  <span className="text-sm">4分割マトリクス</span>
                </label>
              </div>
            </div>

            {/* Grid Matrix Settings */}
            {matrixType === 'grid' && (
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-4">グリッドマトリクス設定</h3>
                
                {/* Direction Labels in 2x2 Grid Layout */}
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Top Row */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <label className="text-sm font-medium text-gray-700">上ラベル</label>
                      </div>
                      {editingDirection === 'top' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleDirectionKeyPress(e, 'top')}
                          onBlur={() => handleDirectionSave('top')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                          placeholder="例: 難しい"
                        />
                      ) : (
                        <div
                          onClick={() => handleDirectionEdit('top', topLabel)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors bg-gray-100 min-h-[42px] flex items-center"
                        >
                          <span className={topLabel ? 'text-gray-900' : 'text-gray-500'}>
                            {topLabel || 'クリックして編集'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <label className="text-sm font-medium text-gray-700">右ラベル</label>
                      </div>
                      {editingDirection === 'right' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleDirectionKeyPress(e, 'right')}
                          onBlur={() => handleDirectionSave('right')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                          placeholder="例: 攻撃的"
                        />
                      ) : (
                        <div
                          onClick={() => handleDirectionEdit('right', rightLabel)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors bg-gray-100 min-h-[42px] flex items-center"
                        >
                          <span className={rightLabel ? 'text-gray-900' : 'text-gray-500'}>
                            {rightLabel || 'クリックして編集'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <label className="text-sm font-medium text-gray-700">左ラベル</label>
                      </div>
                      {editingDirection === 'left' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleDirectionKeyPress(e, 'left')}
                          onBlur={() => handleDirectionSave('left')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                          placeholder="例: 守備的"
                        />
                      ) : (
                        <div
                          onClick={() => handleDirectionEdit('left', leftLabel)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors bg-gray-100 min-h-[42px] flex items-center"
                        >
                          <span className={leftLabel ? 'text-gray-900' : 'text-gray-500'}>
                            {leftLabel || 'クリックして編集'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <label className="text-sm font-medium text-gray-700">下ラベル</label>
                      </div>
                      {editingDirection === 'bottom' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleDirectionKeyPress(e, 'bottom')}
                          onBlur={() => handleDirectionSave('bottom')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                          placeholder="例: 簡単"
                        />
                      ) : (
                        <div
                          onClick={() => handleDirectionEdit('bottom', bottomLabel)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors bg-gray-100 min-h-[42px] flex items-center"
                        >
                          <span className={bottomLabel ? 'text-gray-900' : 'text-gray-500'}>
                            {bottomLabel || 'クリックして編集'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="mt-4 text-xs text-gray-600 text-center">
                    各ラベルをクリックして編集できます。Enterで確定、Escでキャンセル
                  </div>
                </div>
              </div>
            )}

            {/* Quadrant Matrix Settings */}
            {matrixType === 'quadrant' && (
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-4">4分割マトリクス設定</h3>
                
                {/* Quadrant Labels in Visual 2x2 Layout */}
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {/* 上段: 第1象限（右上）| 第2象限（左上） */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-green-700">1</span>
                        </div>
                        <label className="text-sm font-medium text-gray-700">第1象限（右上）</label>
                      </div>
                      {editingQuadrant === 'topRight' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleQuadrantKeyPress(e, 'topRight')}
                          onBlur={() => handleQuadrantSave('topRight')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                          placeholder="例: 理想的"
                        />
                      ) : (
                        <div
                          onClick={() => handleQuadrantEdit('topRight', quadrantLabels.topRight)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors bg-green-50 min-h-[42px] flex items-center"
                        >
                          <span className={quadrantLabels.topRight ? 'text-gray-900' : 'text-gray-500'}>
                            {quadrantLabels.topRight || 'クリックして編集'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-700">2</span>
                        </div>
                        <label className="text-sm font-medium text-gray-700">第2象限（左上）</label>
                      </div>
                      {editingQuadrant === 'topLeft' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleQuadrantKeyPress(e, 'topLeft')}
                          onBlur={() => handleQuadrantSave('topLeft')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                          placeholder="例: 高コスト・強力"
                        />
                      ) : (
                        <div
                          onClick={() => handleQuadrantEdit('topLeft', quadrantLabels.topLeft)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors bg-blue-50 min-h-[42px] flex items-center"
                        >
                          <span className={quadrantLabels.topLeft ? 'text-gray-900' : 'text-gray-500'}>
                            {quadrantLabels.topLeft || 'クリックして編集'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 下段: 第4象限（右下）| 第3象限（左下） */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-100 border border-red-300 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-red-700">4</span>
                        </div>
                        <label className="text-sm font-medium text-gray-700">第4象限（右下）</label>
                      </div>
                      {editingQuadrant === 'bottomRight' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleQuadrantKeyPress(e, 'bottomRight')}
                          onBlur={() => handleQuadrantSave('bottomRight')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                          placeholder="例: 低コスト・強力"
                        />
                      ) : (
                        <div
                          onClick={() => handleQuadrantEdit('bottomRight', quadrantLabels.bottomRight)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors bg-red-50 min-h-[42px] flex items-center"
                        >
                          <span className={quadrantLabels.bottomRight ? 'text-gray-900' : 'text-gray-500'}>
                            {quadrantLabels.bottomRight || 'クリックして編集'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-700">3</span>
                        </div>
                        <label className="text-sm font-medium text-gray-700">第3象限（左下）</label>
                      </div>
                      {editingQuadrant === 'bottomLeft' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleQuadrantKeyPress(e, 'bottomLeft')}
                          onBlur={() => handleQuadrantSave('bottomLeft')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                          placeholder="例: 低コスト・弱い"
                        />
                      ) : (
                        <div
                          onClick={() => handleQuadrantEdit('bottomLeft', quadrantLabels.bottomLeft)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors bg-purple-50 min-h-[42px] flex items-center"
                        >
                          <span className={quadrantLabels.bottomLeft ? 'text-gray-900' : 'text-gray-500'}>
                            {quadrantLabels.bottomLeft || 'クリックして編集'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="mt-4 text-xs text-gray-600 text-center">
                    各象限ラベルをクリックして編集できます。Enterで確定、Escでキャンセル
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Matrix Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {matrixType === 'grid' ? (
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Top Label */}
              <div className="text-center mb-4 text-base font-semibold text-gray-700">
                {topLabel || '上'}
              </div>

              <div className="flex items-center">
                {/* Left Label */}
                <div 
                  className="mr-4 text-base font-semibold text-gray-700 writing-mode-vertical-rl transform -rotate-180"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  {leftLabel || '左'}
                </div>

                {/* Grid container with cross lines */}
                <div className="relative">
                  {/* Grid */}
                  <div 
                    className="grid border-2 border-gray-400 bg-gray-50 shadow-sm relative"
                    style={{
                      gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                      gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`
                    }}
                  >
                    {renderGrid()}
                  </div>

                  {/* Cross lines overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `
                        linear-gradient(to right, transparent ${(gridSize/2 * cellSize) - 1}px, #3b82f6 ${(gridSize/2 * cellSize) - 1}px, #3b82f6 ${(gridSize/2 * cellSize) + 1}px, transparent ${(gridSize/2 * cellSize) + 1}px),
                        linear-gradient(to bottom, transparent ${(gridSize/2 * cellSize) - 1}px, #3b82f6 ${(gridSize/2 * cellSize) - 1}px, #3b82f6 ${(gridSize/2 * cellSize) + 1}px, transparent ${(gridSize/2 * cellSize) + 1}px)
                      `
                    }}
                  />
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
        ) : (
          <QuadrantGrid
            champions={champions}
            topLabel=""
            bottomLabel=""
            leftLabel=""
            rightLabel=""
            quadrantLabels={quadrantLabels}
            quadrantSize={5}
            cellSize={55}
          />
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
        配置済みチャンピオン: {champions.length} 体
      </div>
    </div>
  );
};