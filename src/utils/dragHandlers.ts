import type { DragEndEvent } from '@dnd-kit/core';
import type { Champion, DiagramType } from '../types';
import { useTierListStore } from '../store/tierListStore';
import { useMatrixStore } from '../store/matrixStore';
import { DRAG_DROP_CONFIG } from './constants';
import { ValidationError, logError } from './errorHandling';

// Re-export for convenience
const { ID_PREFIXES: DRAG_ID_PREFIXES, DROP_ZONES: DROP_ZONE_IDS } = DRAG_DROP_CONFIG;

// Helper functions
export const isDraggedFromTier = (draggedId: string): boolean => {
  return draggedId.includes(DRAG_ID_PREFIXES.TIER);
};

export const isDraggedFromStaging = (draggedId: string): boolean => {
  return draggedId.startsWith(DRAG_ID_PREFIXES.STAGING);
};

export const isDraggedFromMatrix = (draggedId: string): boolean => {
  return draggedId.startsWith(DRAG_ID_PREFIXES.GRID) ||
         draggedId.startsWith(DRAG_ID_PREFIXES.MATRIX) ||
         draggedId.startsWith(DRAG_ID_PREFIXES.CENTER) ||
         draggedId.startsWith(DRAG_ID_PREFIXES.TOP_LEFT) ||
         draggedId.startsWith(DRAG_ID_PREFIXES.TOP_RIGHT) ||
         draggedId.startsWith(DRAG_ID_PREFIXES.BOTTOM_LEFT) ||
         draggedId.startsWith(DRAG_ID_PREFIXES.BOTTOM_RIGHT);
};

export const isValidMatrixDropId = (overId: string): boolean => {
  return overId.startsWith(DRAG_ID_PREFIXES.GRID) ||
         overId.startsWith(DRAG_ID_PREFIXES.MATRIX) ||
         overId.startsWith(DRAG_ID_PREFIXES.CENTER) ||
         overId.startsWith(DRAG_ID_PREFIXES.TOP_LEFT) ||
         overId.startsWith(DRAG_ID_PREFIXES.TOP_RIGHT) ||
         overId.startsWith(DRAG_ID_PREFIXES.BOTTOM_LEFT) ||
         overId.startsWith(DRAG_ID_PREFIXES.BOTTOM_RIGHT) ||
         overId === DROP_ZONE_IDS.FREEBOARD_GRID ||
         overId.startsWith(DROP_ZONE_IDS.ZONE_FREEBOARD);
};

// Extract champion ID from drag ID
export const extractChampionId = (draggedId: string): string => {
  if (isDraggedFromTier(draggedId)) {
    const parts = draggedId.split(DRAG_ID_PREFIXES.TIER);
    return parts[1];
  }
  
  const parts = draggedId.split('-');
  return parts.length >= 2 ? parts[1] : '';
};

// Get mouse coordinates for freeboard positioning
export const getMouseCoordinatesInElement = (event: MouseEvent, element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
};

