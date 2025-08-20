import React, { type ReactNode } from 'react';

interface ThreePaneLayoutProps {
  leftTopPane: ReactNode;
  rightTopPane: ReactNode;
  bottomPane: ReactNode;
  leftTopTitle?: string;
  rightTopTitle?: string;
  bottomTitle?: string;
}

export const ThreePaneLayout: React.FC<ThreePaneLayoutProps> = ({
  leftTopPane,
  rightTopPane,
  bottomPane,
  leftTopTitle,
  rightTopTitle,
  bottomTitle,
}) => {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Section - Split into Left and Right */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left Top Pane - Champion Icons/Panel */}
        <div className="w-1/2 flex flex-col min-h-0">
          {leftTopTitle && (
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{leftTopTitle}</h2>
          )}
          <div className="flex-1 overflow-auto">
            {leftTopPane}
          </div>
        </div>

        {/* Right Top Pane - Main Content Area */}
        <div className="w-1/2 flex flex-col min-h-0">
          {rightTopTitle && (
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{rightTopTitle}</h2>
          )}
          <div className="flex-1 overflow-auto">
            {rightTopPane}
          </div>
        </div>
      </div>

      {/* Bottom Section - Staging Area & Presets */}
      <div className="h-80 border-t border-gray-200 bg-white">
        <div className="h-full flex flex-col p-4">
          {bottomTitle && (
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{bottomTitle}</h2>
          )}
          <div className="flex-1 overflow-auto">
            {bottomPane}
          </div>
        </div>
      </div>
    </div>
  );
};