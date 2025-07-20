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
import { ZoneScatterMatrix } from './components/Matrix/ZoneScatterMatrix';
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
    
    if (!over || !active.data.current?.champion) {
      console.log('DragEnd: Missing over or champion data', { over: !!over, champion: !!active.data.current?.champion });
      return;
    }

    const champion = active.data.current.champion;
    const overId = over.id as string;
    const draggedId = active.id as string;
    
    console.log('DragEnd:', { 
      championName: champion.name, 
      overId, 
      draggedId, 
      currentMode,
      overData: over.data?.current 
    });

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
      } else if (currentMode === 'tierlist' && draggedId.startsWith('staging-')) {
        // Remove from staging area in tierlist mode
        const { removeChampionFromStaging } = useTierListStore.getState();
        const parts = draggedId.split('-');
        if (parts.length >= 2) {
          const championId = parts[1];
          removeChampionFromStaging(championId);
        }
      } else if ((currentMode === 'matrix' || currentMode === 'scatter') && 
                 (draggedId.startsWith('grid-') || 
                  draggedId.startsWith('matrix-') || 
                  draggedId.startsWith('center-') ||
                  draggedId.startsWith('topLeft-') || 
                  draggedId.startsWith('topRight-') || 
                  draggedId.startsWith('bottomLeft-') || 
                  draggedId.startsWith('bottomRight-') ||
                  draggedId.startsWith('staging-'))) {
        // Remove from matrix (both grid and scatter modes, and staging)
        const { removeChampion } = useMatrixStore.getState();
        const parts = draggedId.split('-');
        if (parts.length >= 2) {
          const championId = parts[1];
          removeChampion(championId);
        }
      }
      return;
    }

    // Handle temporary staging area drops FIRST (but after mode checks)
    if (overId === 'temp-staging') {
      console.log('Dropping champion to staging area:', champion.name);
      
      if (currentMode === 'tierlist') {
        const { addChampionToStaging } = useTierListStore.getState();
        addChampionToStaging(champion);
      } else if (currentMode === 'matrix' || currentMode === 'scatter') {
        const { addChampion, removeChampion, champions } = useMatrixStore.getState();
        
        // Remove champion from previous position if it exists
        const existingChampion = champions.find(pc => pc.champion.id === champion.id);
        if (existingChampion) {
          removeChampion(champion.id);
        }
        
        // Find next available position in staging area (after removal)
        const stagingChampions = champions.filter(pc => pc.quadrant === 'staging' && pc.champion.id !== champion.id);
        const nextIndex = stagingChampions.length;
        
        // Place champion in staging area with unique x position
        addChampion(champion, nextIndex, 0, 'staging');
      }
      return;
    }

    // Check condition parts
    const isModeMatch = (currentMode === 'matrix' || currentMode === 'scatter');
    const isValidDropId = (overId.startsWith('grid-') || overId.startsWith('matrix-') || overId.startsWith('center-') || 
         overId.startsWith('topLeft-') || overId.startsWith('topRight-') || 
         overId.startsWith('bottomLeft-') || overId.startsWith('bottomRight-'));
    
    console.log('Drop condition check:', { 
      isModeMatch, 
      isValidDropId, 
      currentMode, 
      overId,
      overIdChecks: {
        grid: overId.startsWith('grid-'),
        matrix: overId.startsWith('matrix-'),
        center: overId.startsWith('center-'),
        topLeft: overId.startsWith('topLeft-'),
        topRight: overId.startsWith('topRight-'),
        bottomLeft: overId.startsWith('bottomLeft-'),
        bottomRight: overId.startsWith('bottomRight-')
      }
    });

    // Handle matrix drops when in matrix or scatter mode
    if (isModeMatch && isValidDropId) {
      
      console.log('Processing matrix/scatter drop:', { currentMode, overId });
      
      // First, remove champion from previous position if it was already placed
      if (draggedId.startsWith('staging-') || draggedId.startsWith('grid-') || draggedId.startsWith('matrix-') || 
          draggedId.startsWith('center-') || draggedId.startsWith('topLeft-') || draggedId.startsWith('topRight-') || 
          draggedId.startsWith('bottomLeft-') || draggedId.startsWith('bottomRight-')) {
        const { removeChampion } = useMatrixStore.getState();
        const parts = draggedId.split('-');
        if (parts.length >= 2) {
          const championId = parts[1];
          removeChampion(championId);
        }
      }
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
        // Handle scatter zone drops: format like "topLeft-2-1"
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
        console.log('Valid coordinates found:', { x, y, draggedId });
        
        // Check if this is a placed champion being moved
        if (draggedId.startsWith('grid-') || 
            draggedId.startsWith('matrix-') || 
            draggedId.startsWith('center-') ||
            draggedId.startsWith('topLeft-') || 
            draggedId.startsWith('topRight-') || 
            draggedId.startsWith('bottomLeft-') || 
            draggedId.startsWith('bottomRight-')) {
          console.log('Moving existing placed champion');
          // This is a placed champion - remove from old position first
          const { removeChampion } = useMatrixStore.getState();
          const parts = draggedId.split('-');
          if (parts.length >= 2) {
            const championId = parts[1];
            removeChampion(championId);
          }
        } else if (draggedId.startsWith('staging-')) {
          console.log('Moving from staging area');
          // Remove from staging area
          const { removeChampion } = useMatrixStore.getState();
          const parts = draggedId.split('-');
          if (parts.length >= 2) {
            const championId = parts[1];
            removeChampion(championId);
          }
        } else {
          console.log('Adding new champion from panel');
        }
        
        // Place the champion at the new position
        // Set zone based on mode and drop location
        let finalQuadrant: string | undefined = undefined;
        if (currentMode === 'scatter') {
          if (quadrant) {
            finalQuadrant = quadrant; // Normal zone
          } else {
            finalQuadrant = 'center'; // Center axis in scatter mode
          }
        }
        // For grid mode, finalQuadrant remains undefined
        console.log('Adding champion to matrix:', { 
          championName: champion.name, 
          x, 
          y, 
          finalQuadrant, 
          currentMode 
        });
        addChampionToMatrix(champion, x, y, finalQuadrant);
      }
    }
    
    // Handle tier list drops when in tier list mode
    if (currentMode === 'tierlist') {
      const { addChampionToTier, removeChampionFromTier, removeChampionFromStaging } = useTierListStore.getState();
      const { tiers } = useTierListStore.getState();
      
      // Find target tier
      const targetTier = tiers.find(tier => tier.id === overId);
      if (!targetTier) return;

      // Check if this is from staging area
      if (draggedId.startsWith('staging-')) {
        // Remove from staging and add to tier
        const parts = draggedId.split('-');
        if (parts.length >= 2) {
          const championId = parts[1];
          removeChampionFromStaging(championId);
          addChampionToTier(championId, targetTier.id);
        }
        return;
      }

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
            {currentMode === 'scatter' && <ZoneScatterMatrix />}
          </main>
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;