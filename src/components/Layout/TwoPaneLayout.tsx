import React, { type ReactNode } from 'react';
import { useVerticalResizable } from '../../hooks/useVerticalResizable';
import { Resizer } from './Resizer';

interface TwoPaneLayoutProps {
  topPane: ReactNode;
  bottomPane: ReactNode;
  topTitle?: string;
  bottomTitle?: string;
}

export const TwoPaneLayout: React.FC<TwoPaneLayoutProps> = ({
  topPane,
  bottomPane,
  topTitle,
  bottomTitle,
}) => {
  // 垂直リサイザー（上下分割）
  const {
    size: bottomPaneHeight,
    isResizing: isVerticalResizing,
    handleMouseDown: handleVerticalMouseDown,
    resetSize: resetVerticalSize
  } = useVerticalResizable({
    defaultSize: 350,  // 下部エリアをしっかり確保
    minSize: 250,     // 最小でも十分な高さ
    maxSize: 600,     // 最大値も余裕を持って
    storageKey: 'bottomPaneHeight_v2'
  });

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
      {/* Top Section - Main Work Area */}
      <div 
        className="flex-1 flex flex-col" 
        style={{ 
          height: `calc(100% - ${bottomPaneHeight}px)`,
          minHeight: '200px'  // 上部の最小高さ
        }}
      >
        <div className="flex-1 flex flex-col min-h-0 atlassian-surface">
          {topTitle && (
            <div className="flex-shrink-0" style={{ 
              padding: 'var(--space-8) var(--space-12)', 
              borderBottom: '1px solid var(--color-neutral-200)' 
            }}>
              <h2 className="atlassian-text-body" style={{ 
                color: 'var(--color-neutral-900)',
                fontWeight: 600,
                fontSize: 'var(--font-size-16)'
              }}>
                {topTitle}
              </h2>
            </div>
          )}
          <div className="flex-1 overflow-auto" style={{ padding: 'var(--space-4)' }}>
            {topPane}
          </div>
        </div>
      </div>

      {/* Vertical Resizer */}
      <Resizer
        direction="vertical"
        onMouseDown={handleVerticalMouseDown}
        isResizing={isVerticalResizing}
        onReset={resetVerticalSize}
        showResetButton={true}
      />

      {/* Bottom Section - Champion Selection & Staging Area */}
      <div 
        className="flex-shrink-0 atlassian-surface"
        style={{ 
          height: bottomPaneHeight,
          borderTop: '1px solid var(--color-neutral-200)',
          minHeight: '250px'  // 下部エリアの最小高さを確保
        }}
      >
        <div className="h-full flex flex-col">
          {bottomTitle && (
            <div className="flex-shrink-0" style={{ 
              padding: 'var(--space-8) var(--space-12)', 
              borderBottom: '1px solid var(--color-neutral-200)' 
            }}>
              <h2 className="atlassian-text-body" style={{ 
                color: 'var(--color-neutral-900)',
                fontWeight: 600,
                fontSize: 'var(--font-size-16)'
              }}>
                {bottomTitle}
              </h2>
            </div>
          )}
          <div className="flex-1 overflow-auto" style={{ padding: 'var(--space-4)' }}>
            {bottomPane}
          </div>
        </div>
      </div>
    </div>
  );
};