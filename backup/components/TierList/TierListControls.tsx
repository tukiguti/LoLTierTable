import React from 'react';

interface TierListControlsProps {
  onAddTier: () => void;
  onReset: () => void;
  onSave: () => void;
  onExport: () => void;
  canSave?: boolean;
}

export const TierListControls: React.FC<TierListControlsProps> = ({
  onAddTier,
  onReset,
  onSave,
  onExport,
  canSave = true,
}) => {
  return (
    <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex gap-3">
        <button
          onClick={onAddTier}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base font-medium"
        >
          + ティア追加
        </button>
        
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-base font-medium"
        >
          リセット
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onExport}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-base font-medium"
        >
          画像で保存
        </button>
        
        {canSave && (
          <button
            onClick={onSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-base font-medium"
          >
            保存
          </button>
        )}
      </div>
    </div>
  );
};