import React from 'react';

const TEXT = {
  placeholder: '\u30c1\u30e3\u30f3\u30d4\u30aa\u30f3\u540d\u3067\u691c\u7d22',
  filterLabel: '\u30ed\u30fc\u30eb\u3067\u7d5e\u308a\u8fbc\u307f',
  clear: '\u7d5e\u308a\u8fbc\u307f\u3092\u30af\u30ea\u30a2',
} as const;

interface ChampionOperationsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTags: string[];
  availableTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  placeholder?: string;
  showTagFilter?: boolean;
  className?: string;
}

export const ChampionOperations: React.FC<ChampionOperationsProps> = ({
  searchTerm,
  onSearchChange,
  selectedTags,
  availableTags,
  onTagToggle,
  onClearFilters,
  hasActiveFilters,
  placeholder = TEXT.placeholder,
  showTagFilter = true,
  className = '',
}) => {
  return (
    <div className={`champion-operations space-y-2.5 ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 pl-9 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showTagFilter && availableTags.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-600">{TEXT.filterLabel}</div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagToggle(tag)}
                className={`rounded-full border px-3 py-1 text-[11px] transition-all ${
                  selectedTags.includes(tag)
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="text-[11px] text-slate-500 hover:text-slate-700"
          >
            {TEXT.clear}
          </button>
        </div>
      )}
    </div>
  );
};
