import React from 'react';

interface FilterPanelProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
}

const tagLabels: Record<string, string> = {
  Assassin: 'アサシン',
  Fighter: 'ファイター',
  Mage: 'メイジ',
  Marksman: 'マークスマン',
  Support: 'サポート',
  Tank: 'タンク',
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedTags,
  onTagToggle,
  availableTags,
}) => {
  return (
    <div style={{ 
      borderBottom: '1px solid var(--color-neutral-200)', 
      padding: 'var(--space-8) var(--space-12)'
    }}>
      <h3 className="atlassian-text-caption" style={{ 
        fontWeight: 600, 
        color: 'var(--color-neutral-700)',
        marginBottom: 'var(--space-4)'
      }}>
        ロール
      </h3>
      <div className="flex flex-wrap atlassian-gap-4">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`atlassian-tag ${isSelected ? 'atlassian-tag-selected' : ''}`}
            >
              {tagLabels[tag] || tag}
            </button>
          );
        })}
      </div>
      {selectedTags.length > 0 && (
        <button
          onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
          className="atlassian-btn atlassian-btn-subtle atlassian-btn-sm"
          style={{ 
            marginTop: 'var(--space-4)',
            textDecoration: 'underline',
            color: 'var(--color-neutral-600)'
          }}
        >
          フィルターをクリア
        </button>
      )}
    </div>
  );
};