import React from 'react';

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
  placeholder = "Search champions...",
  showTagFilter = true,
  className = ''
}) => {
  return (
    <div className={`champion-operations space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tag Filter */}
      {showTagFilter && availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Filter by role:</div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};