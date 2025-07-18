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
    <div className="border-b border-gray-200 pb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">ロール</h3>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${isSelected
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }
              `}
            >
              {tagLabels[tag] || tag}
            </button>
          );
        })}
      </div>
      {selectedTags.length > 0 && (
        <button
          onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          フィルターをクリア
        </button>
      )}
    </div>
  );
};