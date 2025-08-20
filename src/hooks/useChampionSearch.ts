import { useState, useMemo, useCallback } from 'react';
import type { Champion, ChampionSearchState } from '../types';

interface UseChampionSearchOptions {
  champions: Champion[];
  enableTagFilter?: boolean;
}

export const useChampionSearch = ({ 
  champions, 
  enableTagFilter = true
}: UseChampionSearchOptions) => {
  const [searchState, setSearchState] = useState<ChampionSearchState>({
    searchTerm: '',
    selectedTags: [],
    filteredChampions: champions
  });

  // Get unique tags from all champions
  const availableTags = useMemo(() => {
    if (!enableTagFilter) return [];
    
    const tagSet = new Set<string>();
    champions.forEach(champion => {
      champion.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [champions, enableTagFilter]);

  // Filter champions based on search term and selected tags
  const filteredChampions = useMemo(() => {
    let filtered = champions;

    // Filter by search term (champion id, name, and title)
    if (searchState.searchTerm.trim()) {
      const searchLower = searchState.searchTerm.toLowerCase();
      filtered = filtered.filter(champion =>
        champion.id.toLowerCase().includes(searchLower) ||
        champion.name.toLowerCase().includes(searchLower) ||
        champion.title?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected tags
    if (searchState.selectedTags.length > 0) {
      filtered = filtered.filter(champion =>
        searchState.selectedTags.every(selectedTag =>
          champion.tags?.includes(selectedTag)
        )
      );
    }

    return filtered;
  }, [champions, searchState.searchTerm, searchState.selectedTags]);

  // Update search term
  const setSearchTerm = useCallback((term: string) => {
    setSearchState(prev => ({
      ...prev,
      searchTerm: term,
      filteredChampions: []
    }));
  }, []);

  // Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSearchState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchState({
      searchTerm: '',
      selectedTags: [],
      filteredChampions: champions
    });
  }, [champions]);

  // Reset to show all champions
  const resetSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      searchTerm: '',
      selectedTags: []
    }));
  }, []);

  return {
    // State
    searchTerm: searchState.searchTerm,
    selectedTags: searchState.selectedTags,
    filteredChampions,
    availableTags,
    
    // Actions
    setSearchTerm,
    toggleTag,
    clearFilters,
    resetSearch,
    
    // Computed
    hasActiveFilters: searchState.searchTerm.length > 0 || searchState.selectedTags.length > 0,
    resultCount: filteredChampions.length,
    totalCount: champions.length
  };
};;;