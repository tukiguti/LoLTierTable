import React, { useState } from 'react';

interface MatrixControlsProps {
  topLabel: string;
  bottomLabel: string;
  leftLabel: string;
  rightLabel: string;
  gridSize: { width: number; height: number };
  matrixType: 'grid' | 'scatter';
  quadrantLabels: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  onTopLabelChange: (label: string) => void;
  onBottomLabelChange: (label: string) => void;
  onLeftLabelChange: (label: string) => void;
  onRightLabelChange: (label: string) => void;
  onGridSizeChange: (width: number, height: number) => void;
  onMatrixTypeChange: (type: 'grid' | 'scatter') => void;
  onQuadrantLabelChange: (quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', label: string) => void;
  onReset: () => void;
  onSave?: () => void;
  onExport?: () => void;
}

export const MatrixControls: React.FC<MatrixControlsProps> = ({
  topLabel,
  bottomLabel,
  leftLabel,
  rightLabel,
  gridSize,
  matrixType,
  quadrantLabels,
  onTopLabelChange,
  onBottomLabelChange,
  onLeftLabelChange,
  onRightLabelChange,
  onGridSizeChange,
  onMatrixTypeChange,
  onQuadrantLabelChange,
  onReset,
  onSave,
  onExport,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'type' | 'labels' | 'grid'>('type');

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">マトリクス設定</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {showSettings && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('type')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'type'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                タイプ選択
              </button>
              <button
                onClick={() => setActiveTab('labels')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'labels'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ラベル設定
              </button>
              <button
                onClick={() => setActiveTab('grid')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'grid'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {matrixType === 'grid' ? 'グリッド設定' : 'サイズ設定'}
              </button>
            </nav>
          </div>
        </>
      )}

      {showSettings && (
        <div className="p-4">
          {/* Tab Content */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800">マトリクスタイプ選択</h4>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="matrixType"
                    value="grid"
                    checked={matrixType === 'grid'}
                    onChange={(e) => onMatrixTypeChange(e.target.value as 'grid' | 'scatter')}
                    className="mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">グリッドマトリクス</div>
                    <div className="text-xs text-gray-500">軸ベースの細かいグリッド配置</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="matrixType"
                    value="scatter"
                    checked={matrixType === 'scatter'}
                    onChange={(e) => onMatrixTypeChange(e.target.value as 'grid' | 'scatter')}
                    className="mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">4分割マトリクス</div>
                    <div className="text-xs text-gray-500">4つの領域に分けた配置</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="space-y-6">
              {/* Grid mode: Show axis labels */}
              {matrixType === 'grid' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">軸ラベル設定</h4>
                  
                  {/* Axis labels */}
                  <div className="space-y-3">
                    {/* 上 */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[120px]">上:</label>
                      <input
                        type="text"
                        value={topLabel}
                        onChange={(e) => onTopLabelChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 bg-gray-50 rounded text-sm"
                        placeholder="上"
                      />
                    </div>
                    
                    {/* 下 */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[120px]">下:</label>
                      <input
                        type="text"
                        value={bottomLabel}
                        onChange={(e) => onBottomLabelChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 bg-gray-50 rounded text-sm"
                        placeholder="下"
                      />
                    </div>
                    
                    {/* 左 */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[120px]">左:</label>
                      <input
                        type="text"
                        value={leftLabel}
                        onChange={(e) => onLeftLabelChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 bg-gray-50 rounded text-sm"
                        placeholder="左"
                      />
                    </div>
                    
                    {/* 右 */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[120px]">右:</label>
                      <input
                        type="text"
                        value={rightLabel}
                        onChange={(e) => onRightLabelChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 bg-gray-50 rounded text-sm"
                        placeholder="右"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Scatter mode: Show zone labels */}
              {matrixType === 'scatter' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">象限ラベル設定</h4>
                  
                  {/* Quadrant labels - 第一象限から順番に */}
                  <div className="space-y-3">
                    {/* 第一象限 (右上) */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-green-600 min-w-[120px]">右上 (第一象限):</label>
                      <input
                        type="text"
                        value={quadrantLabels.topRight}
                        onChange={(e) => onQuadrantLabelChange('topRight', e.target.value)}
                        className="flex-1 px-3 py-2 border border-green-300 bg-green-50 rounded text-sm"
                        placeholder="第一象限"
                      />
                    </div>
                    
                    {/* 第二象限 (左上) */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-blue-600 min-w-[120px]">左上 (第二象限):</label>
                      <input
                        type="text"
                        value={quadrantLabels.topLeft}
                        onChange={(e) => onQuadrantLabelChange('topLeft', e.target.value)}
                        className="flex-1 px-3 py-2 border border-blue-300 bg-blue-50 rounded text-sm"
                        placeholder="第二象限"
                      />
                    </div>
                    
                    {/* 第三象限 (左下) */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-purple-600 min-w-[120px]">左下 (第三象限):</label>
                      <input
                        type="text"
                        value={quadrantLabels.bottomLeft}
                        onChange={(e) => onQuadrantLabelChange('bottomLeft', e.target.value)}
                        className="flex-1 px-3 py-2 border border-purple-300 bg-purple-50 rounded text-sm"
                        placeholder="第三象限"
                      />
                    </div>
                    
                    {/* 第四象限 (右下) */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-red-600 min-w-[120px]">右下 (第四象限):</label>
                      <input
                        type="text"
                        value={quadrantLabels.bottomRight}
                        onChange={(e) => onQuadrantLabelChange('bottomRight', e.target.value)}
                        className="flex-1 px-3 py-2 border border-red-300 bg-red-50 rounded text-sm"
                        placeholder="第四象限"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grid' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800">
                {matrixType === 'grid' ? 'グリッドサイズ設定' : '象限サイズ設定'}
              </h4>
              
              {matrixType === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      幅 (5-20)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={gridSize.width}
                      onChange={(e) => onGridSizeChange(parseInt(e.target.value), gridSize.height)}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">{gridSize.width}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      高さ (5-20)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={gridSize.height}
                      onChange={(e) => onGridSizeChange(gridSize.width, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">{gridSize.height}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      各ゾーンのサイズ (3-10)
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={Math.floor(gridSize.width / 2)}
                      onChange={(e) => {
                        const zoneSize = parseInt(e.target.value);
                        onGridSizeChange(zoneSize * 2, zoneSize * 2);
                      }}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {Math.floor(gridSize.width / 2)} × {Math.floor(gridSize.width / 2)} 
                      (全体: {gridSize.width} × {gridSize.width})
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">ゾーン構成：</p>
                    <p>• 右上: ゾーン1 ({Math.floor(gridSize.width / 2)} × {Math.floor(gridSize.width / 2)})</p>
                    <p>• 左上: ゾーン2 ({Math.floor(gridSize.width / 2)} × {Math.floor(gridSize.width / 2)})</p>
                    <p>• 左下: ゾーン3 ({Math.floor(gridSize.width / 2)} × {Math.floor(gridSize.width / 2)})</p>
                    <p>• 右下: ゾーン4 ({Math.floor(gridSize.width / 2)} × {Math.floor(gridSize.width / 2)})</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 flex justify-between">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-base font-medium"
        >
          リセット
        </button>

        <div className="flex gap-3">
          {onExport && (
            <button
              onClick={onExport}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-base font-medium"
            >
              画像で保存
            </button>
          )}
          
          {onSave && (
            <button
              onClick={onSave}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-base font-medium"
            >
              保存
            </button>
          )}
        </div>
      </div>
    </div>
  );
};