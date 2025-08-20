import { useEffect, useCallback } from 'react';
import { useAppStore } from './store/appStore';
import { useTierListStore } from './store/tierListStore';
import { usePresetStore } from './store/presetStore';
import { useChampionData } from './hooks/useChampionData';
import { resetLayoutOnce } from './utils/resetLayout';
import { handleDragEnd } from './utils/dragHandlers';
import { Header } from './components/Layout/Header';
import { LoadingSpinner } from './components/Layout/LoadingSpinner';
import { SimpleTierList } from './components/TierList/SimpleTierList';
import { GridMatrixLayout } from './components/Matrix/FreeboardMatrixLayout';
import { ZoneScatterMatrixLayout } from './components/Matrix/ZoneScatterMatrixLayout';
import { DragDropContext } from './components/DragDrop/DragDropContext';
import type { DragEndEvent } from '@dnd-kit/core';

function App() {
  const { currentMode, setCurrentMode } = useAppStore();
  const { champions, loading } = useChampionData();
  const { setUnplacedChampions } = useTierListStore();
  const { initializePresets } = usePresetStore();

  // Initialize unplaced champions when champion data loads
  useEffect(() => {
    if (champions.length > 0) {
      setUnplacedChampions(champions);
    }
  }, [champions, setUnplacedChampions]);

  // Initialize presets on app start
  useEffect(() => {
    initializePresets();
  }, [initializePresets]);

  // Reset layout storage once for better default sizes
  useEffect(() => {
    resetLayoutOnce();
  }, []);

  const handleGlobalDragEnd = useCallback((event: DragEndEvent) => {
    handleDragEnd(event, currentMode);
  }, [currentMode]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />
      
      <DragDropContext onDragEnd={handleGlobalDragEnd}>
        <main className="flex-1">
          {currentMode === 'tierlist' && <SimpleTierList />}
          {currentMode === 'matrix' && <GridMatrixLayout />}
          {currentMode === 'scatter' && <ZoneScatterMatrixLayout />}
        </main>
      </DragDropContext>
    </div>
  );
}

export default App;