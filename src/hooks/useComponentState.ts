import { useState, useCallback } from 'react';
import type { ChampionUIState } from '../types';

interface UseComponentStateOptions {
  defaultTab?: 'presets' | 'search' | 'staging';
  enableTabs?: boolean;
}

export const useComponentState = ({
  defaultTab = 'search',
  enableTabs = true
}: UseComponentStateOptions = {}) => {
  const [uiState, setUIState] = useState<ChampionUIState>({
    activeTab: defaultTab,
    isSearchOpen: true,
    selectedPresetGroup: 'role'
  });

  // Tab management
  const setActiveTab = useCallback((tab: 'presets' | 'search' | 'staging') => {
    if (!enableTabs) return;
    
    setUIState(prev => ({
      ...prev,
      activeTab: tab
    }));
  }, [enableTabs]);

  // Search panel toggle
  const toggleSearch = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      isSearchOpen: !prev.isSearchOpen
    }));
  }, []);

  const setSearchOpen = useCallback((open: boolean) => {
    setUIState(prev => ({
      ...prev,
      isSearchOpen: open
    }));
  }, []);

  // Preset group selection
  const setSelectedPresetGroup = useCallback((group: string) => {
    setUIState(prev => ({
      ...prev,
      selectedPresetGroup: group
    }));
  }, []);

  // Convenience methods for tab switching
  const switchToPresets = useCallback(() => setActiveTab('presets'), [setActiveTab]);
  const switchToSearch = useCallback(() => setActiveTab('search'), [setActiveTab]);
  const switchToStaging = useCallback(() => setActiveTab('staging'), [setActiveTab]);

  // State queries
  const isTabActive = useCallback((tab: 'presets' | 'search' | 'staging') => {
    return uiState.activeTab === tab;
  }, [uiState.activeTab]);

  return {
    // State
    activeTab: uiState.activeTab,
    isSearchOpen: uiState.isSearchOpen,
    selectedPresetGroup: uiState.selectedPresetGroup,
    
    // Tab actions
    setActiveTab,
    switchToPresets,
    switchToSearch,
    switchToStaging,
    isTabActive,
    
    // Search actions
    toggleSearch,
    setSearchOpen,
    
    // Preset actions
    setSelectedPresetGroup,
    
    // Computed state
    showTabs: enableTabs,
    hasMultipleTabs: enableTabs
  };
};