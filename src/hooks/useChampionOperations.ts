import { useCallback } from 'react';
import type { Champion, ChampionOperations } from '../types';
import { useAppStore } from '../store/appStore';
import { useTierListStore } from '../store/tierListStore';
import { useMatrixStore } from '../store/matrixStore';

interface UseChampionOperationsOptions extends ChampionOperations {
  mode?: 'tierlist' | 'matrix' | 'scatter';
}

export const useChampionOperations = ({
  mode = 'tierlist',
  onChampionSelect,
  onPresetLoad,
  onStagingClear,
  onChampionAdd
}: UseChampionOperationsOptions = {}) => {
  const { setSelectedChampion } = useAppStore();
  const { addChampionToStaging: addToTierListStaging, clearStaging: clearTierListStaging } = useTierListStore();
  const { addChampion: addToMatrixStaging, removeChampion, champions: matrixChampions } = useMatrixStore();

  // Handle champion selection
  const handleChampionSelect = useCallback((champion: Champion) => {
    // Set as selected champion for UI purposes
    setSelectedChampion(champion);
    
    // Call custom handler if provided
    onChampionSelect?.(champion);
  }, [setSelectedChampion, onChampionSelect]);

  // Handle adding champion to staging area
  const handleAddToStaging = useCallback((champion: Champion) => {
    if (mode === 'tierlist') {
      addToTierListStaging(champion);
    } else if (mode === 'matrix' || mode === 'scatter') {
      // Remove if already exists
      const existingChampion = matrixChampions.find(pc => pc.champion.id === champion.id);
      if (existingChampion) {
        removeChampion(champion.id);
      }
      
      // Find next available staging position
      const stagingChampions = matrixChampions.filter(pc => pc.quadrant === 'staging');
      const nextIndex = stagingChampions.length;
      
      addToMatrixStaging(champion, nextIndex, 0, 'staging');
    }
    
    // Call custom handler if provided
    onChampionAdd?.(champion);
  }, [mode, addToTierListStaging, addToMatrixStaging, removeChampion, matrixChampions, onChampionAdd]);

  // Handle clearing staging area
  const handleClearStaging = useCallback(() => {
    if (mode === 'tierlist') {
      clearTierListStaging();
    } else if (mode === 'matrix' || mode === 'scatter') {
      const stagingChampions = matrixChampions.filter(pc => pc.quadrant === 'staging');
      stagingChampions.forEach(pc => removeChampion(pc.champion.id));
    }
    
    // Call custom handler if provided
    onStagingClear?.();
  }, [mode, clearTierListStaging, removeChampion, matrixChampions, onStagingClear]);

  // Handle preset loading
  const handlePresetLoad = useCallback((champions: Champion[]) => {
    if (mode === 'tierlist') {
      // Clear existing staging first, then add all champions
      clearTierListStaging();
      champions.forEach(champion => addToTierListStaging(champion));
    } else if (mode === 'matrix' || mode === 'scatter') {
      // Clear existing staging first
      const stagingChampions = matrixChampions.filter(pc => pc.quadrant === 'staging');
      stagingChampions.forEach(pc => removeChampion(pc.champion.id));
      
      // Add all champions to staging
      champions.forEach((champion, index) => {
        addToMatrixStaging(champion, index, 0, 'staging');
      });
    }
    
    // Call custom handler if provided
    onPresetLoad?.(champions);
  }, [mode, clearTierListStaging, addToTierListStaging, addToMatrixStaging, removeChampion, matrixChampions, onPresetLoad]);

  // Get current staging champions
  const getStagingChampions = useCallback(() => {
    if (mode === 'tierlist') {
      return useTierListStore.getState().stagingChampions;
    } else if (mode === 'matrix' || mode === 'scatter') {
      return matrixChampions
        .filter(pc => pc.quadrant === 'staging')
        .map(pc => pc.champion);
    }
    return [];
  }, [mode, matrixChampions]);

  return {
    // Main operations
    handleChampionSelect,
    handleAddToStaging,
    handleClearStaging,
    handlePresetLoad,
    
    // Utility
    getStagingChampions,
    
    // State
    stagingCount: getStagingChampions().length
  };
};