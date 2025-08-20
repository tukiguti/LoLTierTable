import React, { useState, useMemo, useCallback } from 'react';
import { useMatrixStore } from '../../store/matrixStore';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { InlineEditField } from '../shared/InlineEditField';
import { ResetButton } from '../shared/ResetButton';
import { DRAG_DROP_CONFIG, MATRIX_LABELS } from '../../utils/constants';

export const FreeboardMatrix: React.FC = React.memo(() => {
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
  } = useMatrixStore();
  
  // Set matrix type to freeboard when this component mounts
  React.useEffect(() => {
    setMatrixType('freeboard');
  }, [setMatrixType]);
  
  const [showSettings, setShowSettings] = useState(false);

  // Compact whiteboard size for better layout
  const BOARD_WIDTH = 960;
  const BOARD_HEIGHT = 640;

  // Get champions that are in freeboard mode only (quadrant is exactly undefined)
  const freeboardChampions = useMemo(
    () => champions.filter(pc => pc.quadrant === undefined),
    [champions]
  );


  const handleReset = useCallback(() => {
    // Remove only freeboard champions (keep all quadrant mode champions)
    const { removeChampion } = useMatrixStore.getState();
    const freeboardChampionsToRemove = champions.filter(pc => pc.quadrant === undefined);
    freeboardChampionsToRemove.forEach(pc => {
      removeChampion(pc.champion.id);
    });
  }, [champions]);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">フリーボード マトリクス</h2>
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
            <ResetButton
              onReset={handleReset}
              confirmMessage="フリーボードマトリクスをリセットしますか？配置されたチャンピオンも削除されます。"
            />
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
                <InlineEditField
                  value={topLabel}
                  onSave={updateTopLabel}
                  placeholder={MATRIX_LABELS.DEFAULT_TOP}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  editClassName="focus:outline-none focus:ring-2 focus:ring-blue-500"
                  displayClassName="hover:bg-gray-50 bg-white"
                />
              </div>

              {/* Right Label */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[60px]">右：</label>
                <InlineEditField
                  value={rightLabel}
                  onSave={updateRightLabel}
                  placeholder={MATRIX_LABELS.DEFAULT_RIGHT}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  editClassName="focus:outline-none focus:ring-2 focus:ring-blue-500"
                  displayClassName="hover:bg-gray-50 bg-white"
                />
              </div>

              {/* Left Label */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[60px]">左：</label>
                <InlineEditField
                  value={leftLabel}
                  onSave={updateLeftLabel}
                  placeholder={MATRIX_LABELS.DEFAULT_LEFT}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  editClassName="focus:outline-none focus:ring-2 focus:ring-blue-500"
                  displayClassName="hover:bg-gray-50 bg-white"
                />
              </div>

              {/* Bottom Label */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 min-w-[60px]">下：</label>
                <InlineEditField
                  value={bottomLabel}
                  onSave={updateBottomLabel}
                  placeholder={MATRIX_LABELS.DEFAULT_BOTTOM}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  editClassName="focus:outline-none focus:ring-2 focus:ring-blue-500"
                  displayClassName="hover:bg-gray-50 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Free Positioning Board */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Top Label */}
            <div className="text-center mb-4 text-base font-semibold text-gray-700">
              {topLabel || MATRIX_LABELS.DEFAULT_TOP}
            </div>

            <div className="flex items-center">
              {/* Left Label */}
              <div 
                className="mr-4 text-base font-semibold text-gray-700"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                {leftLabel || MATRIX_LABELS.DEFAULT_LEFT}
              </div>

              {/* Free Positioning Board */}
              <div className="relative">
                <DroppableZone
                  id={DRAG_DROP_CONFIG.DROP_ZONES.FREEBOARD_GRID}
                  data={{ type: 'freeboard' }}
                  className="bg-white relative rounded-lg"
                  style={{ 
                    width: BOARD_WIDTH, 
                    height: BOARD_HEIGHT,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  }}
                  activeClassName="bg-blue-50"
                >
                  {/* Crosshair reference lines */}
                  <div 
                    className="absolute"
                    style={{
                      left: BOARD_WIDTH / 2 - 1,
                      top: 0,
                      width: 2,
                      height: BOARD_HEIGHT,
                      backgroundColor: '#dc2626',
                      opacity: 0.6,
                      zIndex: 10,
                      pointerEvents: 'none',
                      borderLeft: '1px dashed #dc2626'
                    }}
                  />
                  <div 
                    className="absolute"
                    style={{
                      left: 0,
                      top: BOARD_HEIGHT / 2 - 1,
                      width: BOARD_WIDTH,
                      height: 2,
                      backgroundColor: '#dc2626',
                      opacity: 0.6,
                      zIndex: 10,
                      pointerEvents: 'none',
                      borderTop: '1px dashed #dc2626'
                    }}
                  />
                  {/* Center point marker */}
                  <div 
                    className="absolute rounded-full"
                    style={{
                      left: BOARD_WIDTH / 2 - 3,
                      top: BOARD_HEIGHT / 2 - 3,
                      width: 6,
                      height: 6,
                      backgroundColor: '#374151',
                      opacity: 0.8,
                      zIndex: 15,
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Positioned Champions */}
                  {freeboardChampions.map((champion) => (
                    <div
                      key={`freeboard-${champion.champion.id}`}
                      className="absolute"
                      style={{
                        left: champion.x,
                        top: champion.y,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 50
                      }}
                    >
                      <DraggableChampion
                        uniqueId={`freeboard-${champion.champion.id}`}
                        champion={champion.champion}
                        size="small"
                      />
                    </div>
                  ))}
                </DroppableZone>
              </div>

              {/* Right Label */}
              <div 
                className="ml-4 text-base font-semibold text-gray-700"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                {rightLabel || MATRIX_LABELS.DEFAULT_RIGHT}
              </div>
            </div>

            {/* Bottom Label */}
            <div className="text-center mt-4 text-base font-semibold text-gray-700">
              {bottomLabel || MATRIX_LABELS.DEFAULT_BOTTOM}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        配置済みチャンピオン: {freeboardChampions.length} 体 | 一時保存: {champions.filter(pc => pc.quadrant === 'staging').length} 体
      </div>
    </div>
  );
});