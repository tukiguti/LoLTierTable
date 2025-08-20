import React, { useState } from 'react';
import type { Champion } from '../../types';
import { StagingAreaPanel } from '../StagingArea/StagingAreaPanel';
import { ChampionPresetSelector } from '../ChampionPresets/ChampionPresetSelector';
import { VirtualizedChampionGrid } from '../ChampionPanel/VirtualizedChampionGrid';
import { SearchBar } from '../ChampionPanel/SearchBar';
import { FilterPanel } from '../ChampionPanel/FilterPanel';

interface IntegratedChampionAreaProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
}

export const IntegratedChampionArea: React.FC<IntegratedChampionAreaProps> = ({
  champions,
  onChampionSelect,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'staging' | 'presets' | 'search'>('staging');

  // フィルタリングされたチャンピオン
  const availableTags = React.useMemo(() => {
    const tags = new Set<string>();
    champions.forEach(champion => {
      champion.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [champions]);

  const filteredChampions = React.useMemo(() => {
    return champions.filter(champion => {
      const matchesSearch = champion.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                           champion.title.toLowerCase().includes(searchFilter.toLowerCase());
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
    setSearchFilter('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* タブナビゲーション */}
      <div className="flex-shrink-0" style={{ 
        borderBottom: '1px solid var(--color-neutral-200)',
        backgroundColor: 'var(--color-neutral-0)'
      }}>
        <div className="flex" style={{ padding: 'var(--space-4)' }}>
          <button
            onClick={() => setActiveTab('staging')}
            className={`atlassian-btn atlassian-btn-sm ${
              activeTab === 'staging' ? 'atlassian-btn-primary' : 'atlassian-btn-subtle'
            }`}
            style={{ marginRight: 'var(--space-4)' }}
          >
            一時設置エリア
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`atlassian-btn atlassian-btn-sm ${
              activeTab === 'presets' ? 'atlassian-btn-primary' : 'atlassian-btn-subtle'
            }`}
            style={{ marginRight: 'var(--space-4)' }}
          >
            プリセット
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`atlassian-btn atlassian-btn-sm ${
              activeTab === 'search' ? 'atlassian-btn-primary' : 'atlassian-btn-subtle'
            }`}
          >
            チャンピオン検索
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 min-h-0">
        {activeTab === 'staging' && (
          <div style={{ padding: 'var(--space-8)' }}>
            <StagingAreaPanel />
          </div>
        )}

        {activeTab === 'presets' && (
          <div style={{ padding: 'var(--space-8)' }}>
            <ChampionPresetSelector 
              champions={champions}
              onSelectPreset={() => {
                // プリセット選択時の処理
                // TODO: Add preset selection logic
              }}
            />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="h-full flex flex-col" style={{ padding: 'var(--space-8)' }}>
            {/* 検索・フィルター */}
            <div className="flex-shrink-0" style={{ marginBottom: 'var(--space-8)' }}>
              <SearchBar
                value={searchFilter}
                onChange={setSearchFilter}
                placeholder="チャンピオン名で検索..."
              />
              
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

              {showFilters && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <FilterPanel
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    onTagToggle={handleTagToggle}
                  />
                </div>
              )}
            </div>

            {/* チャンピオングリッド */}
            <div className="flex-1 min-h-0">
              <VirtualizedChampionGrid
                champions={filteredChampions}
                onChampionSelect={handleChampionSelect}
                selectedChampion={selectedChampion}
                containerHeight={200} // 固定高さ
                iconSize={40} // 少し小さめのアイコン
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};