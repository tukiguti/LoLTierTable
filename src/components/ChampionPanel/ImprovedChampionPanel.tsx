import React, { useState, useMemo } from 'react';
import type { Champion } from '../../types';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { ChampionPanelControls } from './ChampionPanelControls';
import { VirtualizedChampionGrid } from './VirtualizedChampionGrid';
import { VirtualizedChampionList } from './VirtualizedChampionList';

interface ImprovedChampionPanelProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
  searchFilter: string;
  onSearchChange: (filter: string) => void;
  className?: string;
  containerHeight?: number;
}

export const ImprovedChampionPanel: React.FC<ImprovedChampionPanelProps> = ({
  champions,
  onChampionSelect,
  searchFilter,
  onSearchChange,
  className = '',
  containerHeight = 350,  // デフォルトを300→350に調整
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [iconSize, setIconSize] = useState(48);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    champions.forEach(champion => {
      champion.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [champions]);

  const filteredChampions = useMemo(() => {
    return champions.filter(champion => {
      // Text search filter
      const matchesSearch = champion.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                           champion.title.toLowerCase().includes(searchFilter.toLowerCase());

      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => champion.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [champions, searchFilter, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
    onChampionSelect(champion);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    onSearchChange('');
  };

  return (
    <div className={`flex flex-col h-full atlassian-card ${className}`}>
      {/* 検索バー */}
      <div className="flex-shrink-0 atlassian-surface" style={{ 
        padding: 'var(--space-8) var(--space-12)', 
        borderBottom: '1px solid var(--color-neutral-200)' 
      }}>
        <SearchBar
          value={searchFilter}
          onChange={onSearchChange}
          placeholder="チャンピオン名で検索..."
        />
        
        {/* フィルターボタン */}
        <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-4)' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`atlassian-btn atlassian-btn-sm ${
              showFilters || selectedTags.length > 0
                ? 'atlassian-btn-primary'
                : 'atlassian-btn-secondary'
            }`}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            フィルター {selectedTags.length > 0 && `(${selectedTags.length})`}
          </button>
          
          {(selectedTags.length > 0 || searchFilter) && (
            <button
              onClick={handleClearFilters}
              className="atlassian-btn atlassian-btn-subtle atlassian-btn-sm"
              style={{ color: 'var(--color-danger)' }}
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="flex-shrink-0">
          <FilterPanel
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />
        </div>
      )}

      {/* コントロールパネル */}
      <div className="flex-shrink-0">
        <ChampionPanelControls
          iconSize={iconSize}
          onIconSizeChange={setIconSize}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalChampions={champions.length}
          filteredChampions={filteredChampions.length}
        />
      </div>

      {/* チャンピオン表示エリア */}
      <div className="flex-1 min-h-0 atlassian-surface-sunken">
        {viewMode === 'grid' ? (
          <VirtualizedChampionGrid
            champions={filteredChampions}
            onChampionSelect={handleChampionSelect}
            selectedChampion={selectedChampion}
            containerHeight={containerHeight}
            iconSize={iconSize}
          />
        ) : (
          <VirtualizedChampionList
            champions={filteredChampions}
            onChampionSelect={handleChampionSelect}
            selectedChampion={selectedChampion}
            containerHeight={containerHeight}
            iconSize={iconSize}
          />
        )}
      </div>
    </div>
  );
};