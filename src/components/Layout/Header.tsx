import React from 'react';
import type { DiagramType } from '../../types';

interface HeaderProps {
  currentMode: DiagramType;
  onModeChange: (mode: DiagramType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              LoL Tier Table
            </h1>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => onModeChange('tierlist')}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${currentMode === 'tierlist'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                ティアリスト
              </button>
              <button
                onClick={() => onModeChange('matrix')}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${currentMode === 'matrix'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                マトリクス
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};