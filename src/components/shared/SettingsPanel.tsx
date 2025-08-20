import React from 'react';

export interface SettingsPanelProps {
  title: string;
  isVisible: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  title,
  isVisible,
  onToggle,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              isVisible 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isVisible ? '設定を隠す' : '設定を表示'}
          </button>
        </div>
      </div>

      {isVisible && (
        <div className="space-y-4 border-t pt-4">
          {children}
        </div>
      )}
    </div>
  );
};