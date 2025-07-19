import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { useTierListStore } from './store/tierListStore';
import { useMatrixStore } from './store/matrixStore';
import { useChampionData } from './hooks/useChampionData';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { LoadingSpinner } from './components/Layout/LoadingSpinner';
import { TierList } from './components/TierList';
import { Matrix } from './components/Matrix';
import { DragDropContext } from './components/DragDrop/DragDropContext';
import type { Champion } from './types';
import type { DragEndEvent } from '@dnd-kit/core';

function App() {
  const { 
    currentMode, 
    ui, 
    setCurrentMode, 
    setSearchFilter,
    setSelectedChampion 
  } = useAppStore();
  
  const { champions, loading } = useChampionData();
  const { setUnplacedChampions } = useTierListStore();
  const { 
    addChampion: addChampionToMatrix, 
    moveChampion: moveChampionInMatrix,
    champions: matrixChampions,
    gridSize 
  } = useMatrixStore();

  // Initialize unplaced champions when champion data loads
  useEffect(() => {
    if (champions.length > 0) {
      setUnplacedChampions(champions);
    }
  }, [champions, setUnplacedChampions]);

  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
    // You could add additional logic here, like auto-adding to current tier/matrix
  };

  const handleGlobalDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active.data.current?.champion) return;

    const champion = active.data.current.champion;
    const overId = over.id as string;
    const draggedId = active.id as string;

    // Handle drops to trash
    if (overId === 'trash') {
      if (currentMode === 'tierlist' && draggedId.includes('__')) {
        // Remove from tier
        const { removeChampionFromTier } = useTierListStore.getState();
        const parts = draggedId.split('__');
        const sourceTierId = parts[0];
        const championId = parts[1];
        const championIndex = parseInt(parts[2]);
        removeChampionFromTier(championId, sourceTierId, championIndex);
      } else if (currentMode === 'matrix' && (draggedId.startsWith('matrix-') || draggedId.startsWith('quadrant-'))) {
        // Remove from matrix
        const { removeChampion } = useMatrixStore.getState();
        const parts = draggedId.split('-');
        if (parts.length >= 3) {
          const championId = parts[1];
          removeChampion(championId);
        }
      }
      return;
    }

    // Handle matrix drops when in matrix mode
    if (currentMode === 'matrix' && (overId.startsWith('matrix-') || overId.includes('-'))) {
      let x: number, y: number, quadrant: string | undefined;
      
      if (overId.startsWith('matrix-')) {
        const [, xStr, yStr] = overId.split('-');
        x = parseInt(xStr);
        y = parseInt(yStr);
      } else {
        // Handle quadrant drops: format like "topLeft-2-1" or "quadrant-topLeft-2-1"
        const parts = overId.split('-');
        if (parts.length >= 3) {
          if (parts[0] === 'quadrant') {
            quadrant = parts[1];
            x = parseInt(parts[2]);
            y = parseInt(parts[3]);
          } else {
            // Direct quadrant format: "topLeft-2-1"
            quadrant = parts[0];
            x = parseInt(parts[1]);
            y = parseInt(parts[2]);
          }
        } else {
          return;
        }
      }
      
      if (!isNaN(x) && !isNaN(y) && x >= 0 && y >= 0) {
        // Check if this is a placed champion being moved
        if (draggedId.includes('-') && (draggedId.startsWith('matrix-') || draggedId.startsWith('quadrant-') || draggedId.includes('topLeft') || draggedId.includes('topRight') || draggedId.includes('bottomLeft') || draggedId.includes('bottomRight'))) {
          // This is a placed champion - remove from old position first
          const { removeChampion } = useMatrixStore.getState();
          const parts = draggedId.split('-');
          if (parts.length >= 2) {
            const championId = parts[1] || parts[0]; // Handle different formats
            removeChampion(championId);
          }
        }
        
        // Place the champion at the new position
        addChampionToMatrix(champion, x, y, quadrant);
      }
    }
    
    // Handle tier list drops when in tier list mode
    if (currentMode === 'tierlist') {
      const { addChampionToTier, removeChampionFromTier } = useTierListStore.getState();
      const { tiers } = useTierListStore.getState();
      
      // Find target tier
      const targetTier = tiers.find(tier => tier.id === overId);
      if (!targetTier) return;

      // Check if this is a placed champion being moved
      if (draggedId.includes('__')) {
        // This is a placed champion with unique ID format (tier__champion__index)
        const parts = draggedId.split('__');
        console.log('Tier movement - draggedId:', draggedId, 'parts:', parts);
        const sourceTierId = parts[0];
        const championId = parts[1];
        const championIndex = parseInt(parts[2]);
        
        const sourceTier = tiers.find(t => t.id === sourceTierId);
        console.log('Source tier:', sourceTier?.id, 'Target tier:', targetTier.id);
        
        if (sourceTier && sourceTier.id !== targetTier.id) {
          // Move between different tiers - remove from source first using specific index
          console.log('Moving champion from', sourceTier.id, 'to', targetTier.id, 'index:', championIndex);
          removeChampionFromTier(championId, sourceTier.id, championIndex);
          addChampionToTier(championId, targetTier.id);
        } else if (sourceTier && sourceTier.id === targetTier.id) {
          // Same tier - do nothing to prevent duplication
          console.log('Same tier movement - preventing duplication');
          return;
        }
      } else {
        // This is from champion panel - just add
        console.log('Adding from champion panel:', champion.id, 'to tier:', targetTier.id);
        addChampionToTier(champion.id, targetTier.id);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DragDropContext onDragEnd={handleGlobalDragEnd}>
        <Sidebar
          champions={champions}
          searchFilter={ui.searchFilter}
          onSearchChange={setSearchFilter}
          onChampionSelect={handleChampionSelect}
        />

        <div className="flex-1 flex flex-col">
          <Header
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />

          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {currentMode === 'tierlist' ? (
              <TierList />
            ) : (
              <Matrix />
            )}
          </main>
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;