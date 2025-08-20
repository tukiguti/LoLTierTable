import React from 'react';
import type { 
  Champion, 
  ChampionContainerFeatures, 
  ChampionDisplayConfig, 
  ChampionContainerLayout,
  ChampionOperations 
} from '../../types';
import { useChampionSearch, useChampionOperations, useComponentState } from '../../hooks';
import { SearchableChampionGrid } from './SearchableChampionGrid';
import { ChampionOperations as ChampionOps } from './ChampionOperations';
import { PresetSelector } from './PresetSelector';
import { TierListStagingArea } from '../StagingArea/TierListStagingArea';

interface UniversalChampionContainerProps {
  champions: Champion[];
  features: ChampionContainerFeatures;
  displayConfig: ChampionDisplayConfig;
  layout: ChampionContainerLayout;
  operations?: ChampionOperations;
  mode?: 'tierlist' | 'matrix' | 'scatter';
  className?: string;
}

export const UniversalChampionContainer: React.FC<UniversalChampionContainerProps> = ({
  champions,
  features,
  displayConfig,
  layout,
  operations = {},
  mode = 'tierlist',
  className = ''
}) => {
  // Hooks for functionality
  const searchHook = useChampionSearch({ 
    champions, 
    enableTagFilter: features.filters 
  });
  
  const operationsHook = useChampionOperations({
    mode,
    ...operations
  });
  
  const uiState = useComponentState({
    defaultTab: features.presets ? 'presets' : 'search',
    enableTabs: layout.mode === 'tabs'
  });

  // Handle champion interactions
  const handleChampionClick = (champion: Champion) => {
    operationsHook.handleChampionSelect(champion);
  };


  // Render content based on layout mode
  const renderContent = () => {
    if (layout.mode === 'tabs') {
      return (
        <div className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b bg-gray-50">
            {features.presets && (
              <button
                onClick={uiState.switchToPresets}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  uiState.isTabActive('presets')
                    ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Presets
              </button>
            )}
            {features.search && (
              <button
                onClick={uiState.switchToSearch}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  uiState.isTabActive('search')
                    ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Search
              </button>
            )}
            {features.staging && (
              <button
                onClick={uiState.switchToStaging}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  uiState.isTabActive('staging')
                    ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Staging ({operationsHook.stagingCount})
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {uiState.isTabActive('presets') && features.presets && (
              <div className="h-full p-4">
                <PresetSelector
                  selectedGroup={uiState.selectedPresetGroup}
                  onGroupChange={uiState.setSelectedPresetGroup}
                  onPresetLoad={operationsHook.handlePresetLoad}
                />
              </div>
            )}
            
            {uiState.isTabActive('search') && features.search && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <ChampionOps
                    searchTerm={searchHook.searchTerm}
                    onSearchChange={searchHook.setSearchTerm}
                    selectedTags={searchHook.selectedTags}
                    availableTags={searchHook.availableTags}
                    onTagToggle={searchHook.toggleTag}
                    onClearFilters={searchHook.clearFilters}
                    hasActiveFilters={searchHook.hasActiveFilters}
                    showTagFilter={features.filters}
                  />
                </div>
                <div className="flex-1">
                  <SearchableChampionGrid
                    champions={searchHook.filteredChampions}
                    config={displayConfig}
                    onChampionClick={handleChampionClick}
                  />
                </div>
              </div>
            )}
            
            {uiState.isTabActive('staging') && features.staging && (
              <div className="h-full p-4">
                <TierListStagingArea />
              </div>
            )}
          </div>
        </div>
      );
    }

    // Horizontal layout
    if (layout.mode === 'horizontal') {
      return (
        <div className="h-full flex gap-4">
          {features.presets && (
            <div style={{ width: layout.presetWidth }}>
              <PresetSelector
                selectedGroup={uiState.selectedPresetGroup}
                onGroupChange={uiState.setSelectedPresetGroup}
                onPresetLoad={operationsHook.handlePresetLoad}
              />
            </div>
          )}
          
          {features.search && (
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <ChampionOps
                  searchTerm={searchHook.searchTerm}
                  onSearchChange={searchHook.setSearchTerm}
                  selectedTags={searchHook.selectedTags}
                  availableTags={searchHook.availableTags}
                  onTagToggle={searchHook.toggleTag}
                  onClearFilters={searchHook.clearFilters}
                  hasActiveFilters={searchHook.hasActiveFilters}
                  showTagFilter={features.filters}
                />
              </div>
              <div className="flex-1">
                <SearchableChampionGrid
                  champions={searchHook.filteredChampions}
                  config={displayConfig}
                  onChampionClick={handleChampionClick}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Vertical layout (default)
    return (
      <div className="h-full flex flex-col space-y-4">
        {features.presets && (
          <div>
            <PresetSelector
              selectedGroup={uiState.selectedPresetGroup}
              onGroupChange={uiState.setSelectedPresetGroup}
              onPresetLoad={operationsHook.handlePresetLoad}
            />
          </div>
        )}
        
        {features.search && (
          <>
            <div>
              <ChampionOps
                searchTerm={searchHook.searchTerm}
                onSearchChange={searchHook.setSearchTerm}
                selectedTags={searchHook.selectedTags}
                availableTags={searchHook.availableTags}
                onTagToggle={searchHook.toggleTag}
                onClearFilters={searchHook.clearFilters}
                hasActiveFilters={searchHook.hasActiveFilters}
                showTagFilter={features.filters}
              />
            </div>
            <div className="flex-1">
              <SearchableChampionGrid
                champions={searchHook.filteredChampions}
                config={displayConfig}
                onChampionClick={handleChampionClick}
              />
            </div>
          </>
        )}
        
        {features.staging && (
          <div style={{ height: layout.stagingHeight }}>
            <TierListStagingArea />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`universal-champion-container h-full ${className}`}>
      {renderContent()}
    </div>
  );
};