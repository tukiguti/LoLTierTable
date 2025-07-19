import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { useTierListStore } from './store/tierListStore';
import { useMatrixStore } from './store/matrixStore';
import { useChampionData } from './hooks/useChampionData';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { LoadingSpinner } from './components/Layout/LoadingSpinner';
import { SimpleTierList } from './components/TierList/SimpleTierList';
import { GridMatrix } from './components/Matrix/GridMatrix';
import { QuadrantMatrix } from './components/Matrix/QuadrantMatrix';
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
    addChampion: addChampionToMatrix
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
      } else if ((currentMode === 'matrix' || currentMode === 'quadrant') && 
                 (draggedId.startsWith('grid-') || 
                  draggedId.startsWith('matrix-') || 
                  draggedId.startsWith('center-') ||
                  draggedId.startsWith('topLeft-') || 
                  draggedId.startsWith('topRight-') || 
                  draggedId.startsWith('bottomLeft-') || 
                  draggedId.startsWith('bottomRight-'))) {
        // Remove from matrix (both grid and quadrant modes)
        const { removeChampion } = useMatrixStore.getState();
        const parts = draggedId.split('-');
        if (parts.length >= 2) {
          const championId = parts[1];
          removeChampion(championId);
        }
      }
      return;
    }

    // Handle matrix drops when in matrix or quadrant mode
    if ((currentMode === 'matrix' || currentMode === 'quadrant') && 
        (overId.startsWith('grid-') || overId.startsWith('matrix-') || overId.startsWith('center-') || overId.includes('-'))) {
      let x: number, y: number, quadrant: string | undefined;
      
      if (overId.startsWith('grid-')) {
        const [, xStr, yStr] = overId.split('-');
        x = parseInt(xStr);
        y = parseInt(yStr);
      } else if (overId.startsWith('matrix-')) {
        const [, xStr, yStr] = overId.split('-');
        x = parseInt(xStr);
        y = parseInt(yStr);
      } else if (overId.startsWith('center-')) {
        // Handle center axis drops - format is "center-row-col"
        const [, rowStr, colStr] = overId.split('-');
        const row = parseInt(rowStr);
        const col = parseInt(colStr);
        x = col;
        y = row;  // Use row directly without flipping for center axis
        // For center axis, we don't set a quadrant (leave it undefined)
      } else {
        // Handle quadrant drops: format like "topLeft-2-1"
        const parts = overId.split('-');
        if (parts.length >= 3) {
          quadrant = parts[0];
          x = parseInt(parts[1]);
          y = parseInt(parts[2]);
        } else {
          return;
        }
      }
      
      if (!isNaN(x) && !isNaN(y) && x >= 0 && y >= 0) {
        // Check if this is a placed champion being moved
        if (draggedId.startsWith('grid-') || 
            draggedId.startsWith('matrix-') || 
            draggedId.startsWith('center-') ||
            draggedId.startsWith('topLeft-') || 
            draggedId.startsWith('topRight-') || 
            draggedId.startsWith('bottomLeft-') || 
            draggedId.startsWith('bottomRight-')) {
          // This is a placed champion - remove from old position first
          const { removeChampion } = useMatrixStore.getState();
          const parts = draggedId.split('-');
          if (parts.length >= 2) {
            const championId = parts[1];
            removeChampion(championId);
          }
        }
        
        // Place the champion at the new position
        // Set quadrant based on mode and drop location
        let finalQuadrant: string | undefined = undefined;
        if (currentMode === 'quadrant') {
          if (quadrant) {
            finalQuadrant = quadrant; // Normal quadrant
          } else {
            finalQuadrant = 'center'; // Center axis in quadrant mode
          }
        }
        // For grid mode, finalQuadrant remains undefined
        addChampionToMatrix(champion, x, y, finalQuadrant);
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
            {currentMode === 'tierlist' && <SimpleTierList />}
            {currentMode === 'matrix' && <GridMatrix />}
            {currentMode === 'quadrant' && <QuadrantMatrix />}
          </main>
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;