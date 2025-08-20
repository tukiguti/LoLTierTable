import React, { useState } from 'react';
import type { Champion } from '../../types';
import { ChampionPresetSelector } from '../ChampionPresets/ChampionPresetSelector';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { SearchBar } from '../ChampionPanel/SearchBar';
import { FilterPanel } from '../ChampionPanel/FilterPanel';
import { useTierListStore } from '../../store/tierListStore';
import { useMatrixStore } from '../../store/matrixStore';
import { useAppStore } from '../../store/appStore';

interface ChampionSelectionAreaProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
}

export const ChampionSelectionArea: React.FC<ChampionSelectionAreaProps> = ({
  champions,
  onChampionSelect,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { currentMode } = useAppStore();
  const { addChampionToStaging, clearStaging } = useTierListStore();

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
    <div className="h-full flex">
      {/* 左側：Enhanced プリセット選択 */}
      <div 
        className="p-2"
        style={{ 
          flex: '0 0 150px',
          background: '#ffffff',
          borderRight: '1px solid #f1f1f1' // 非常に薄いボーダー
        }}
      >
        <div className="h-full flex flex-col">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            プリセット
          </h4>
          <div 
            className="flex-1 p-1"
            style={{ 
              overflow: 'hidden',
              background: 'transparent'
            }}
          >
            <ChampionPresetSelector 
              champions={champions}
              onSelectPreset={(selectedChampions) => {
                // 全モードでティアリストのstagingエリアを使用
                clearStaging();
                selectedChampions.forEach(champion => {
                  addChampionToStaging(champion);
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* 右側：Enhanced チャンピオン検索 */}
      <div className="p-2" style={{ flex: '1 1 auto' }}>
        <div className="h-full flex flex-col">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            チャンピオン
          </h4>
          
          {/* 検索・フィルター */}
          <div className="flex-shrink-0 mb-4">
            <SearchBar
              value={searchFilter}
              onChange={setSearchFilter}
              placeholder="チャンピオン名で検索..."
            />
            
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`atlassian-btn atlassian-btn-sm ${
                  showFilters || selectedTags.length > 0
                    ? 'atlassian-btn-primary'
                    : 'atlassian-btn-secondary'
                }`}
              >
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="mt-2">
                <FilterPanel
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                />
              </div>
            )}
          </div>

          {/* Enhanced チャンピオングリッド */}
          <div className="flex-1">
            <div 
              className="rounded p-2 h-full"
              style={{
                background: '#ffffff',
                border: 'none'
              }}
            >
              {filteredChampions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div 
                    className="p-6 rounded-lg"
                    style={{ 
                      color: '#64748b',
                      background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(100, 116, 139, 0.1) 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.2)'
                    }}
                  >
                    <div className="text-lg font-semibold mb-2">
                      🔍 チャンピオンが見つかりません
                    </div>
                    <div className="text-sm">
                      検索条件を変更してください
                    </div>
                  </div>
                </div>
              ) : (
                <DroppableZone
                  id="champion-selection-panel"
                  data={{ type: 'champion-panel-return' }}
                  className="w-full h-full"
                  activeClassName="bg-blue-50"
                >
                  <div className="grid" style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', // smallサイズに合わせて調整
                    gap: '2px', // 少し大きめのギャップ
                    width: '100%',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    background: 'transparent'
                  }}>
                    {filteredChampions.map((champion) => ( // 制限を撤廃して全チャンピオン表示
                      <DraggableChampion
                        key={champion.id}
                        uniqueId={`panel-${champion.id}`}
                        champion={champion}
                        size="small" // 視認性を向上
                        onClick={() => handleChampionSelect(champion)}
                        className={`
                          ${selectedChampion?.id === champion.id 
                            ? 'ring-1 ring-blue-400' 
                            : ''
                          }
                          hover:scale-105 transition-transform duration-100
                        `}
                        style={{
                          borderRadius: '2px', // 角丸を最小限に
                          border: 'none', // ボーダーを削除
                          boxShadow: selectedChampion?.id === champion.id 
                            ? '0 0 0 1px #3b82f6'
                            : 'none' // シャドウも削除
                        }}
                      />
                    ))}
                  </div>
                </DroppableZone>
                  
                  {/* Enhanced チャンピオン数表示 */}
                  <div 
                    className="text-center text-sm font-semibold mt-3 px-3 py-1 rounded-lg"
                    style={{
                      color: '#7c3aed',
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                      border: '1px solid rgba(147, 51, 234, 0.2)'
                    }}
                  >
                    🎮 {filteredChampions.length}体のチャンピオン
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};