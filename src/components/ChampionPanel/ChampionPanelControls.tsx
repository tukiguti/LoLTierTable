import React from 'react';

interface ChampionPanelControlsProps {
  iconSize: number;
  onIconSizeChange: (size: number) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalChampions: number;
  filteredChampions: number;
}

export const ChampionPanelControls: React.FC<ChampionPanelControlsProps> = ({
  iconSize,
  onIconSizeChange,
  viewMode,
  onViewModeChange,
  totalChampions,
  filteredChampions,
}) => {
  return (
    <div className="atlassian-surface" style={{ padding: 'var(--space-8) var(--space-12)', borderBottom: '1px solid var(--color-neutral-200)' }}>
      {/* 表示統計 */}
      <div className="flex justify-between items-center atlassian-text-caption" style={{ marginBottom: 'var(--space-8)' }}>
        <span style={{ color: 'var(--color-neutral-600)' }}>{filteredChampions} / {totalChampions} 体表示中</span>
        <span style={{ color: 'var(--color-neutral-600)' }}>サイズ: {iconSize}px</span>
      </div>

      {/* アイコンサイズ調整 */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <label className="atlassian-text-caption" style={{ 
          display: 'block', 
          fontWeight: 600, 
          color: 'var(--color-neutral-700)',
          marginBottom: 'var(--space-4)'
        }}>
          アイコンサイズ
        </label>
        <div className="flex items-center atlassian-gap-8">
          <span className="atlassian-text-caption atlassian-text-subtle" style={{ width: '32px', textAlign: 'center' }}>小</span>
          <input
            type="range"
            min="32"
            max="80"
            step="8"
            value={iconSize}
            onChange={(e) => onIconSizeChange(parseInt(e.target.value))}
            className="atlassian-slider flex-1"
          />
          <span className="atlassian-text-caption atlassian-text-subtle" style={{ width: '32px', textAlign: 'center' }}>大</span>
        </div>
        <div className="flex justify-between atlassian-text-caption" style={{ 
          marginTop: 'var(--space-4)', 
          color: 'var(--color-neutral-400)' 
        }}>
          <span>32px</span>
          <span>48px</span>
          <span>64px</span>
          <span>80px</span>
        </div>
      </div>

      {/* 表示モード切替 */}
      <div className="flex atlassian-gap-4" style={{ 
        backgroundColor: 'var(--color-neutral-100)', 
        borderRadius: 'var(--border-radius-4)', 
        padding: 'var(--space-4)' 
      }}>
        <button
          onClick={() => onViewModeChange('grid')}
          className={`atlassian-btn atlassian-btn-sm ${
            viewMode === 'grid' ? 'atlassian-btn-primary' : 'atlassian-btn-subtle'
          }`}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          グリッド
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`atlassian-btn atlassian-btn-sm ${
            viewMode === 'list' ? 'atlassian-btn-primary' : 'atlassian-btn-subtle'
          }`}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          リスト
        </button>
      </div>
    </div>
  );
};