// Parse coordinates from drop zone ID
export const parseCoordinates = (overId: string, event?: DragEndEvent & { delta?: { x: number; y: number } }): { x: number; y: number; quadrant?: string } => {
  let x: number, y: number, quadrant: string | undefined;

  try {
    if (overId === DROP_ZONE_IDS.FREEBOARD_GRID) {
      // For freeboard, use coordinates from custom collision detection
      if (event && event.delta) {
        x = event.delta.x;
        y = event.delta.y;
        
        // Clamp to bounds
        x = Math.max(24, Math.min(x, 960 - 24)); // Board width with margin for icon
        y = Math.max(24, Math.min(y, 640 - 24)); // Board height with margin for icon
      } else {
        // Fallback to center position
        x = 480; // Half of 960px board width
        y = 320; // Half of 640px board height
        // Using fallback coordinates
      }
    } else if (overId.startsWith(DROP_ZONE_IDS.ZONE_FREEBOARD)) {
      // For zone freeboard: zone-topLeft, zone-topRight, etc.
      const zoneName = overId.replace(DROP_ZONE_IDS.ZONE_FREEBOARD, '');
      quadrant = zoneName;
      if (event && event.delta) {
        x = event.delta.x;
        y = event.delta.y;
        
        // Clamp to zone bounds
        x = Math.max(24, Math.min(x, 480 - 24)); // Zone width with margin
        y = Math.max(24, Math.min(y, 360 - 24)); // Zone height with margin
      } else {
        // Fallback to center of zone
        x = 240; // Half of 480px zone width
        y = 180; // Half of 360px zone height
      }
    } else if (overId.startsWith(DRAG_ID_PREFIXES.GRID)) {
      const [, xStr, yStr] = overId.split('-');
      x = parseInt(xStr, 10);
      y = parseInt(yStr, 10);
    } else if (overId.startsWith(DRAG_ID_PREFIXES.MATRIX)) {
      const [, xStr, yStr] = overId.split('-');
      x = parseInt(xStr, 10);
      y = parseInt(yStr, 10);
    } else if (overId.startsWith(DRAG_ID_PREFIXES.CENTER)) {
      const [, rowStr, colStr] = overId.split('-');
      x = parseInt(colStr, 10);
      y = parseInt(rowStr, 10);
    } else {
      // Handle scatter zone drops
      const parts = overId.split('-');
      if (parts.length >= 3) {
        quadrant = parts[0];
        x = parseInt(parts[1], 10);
        y = parseInt(parts[2], 10);
      } else {
        throw new ValidationError(
          `Invalid drop zone ID format: ${overId}`,
          '無効なドロップ先です'
        );
      }
    }

    // Validate parsed coordinates
    if (isNaN(x) || isNaN(y)) {
      throw new ValidationError(
        `Failed to parse coordinates from: ${overId}`,
        '座標の解析に失敗しました'
      );
    }

    return { x, y, quadrant };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      `Error parsing coordinates from ${overId}: ${error}`,
      '座標の解析でエラーが発生しました'
    );
  }
};

// Trash drop handler
export const handleTrashDrop = (draggedId: string, currentMode: DiagramType): void => {
  if (currentMode === 'tierlist' && isDraggedFromTier(draggedId)) {
    // Remove from tier
    const { removeChampionFromTier } = useTierListStore.getState();
    const parts = draggedId.split(DRAG_ID_PREFIXES.TIER);
    const sourceTierId = parts[0];
    const championId = parts[1];
    const championIndex = parseInt(parts[2]);
    removeChampionFromTier(championId, sourceTierId, championIndex);
  } else if (currentMode === 'tierlist' && isDraggedFromStaging(draggedId)) {
    // Remove from staging in tierlist mode
    const { removeChampionFromStaging } = useTierListStore.getState();
    const championId = extractChampionId(draggedId);
    if (championId) {
      removeChampionFromStaging(championId);
    }
  } else if ((currentMode === 'matrix' || currentMode === 'scatter') && isDraggedFromMatrix(draggedId)) {
    // Remove from matrix
    const { removeChampion } = useMatrixStore.getState();
    const championId = extractChampionId(draggedId);
    if (championId) {
      removeChampion(championId);
    }
  }
};

// Champion panel return handler (removes from staging/temp areas)
export const handleChampionPanelReturn = (draggedId: string, currentMode: DiagramType): void => {
  if (currentMode === 'tierlist') {
    // Remove from tierlist staging
    if (isDraggedFromStaging(draggedId)) {
      const { removeChampionFromStaging } = useTierListStore.getState();
      const championId = extractChampionId(draggedId);
      if (championId) {
        removeChampionFromStaging(championId);
      }
    }
    // Remove from tier (if dragged from tier)
    if (isDraggedFromTier(draggedId)) {
      const { removeChampionFromTier } = useTierListStore.getState();
      const parts = draggedId.split(DRAG_ID_PREFIXES.TIER);
      const sourceTierId = parts[0];
      const championId = parts[1];
      const championIndex = parseInt(parts[2]);
      removeChampionFromTier(championId, sourceTierId, championIndex);
    }
  } else if (currentMode === 'matrix' || currentMode === 'scatter') {
    // Remove from matrix/scatter mode
    if (isDraggedFromMatrix(draggedId) || isDraggedFromStaging(draggedId)) {
      const { removeChampion } = useMatrixStore.getState();
      const championId = extractChampionId(draggedId);
      if (championId) {
        removeChampion(championId);
      }
    }
  }
};

// Staging drop handler
export const handleStagingDrop = (champion: Champion, currentMode: DiagramType): void => {
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
    
    // Find next available position in staging area
    const stagingChampions = champions.filter(pc => 
      pc.quadrant === 'staging' && pc.champion.id !== champion.id
    );
    const nextIndex = stagingChampions.length;
    
    // Place champion in staging area
    addChampion(champion, nextIndex, 0, 'staging');
  }
};

