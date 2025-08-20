import { create } from 'zustand';
import type { MatrixState, Champion, PlacedChampion } from '../types';
import { clamp } from '../utils/storeHelpers';
import { GRID_CONFIG, MATRIX_LABELS } from '../utils/constants';

export const useMatrixStore = create<MatrixState>((set) => ({
  champions: [],
  xAxisLabel: MATRIX_LABELS.DEFAULT_X_AXIS,
  yAxisLabel: MATRIX_LABELS.DEFAULT_Y_AXIS,
  topLabel: MATRIX_LABELS.DEFAULT_TOP,
  bottomLabel: MATRIX_LABELS.DEFAULT_BOTTOM,
  leftLabel: MATRIX_LABELS.DEFAULT_LEFT,
  rightLabel: MATRIX_LABELS.DEFAULT_RIGHT,
  matrixType: 'grid',
  quadrantLabels: {
    topLeft: MATRIX_LABELS.DEFAULT_QUADRANTS.TOP_LEFT,
    topRight: MATRIX_LABELS.DEFAULT_QUADRANTS.TOP_RIGHT,
    bottomLeft: MATRIX_LABELS.DEFAULT_QUADRANTS.BOTTOM_LEFT,
    bottomRight: MATRIX_LABELS.DEFAULT_QUADRANTS.BOTTOM_RIGHT,
  },
  zoneLabels: {
    topLeft: MATRIX_LABELS.DEFAULT_ZONES.TOP_LEFT,
    topRight: MATRIX_LABELS.DEFAULT_ZONES.TOP_RIGHT,
    bottomLeft: MATRIX_LABELS.DEFAULT_ZONES.BOTTOM_LEFT,
    bottomRight: MATRIX_LABELS.DEFAULT_ZONES.BOTTOM_RIGHT,
  },
  gridSize: {
    width: GRID_CONFIG.DEFAULT_WIDTH,
    height: GRID_CONFIG.DEFAULT_HEIGHT,
  },

  addChampion: (champion: Champion, x: number, y: number, quadrant?: string) =>
    set((state) => {
      // Adding champion to matrix
      
      // For scatter mode, if quadrant is undefined (center axis), use full grid coordinates
      // For scatter mode with quadrant, use limited coordinates (0-4)
      // For grid mode, check if we're in freeboard mode (large coordinates) or grid mode
      let maxX: number, maxY: number;
      
      if (x > 20 || y > 20) {
        // Pixel positioning mode (either freeboard or zone freeboard)
        if (quadrant && quadrant !== 'center' && state.matrixType === 'scatter') {
          // Zone scatter freeboard mode
          maxX = 480;   // Zone width
          maxY = 360;   // Zone height
        } else {
          // Main freeboard mode
          maxX = 960;   // Board width
          maxY = 640;   // Board height
        }
      } else if (state.matrixType === 'scatter' && quadrant && quadrant !== 'center') {
        // Traditional zone scatter mode (small coordinates)
        maxX = GRID_CONFIG.MAX_ZONE_SIZE;  // 0-4 for zones
        maxY = GRID_CONFIG.MAX_ZONE_SIZE;
      } else {
        // Traditional grid mode
        maxX = state.gridSize.width - 1;   // 0-10 for grid mode
        maxY = state.gridSize.height - 1;
      }

      const newPlacedChampion: PlacedChampion = {
        champion,
        x: clamp(x, 0, maxX),
        y: clamp(y, 0, maxY),
        quadrant,
      };
      
      // Champion placed successfully

      // Remove any existing champion at the same position OR same champion ID
      const filteredChampions = state.champions.filter(pc => 
        !(pc.x === newPlacedChampion.x && 
          pc.y === newPlacedChampion.y && 
          pc.quadrant === newPlacedChampion.quadrant) &&
        pc.champion.id !== newPlacedChampion.champion.id
      );

      return {
        ...state,
        champions: [...filteredChampions, newPlacedChampion]
      };
    }),

  removeChampion: (championId: string) =>
    set((state) => {
      const updatedChampions = state.champions.filter(pc => pc.champion.id !== championId);
      
      // Reorganize staging area positions to fill gaps
      const stagingChampions = updatedChampions.filter(pc => pc.quadrant === 'staging');
      const nonStagingChampions = updatedChampions.filter(pc => pc.quadrant !== 'staging');
      
      // Reassign x positions for staging champions to fill gaps
      const reorganizedStagingChampions = stagingChampions.map((pc, index) => ({
        ...pc,
        x: index,
        y: 0
      }));
      
      return {
        ...state,
        champions: [...nonStagingChampions, ...reorganizedStagingChampions]
      };
    }),

  moveChampion: (championId: string, x: number, y: number) =>
    set((state) => ({
      ...state,
      champions: state.champions.map(pc =>
        pc.champion.id === championId
          ? {
              ...pc,
              x: clamp(x, 0, state.gridSize.width - 1),
              y: clamp(y, 0, state.gridSize.height - 1),
            }
          : pc
      )
    })),

  updateXAxisLabel: (label: string) =>
    set((state) => ({ ...state, xAxisLabel: label })),

  updateYAxisLabel: (label: string) =>
    set((state) => ({ ...state, yAxisLabel: label })),

  updateTopLabel: (label: string) =>
    set((state) => ({ ...state, topLabel: label })),

  updateBottomLabel: (label: string) =>
    set((state) => ({ ...state, bottomLabel: label })),

  updateLeftLabel: (label: string) =>
    set((state) => ({ ...state, leftLabel: label })),

  updateRightLabel: (label: string) =>
    set((state) => ({ ...state, rightLabel: label })),

  setMatrixType: (type: 'grid' | 'scatter' | 'freeboard') =>
    set((state) => ({ ...state, matrixType: type })),

  updateQuadrantLabel: (quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', label: string) =>
    set((state) => ({
      ...state,
      quadrantLabels: {
        ...state.quadrantLabels,
        [quadrant]: label,
      },
    })),

  updateZoneLabel: (zone: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', label: string) =>
    set((state) => ({
      ...state,
      zoneLabels: {
        ...state.zoneLabels,
        [zone]: label,
      },
    })),

  updateGridSize: (width: number, height: number) =>
    set((state) => {
      // Force odd numbers for center axis
      const newWidth = clamp(width, GRID_CONFIG.MIN_SIZE, GRID_CONFIG.MAX_SIZE);
      const newHeight = clamp(height, GRID_CONFIG.MIN_SIZE, GRID_CONFIG.MAX_SIZE);
      const oddWidth = newWidth % 2 === 0 ? newWidth + 1 : newWidth;
      const oddHeight = newHeight % 2 === 0 ? newHeight + 1 : newHeight;
      
      // Adjust champion positions if they're outside new grid
      const adjustedChampions = state.champions.map(pc => ({
        ...pc,
        x: Math.min(pc.x, oddWidth - 1),
        y: Math.min(pc.y, oddHeight - 1),
      }));

      return {
        ...state,
        gridSize: { width: oddWidth, height: oddHeight },
        champions: adjustedChampions,
      };
    }),

  updateAxisLabels: (xLabel: string, yLabel: string) =>
    set((state) => ({ ...state, xAxisLabel: xLabel, yAxisLabel: yLabel })),

  setGridSize: (size: number) =>
    set((state) => {
      const newSize = clamp(size, GRID_CONFIG.MIN_SIZE, GRID_CONFIG.MAX_SIZE);
      const oddSize = newSize % 2 === 0 ? newSize + 1 : newSize;
      
      const adjustedChampions = state.champions.map(pc => ({
        ...pc,
        x: Math.min(pc.x, oddSize - 1),
        y: Math.min(pc.y, oddSize - 1),
      }));

      return {
        ...state,
        gridSize: { width: oddSize, height: oddSize },
        champions: adjustedChampions,
      };
    }),

  // Batch add champions to staging area
  clearStagingArea: () =>
    set((state) => ({
      ...state,
      champions: state.champions.filter(pc => pc.quadrant !== 'staging')
    })),

  addChampionsToStaging: (championsToAdd: Champion[]) =>
    set((state) => {
      // Remove existing staging champions
      const nonStagingChampions = state.champions.filter(pc => pc.quadrant !== 'staging');
      
      // Create new staging champions with unique positions
      const newStagingChampions = championsToAdd.map((champion, index) => ({
        champion,
        x: index,
        y: 0,
        quadrant: 'staging' as string
      }));
      
      
      return {
        ...state,
        champions: [...nonStagingChampions, ...newStagingChampions]
      };
    }),

  resetMatrix: () =>
    set(() => ({
      champions: [],
      xAxisLabel: MATRIX_LABELS.DEFAULT_X_AXIS,
      yAxisLabel: MATRIX_LABELS.DEFAULT_Y_AXIS,
      topLabel: MATRIX_LABELS.DEFAULT_TOP,
      bottomLabel: MATRIX_LABELS.DEFAULT_BOTTOM,
      leftLabel: MATRIX_LABELS.DEFAULT_LEFT,
      rightLabel: MATRIX_LABELS.DEFAULT_RIGHT,
      matrixType: 'grid',
      quadrantLabels: {
        topLeft: MATRIX_LABELS.DEFAULT_QUADRANTS.TOP_LEFT,
        topRight: MATRIX_LABELS.DEFAULT_QUADRANTS.TOP_RIGHT,
        bottomLeft: MATRIX_LABELS.DEFAULT_QUADRANTS.BOTTOM_LEFT,
        bottomRight: MATRIX_LABELS.DEFAULT_QUADRANTS.BOTTOM_RIGHT,
      },
      gridSize: { width: GRID_CONFIG.DEFAULT_WIDTH, height: GRID_CONFIG.DEFAULT_HEIGHT },
    })),
}));