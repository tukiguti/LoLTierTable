import type { Champion } from './index';

// 共通のサイズ型
export type ChampionIconSize = 'xs' | 'extra-small' | 'small' | 'medium' | 'large';

// 共通のレイアウトモード型
export type LayoutMode = 'horizontal' | 'vertical' | 'tabs';

export interface ChampionSearchConfig {
  enableSearch: boolean;
  enableFilters: boolean;
  enableTagFilter: boolean;
  defaultSearchPlaceholder: string;
}

export interface ChampionDisplayConfig {
  iconSize: ChampionIconSize;
  gridColumns: number | 'auto-fit';
  maxItems: number;
  containerHeight: number;
  showItemCount: boolean;
}

export interface ChampionContainerLayout {
  mode: LayoutMode;
  presetWidth: number;
  searchWidth: number;
  stagingHeight: number;
}

export interface ChampionContainerFeatures {
  search: boolean;
  presets: boolean;
  staging: boolean;
  filters: boolean;
}

export interface ChampionOperations {
  onChampionSelect?: (champion: Champion) => void;
  onPresetLoad?: (champions: Champion[]) => void;
  onStagingClear?: () => void;
  onChampionAdd?: (champion: Champion) => void;
}

export interface PresetGroup {
  id: string;
  name: string;
  champions: Champion[];
}

export interface ChampionSearchState {
  searchTerm: string;
  selectedTags: string[];
  filteredChampions: Champion[];
}

export interface ChampionUIState {
  activeTab: 'presets' | 'search' | 'staging';
  isSearchOpen: boolean;
  selectedPresetGroup: string;
}