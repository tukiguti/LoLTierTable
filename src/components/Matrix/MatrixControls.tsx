import React, { useState } from 'react';

interface MatrixControlsProps {
  xAxisLabel: string;
  yAxisLabel: string;
  gridSize: { width: number; height: number };
  onXAxisLabelChange: (label: string) => void;
  onYAxisLabelChange: (label: string) => void;
  onGridSizeChange: (width: number, height: number) => void;
  onReset: () => void;
  onSave?: () => void;
  onExport?: () => void;
}

export const MatrixControls: React.FC<MatrixControlsProps> = ({
  xAxisLabel,
  yAxisLabel,
  gridSize,
  onXAxisLabelChange,
  onYAxisLabelChange,
  onGridSizeChange,
  onReset,
  onSave,
  onExport,
}) => {
  const [showSettings, setShowSettings] = useState(false);

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
        <div className="p-4 space-y-4">
          {/* Axis Labels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X軸ラベル
              </label>
              <input
                type="text"
                value={xAxisLabel}
                onChange={(e) => onXAxisLabelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 使いやすさ"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Y軸ラベル
              </label>
              <input
                type="text"
                value={yAxisLabel}
                onChange={(e) => onYAxisLabelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 強さ"
              />
            </div>
          </div>

          {/* Grid Size */}
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