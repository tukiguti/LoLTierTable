import React, { type ReactNode } from 'react';
import { useResizable } from '../../hooks/useResizable';
import { useVerticalResizable } from '../../hooks/useVerticalResizable';
import { Resizer } from './Resizer';

interface ResizableThreePaneLayoutProps {
  leftTopPane: ReactNode;
  rightTopPane: ReactNode;
  bottomPane: ReactNode;
  leftTopTitle?: string;
  rightTopTitle?: string;
  bottomTitle?: string;
}

export const ResizableThreePaneLayout: React.FC<ResizableThreePaneLayoutProps> = ({
  leftTopPane,
  rightTopPane,
  bottomPane,
  leftTopTitle,
  rightTopTitle,
  bottomTitle,
}) => {
  // 水平リサイザー（左右分割）
  const {
    size: leftPaneWidth,
    isResizing: isHorizontalResizing,
    handleMouseDown: handleHorizontalMouseDown,
    resetSize: resetHorizontalSize
  } = useResizable({
    defaultSize: 300,  // 320→300にさらに縮小
    minSize: 250,
    maxSize: 450,     // 500→450に縮小
    storageKey: 'leftPaneWidth'
  });

  // 垂直リサイザー（上下分割）
  const {
    size: bottomPaneHeight,
    isResizing: isVerticalResizing,
    handleMouseDown: handleVerticalMouseDown,
    resetSize: resetVerticalSize
  } = useVerticalResizable({
    defaultSize: 320,  // 240→320に大幅増加（一時設置エリアを十分に表示）
    minSize: 200,     // 180→200に増加
    maxSize: 500,     // 400→500に増加
    storageKey: 'bottomPaneHeight'
  });

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
      {/* Top Section - Split into Left and Right */}
      <div 
        className="flex-1 flex" 
        style={{ 
          height: `calc(100% - ${bottomPaneHeight}px)`,
          minHeight: '250px'  // 上部セクションの最小高さを縮小
        }}
      >
        {/* Left Top Pane */}
        <div 
          className="flex flex-col min-h-0 atlassian-surface"
          style={{ 
            width: leftPaneWidth,
            borderRight: '1px solid var(--color-neutral-200)'
          }}
        >
          {leftTopTitle && (
            <div className="flex-shrink-0" style={{ 
              padding: 'var(--space-8) var(--space-12)', 
              borderBottom: '1px solid var(--color-neutral-200)' 
            }}>
              <h2 className="atlassian-text-body" style={{ 
                color: 'var(--color-neutral-900)',
                fontWeight: 600,
                fontSize: 'var(--font-size-16)'
              }}>
                {leftTopTitle}
              </h2>
            </div>
          )}
          <div className="flex-1 overflow-auto" style={{ padding: 'var(--space-4)' }}>
            {leftTopPane}
          </div>
        </div>

        {/* Horizontal Resizer */}
        <Resizer
          direction="horizontal"
          onMouseDown={handleHorizontalMouseDown}
          isResizing={isHorizontalResizing}
          onReset={resetHorizontalSize}
          showResetButton={true}
        />

        {/* Right Top Pane */}
        <div className="flex-1 flex flex-col min-h-0 atlassian-surface">
          {rightTopTitle && (
            <div className="flex-shrink-0" style={{ 
              padding: 'var(--space-8) var(--space-12)', 
              borderBottom: '1px solid var(--color-neutral-200)' 
            }}>
              <h2 className="atlassian-text-body" style={{ 
                color: 'var(--color-neutral-900)',
                fontWeight: 600,
                fontSize: 'var(--font-size-16)'
              }}>
                {rightTopTitle}
              </h2>
            </div>
          )}
          <div className="flex-1 overflow-auto" style={{ padding: 'var(--space-4)' }}>
            {rightTopPane}
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

      {/* Bottom Section - Staging Area & Presets */}
      <div 
        className="flex-shrink-0 atlassian-surface"
        style={{ 
          height: bottomPaneHeight,
          borderTop: '1px solid var(--color-neutral-200)',
          minHeight: '200px'  // 一時設置エリアの最小高さを確保
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