import React, { type ReactNode } from 'react';

interface ThreeStackLayoutProps {
  topPane: ReactNode;
  middlePane: ReactNode;
  bottomPane: ReactNode;
  topTitle?: string;
  middleTitle?: string;
  bottomTitle?: string;
}

export const ThreeStackLayout: React.FC<ThreeStackLayoutProps> = ({
  topPane,
  middlePane,
  bottomPane,
  topTitle,
  middleTitle,
  bottomTitle,
}) => {
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
      {/* Top Section - Main Work Area (ティアリスト) */}
      <div 
        className="flex-1 flex flex-col atlassian-surface"
        style={{ 
          minHeight: '300px'
        }}
      >
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
        <div className="flex-1" style={{ padding: 'var(--space-4)', overflow: 'hidden' }}>
          {topPane}
        </div>
      </div>

      {/* Bottom Section - Combined Middle and Bottom (統合されたエリア) */}
      <div 
        className="flex-shrink-0 atlassian-surface"
        style={{ 
          height: '350px', // 一時設置(150px) + チャンピオン選択(200px)の合計を調整
          borderTop: '1px solid var(--color-neutral-200)',
          minHeight: '250px'
        }}
      >
        <div className="h-full flex flex-col">
          {/* 一時設置エリア（上部） */}
          <div 
            className="flex-shrink-0"
            style={{
              height: '120px',
              borderBottom: '1px solid var(--color-neutral-200)'
            }}
          >
            {middleTitle && (
              <div className="flex-shrink-0" style={{ 
                padding: 'var(--space-2) var(--space-4)', 
                borderBottom: '1px solid var(--color-neutral-200)',
                height: '32px'
              }}>
                <h3 className="atlassian-text-caption" style={{ 
                  color: 'var(--color-neutral-900)',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-12)'
                }}>
                  {middleTitle}
                </h3>
              </div>
            )}
            <div style={{ 
              height: middleTitle ? '88px' : '120px',
              padding: 'var(--space-2)', 
              overflow: 'hidden' 
            }}>
              {middlePane}
            </div>
          </div>

          {/* チャンピオン選択エリア（下部） */}
          <div className="flex-1">
            {bottomTitle && (
              <div className="flex-shrink-0" style={{ 
                padding: 'var(--space-2) var(--space-4)', 
                borderBottom: '1px solid var(--color-neutral-200)',
                height: '32px'
              }}>
                <h3 className="atlassian-text-caption" style={{ 
                  color: 'var(--color-neutral-900)',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-12)'
                }}>
                  {bottomTitle}
                </h3>
              </div>
            )}
            <div style={{ 
              height: bottomTitle ? 'calc(100% - 32px)' : '100%',
              padding: 'var(--space-2)', 
              overflow: 'hidden' 
            }}>
              {bottomPane}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};