import React, { useState } from 'react';
import { useMatrixStore } from '../../store/matrixStore';
import { QuadrantGrid } from './QuadrantGrid';
import { DroppableZone } from '../DragDrop/DroppableZone';

export const QuadrantMatrix: React.FC = () => {
  const { 
    champions, 
    resetMatrix,
    quadrantLabels,
    updateQuadrantLabel,
    setMatrixType
  } = useMatrixStore();
  
  // Set matrix type to quadrant when this component mounts
  React.useEffect(() => {
    setMatrixType('quadrant');
  }, [setMatrixType]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [editingQuadrant, setEditingQuadrant] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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

  const handleReset = () => {
    if (window.confirm('4分割マトリクスをリセットしますか？配置されたチャンピオンも削除されます。')) {
      // Remove only quadrant mode champions (keep grid mode champions)
      const { removeChampion } = useMatrixStore.getState();
      const quadrantChampionsToRemove = champions.filter(pc => pc.quadrant !== undefined);
      quadrantChampionsToRemove.forEach(pc => {
        removeChampion(pc.champion.id);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">4分割マトリクス</h2>
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
            <h3 className="text-md font-medium text-gray-800 mb-4">4分割マトリクス設定</h3>
            
            {/* Quadrant Labels in Visual 2x2 Layout */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {/* 上段: 1 | 2 */}
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

                {/* 下段: 3 | 4 */}
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
              </div>
              
              {/* Instructions */}
              <div className="mt-4 text-xs text-gray-600 text-center">
                各象限ラベルをクリックして編集できます。Enterで確定、Escでキャンセル
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quadrant Matrix Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
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
        配置済みチャンピオン: {champions.filter(pc => pc.quadrant !== undefined).length} 体
      </div>
    </div>
  );
};