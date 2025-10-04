import React from 'react';
import type {
  Champion,
  ChampionContainerFeatures,
  ChampionDisplayConfig,
  ChampionContainerLayout,
  ChampionOperations,
} from '../../types';
import { useChampionSearch, useChampionOperations, useComponentState } from '../../hooks';
import { SearchableChampionGrid } from './SearchableChampionGrid';
import { ChampionOperations as ChampionOps } from './ChampionOperations';
import { PresetSelector } from './PresetSelector';
import { TierListStagingArea } from '../StagingArea/TierListStagingArea';

const TAB_LABELS = {
  presets: '\u30d7\u30ea\u30bb\u30c3\u30c8',
  search: '\u691c\u7d22',
  staging: '\u4e00\u6642\u4fdd\u7ba1',
} as const;

const stagingLabel = (count: number) => `${TAB_LABELS.staging} (${count})`;

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
  className = '',
}) => {
  const searchHook = useChampionSearch({ champions, enableTagFilter: features.filters });
  const operationsHook = useChampionOperations({ mode, ...operations });
  const uiState = useComponentState({
    defaultTab: features.presets ? 'presets' : 'search',
    enableTabs: layout.mode === 'tabs',
  });

  const handleChampionClick = (champion: Champion) => {
    operationsHook.handleChampionSelect(champion);
  };

  const renderTabs = () => (
    <div className="h-full flex flex-col">
      <div className="flex rounded-lg bg-slate-100 p-1 text-[11px] font-medium text-slate-600">
        {features.presets && (
          <button
            type="button"
            onClick={uiState.switchToPresets}
            className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
              uiState.isTabActive('presets') ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            {TAB_LABELS.presets}
          </button>
        )}
        {features.search && (
          <button
            type="button"
            onClick={uiState.switchToSearch}
            className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
              uiState.isTabActive('search') ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            {TAB_LABELS.search}
          </button>
        )}
        {features.staging && (
          <button
            type="button"
            onClick={uiState.switchToStaging}
            className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
              uiState.isTabActive('staging') ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            {stagingLabel(operationsHook.stagingCount)}
          </button>
        )}
      </div>

      <div className="mt-2 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
        {uiState.isTabActive('presets') && features.presets && (
          <PresetSelector
            selectedGroup={uiState.selectedPresetGroup}
            onGroupChange={uiState.setSelectedPresetGroup}
            onPresetLoad={operationsHook.handlePresetLoad}
          />
        )}

        {uiState.isTabActive('search') && features.search && (
          <div className="flex h-full flex-col gap-3">
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
            <div className="flex-1">
              <SearchableChampionGrid
                champions={searchHook.filteredChampions}
                config={displayConfig}
                onChampionClick={handleChampionClick}
              />
            </div>
          </div>
        )}

        {uiState.isTabActive('staging') && features.staging && <TierListStagingArea />}
      </div>
    </div>
  );

  const renderHorizontal = () => (
    <div className="flex h-full gap-3">
      {features.presets && (
        <div
          className="overflow-auto rounded-xl border border-slate-200 bg-white p-3"
          style={{ width: layout.presetWidth ?? 200 }}
        >
          <PresetSelector
            selectedGroup={uiState.selectedPresetGroup}
            onGroupChange={uiState.setSelectedPresetGroup}
            onPresetLoad={operationsHook.handlePresetLoad}
          />
        </div>
      )}
      {features.search && (
        <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex h-full flex-col gap-3">
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
            <div className="flex-1">
              <SearchableChampionGrid
                champions={searchHook.filteredChampions}
                config={displayConfig}
                onChampionClick={handleChampionClick}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVertical = () => (
    <div className={`h-full space-y-3 ${className}`}>
      {features.presets && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <PresetSelector
            selectedGroup={uiState.selectedPresetGroup}
            onGroupChange={uiState.setSelectedPresetGroup}
            onPresetLoad={operationsHook.handlePresetLoad}
          />
        </div>
      )}
      {features.search && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
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
          <div className="mt-3">
            <SearchableChampionGrid
              champions={searchHook.filteredChampions}
              config={displayConfig}
              onChampionClick={handleChampionClick}
            />
          </div>
        </div>
      )}
      {features.staging && (
        <div
          className="rounded-xl border border-slate-200 bg-white p-3"
          style={{ height: layout.stagingHeight }}
        >
          <TierListStagingArea />
        </div>
      )}
    </div>
  );

  if (layout.mode === 'tabs') {
    return <div className={`h-full ${className}`}>{renderTabs()}</div>;
  }

  if (layout.mode === 'horizontal') {
    return <div className={`h-full ${className}`}>{renderHorizontal()}</div>;
  }

  return renderVertical();
};