// Matrix drop handler
export const handleMatrixDrop = (
  champion: Champion,
  overId: string,
  draggedId: string,
  currentMode: DiagramType,
  event?: DragEndEvent & { delta?: { x: number; y: number } }
): void => {
  const { addChampion: addChampionToMatrix, removeChampion } = useMatrixStore.getState();
  
  // Remove from previous position if already placed
  if (isDraggedFromMatrix(draggedId) || isDraggedFromStaging(draggedId)) {
    const championId = extractChampionId(draggedId);
    if (championId) {
      removeChampion(championId);
    }
  }
  
  try {
    const { x, y, quadrant } = parseCoordinates(overId, event);
    
    if (x >= 0 && y >= 0) {
      // Determine final quadrant for scatter mode
      let finalQuadrant: string | undefined = undefined;
      if (currentMode === 'scatter') {
        finalQuadrant = quadrant || 'center';
      }
      
      addChampionToMatrix(champion, x, y, finalQuadrant);
    }
  } catch (error) {
    const appError = error instanceof ValidationError ? error : new ValidationError(
      `Matrix drop error: ${error}`,
      'マトリクスへの配置でエラーが発生しました'
    );
    logError(appError, 'handleMatrixDrop');
    throw appError; // Re-throw to be caught by main handler
  }
};

// Tier drop handler
export const handleTierDrop = (
  champion: Champion,
  overId: string,
  draggedId: string
): void => {
  const { addChampionToTier, removeChampionFromTier, removeChampionFromStaging, tiers } = useTierListStore.getState();
  
  // Find target tier
  const targetTier = tiers.find(tier => tier.id === overId);
  if (!targetTier) return;

  // Handle staging area drops
  if (isDraggedFromStaging(draggedId)) {
    const championId = extractChampionId(draggedId);
    if (championId) {
      removeChampionFromStaging(championId);
      addChampionToTier(championId, targetTier.id);
    }
    return;
  }

  // Handle tier-to-tier moves
  if (isDraggedFromTier(draggedId)) {
    const parts = draggedId.split(DRAG_ID_PREFIXES.TIER);
    const sourceTierId = parts[0];
    const championId = parts[1];
    const championIndex = parseInt(parts[2]);
    
    const sourceTier = tiers.find(t => t.id === sourceTierId);
    
    if (sourceTier && sourceTier.id !== targetTier.id) {
      // Move between different tiers
      removeChampionFromTier(championId, sourceTier.id, championIndex);
      addChampionToTier(championId, targetTier.id);
    }
    // Same tier - do nothing to prevent duplication
    return;
  }

  // From champion panel - just add
  addChampionToTier(champion.id, targetTier.id);
};

// Main drag end handler
export const handleDragEnd = (event: DragEndEvent, currentMode: DiagramType): void => {
  try {
    const { active, over } = event;
    
    if (!over || !active.data.current?.champion) {
      return;
    }

    const champion = active.data.current.champion;
    const overId = over.id as string;
    const draggedId = active.id as string;

    // Handle trash drops
    if (overId === DROP_ZONE_IDS.TRASH) {
      handleTrashDrop(draggedId, currentMode);
      return;
    }

    // Handle staging area drops
    if (overId === DROP_ZONE_IDS.TEMP_STAGING) {
      handleStagingDrop(champion, currentMode);
      return;
    }

    // Handle champion panel return drops (remove from staging/temp)
    if (overId === 'champion-search-panel' || overId === 'champion-selection-panel') {
      handleChampionPanelReturn(draggedId, currentMode);
      return;
    }

    // Handle matrix/scatter drops
    if ((currentMode === 'matrix' || currentMode === 'scatter') && isValidMatrixDropId(overId)) {
      handleMatrixDrop(champion, overId, draggedId, currentMode, event);
      return;
    }

    // Handle tier list drops
    if (currentMode === 'tierlist') {
      handleTierDrop(champion, overId, draggedId);
    }
  } catch (error) {
    const appError = error instanceof ValidationError ? error : new ValidationError(
      `Drag and drop error: ${error}`,
      'ドラッグ&ドロップ操作でエラーが発生しました'
    );
    logError(appError, 'handleDragEnd');
    // Don't re-throw to prevent breaking the UI
  }
};