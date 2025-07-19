import React, { useState, useMemo } from 'react';
import type { Champion } from '../../types';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { ChampionGrid } from './ChampionGrid';

interface ChampionPanelProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
  searchFilter: string;
  onSearchChange: (filter: string) => void;
  className?: string;
}

export const ChampionPanel: React.FC<ChampionPanelProps> = ({
  champions,
  onChampionSelect,
  searchFilter,
  onSearchChange,
  className = '',
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

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

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">チャンピオン選択</h2>
        
        <div className="space-y-4">
          <SearchBar
            value={searchFilter}
            onChange={onSearchChange}
            placeholder="チャンピオン名で検索..."
          />
          
          <FilterPanel
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            availableTags={availableTags}
          />
        </div>

        <div className="mt-4 text-sm text-gray-500">
          {filteredChampions.length} / {champions.length} チャンピオン
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <ChampionGrid
          champions={filteredChampions}
          onChampionSelect={handleChampionSelect}
          selectedChampion={selectedChampion}
        />
      </div>
    </div>
  );
};