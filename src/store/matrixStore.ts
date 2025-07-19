import { create } from 'zustand';
import type { MatrixState, Champion, PlacedChampion } from '../types';

export const useMatrixStore = create<MatrixState>((set) => ({
  champions: [],
  xAxisLabel: 'X軸',
  yAxisLabel: 'Y軸',
  topLabel: '上',
  bottomLabel: '下',
  leftLabel: '左',
  rightLabel: '右',
  matrixType: 'grid',
  quadrantLabels: {
    topLeft: '第2象限',
    topRight: '第1象限',
    bottomLeft: '第3象限',
    bottomRight: '第4象限',
  },
  gridSize: {
    width: 11,
    height: 11,
  },

  addChampion: (champion: Champion, x: number, y: number, quadrant?: string) =>
    set((state) => {
      // For quadrant mode, if quadrant is undefined (center axis), use full grid coordinates
      // For quadrant mode with quadrant, use limited coordinates (0-4)
      // For grid mode, use full grid coordinates (0-10)
      const newPlacedChampion: PlacedChampion = {
        champion,
        x: state.matrixType === 'quadrant' && quadrant && quadrant !== 'center'
          ? Math.max(0, Math.min(x, Math.floor(state.gridSize.width / 2) - 1))  // 0-4 for quadrants
          : Math.max(0, Math.min(x, state.gridSize.width - 1)),  // 0-10 for center axis or grid mode
        y: state.matrixType === 'quadrant' && quadrant && quadrant !== 'center'
          ? Math.max(0, Math.min(y, Math.floor(state.gridSize.width / 2) - 1))  // 0-4 for quadrants
          : Math.max(0, Math.min(y, state.gridSize.height - 1)),  // 0-10 for center axis or grid mode
        quadrant,
      };

      // Remove any existing champion at the same position
      const filteredChampions = state.champions.filter(pc => 
        !(pc.x === newPlacedChampion.x && 
          pc.y === newPlacedChampion.y && 
          pc.quadrant === newPlacedChampion.quadrant)
      );

      return {
        ...state,
        champions: [...filteredChampions, newPlacedChampion]
      };
    }),

  removeChampion: (championId: string) =>
    set((state) => ({
      ...state,
      champions: state.champions.filter(pc => pc.champion.id !== championId)
    })),

  moveChampion: (championId: string, x: number, y: number) =>
    set((state) => ({
      ...state,
      champions: state.champions.map(pc =>
        pc.champion.id === championId
          ? {
              ...pc,
              x: Math.max(0, Math.min(x, state.gridSize.width - 1)),
              y: Math.max(0, Math.min(y, state.gridSize.height - 1)),
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

  setMatrixType: (type: 'grid' | 'quadrant') =>
    set((state) => ({ ...state, matrixType: type })),

  updateQuadrantLabel: (quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', label: string) =>
    set((state) => ({
      ...state,
      quadrantLabels: {
        ...state.quadrantLabels,
        [quadrant]: label,
      },
    })),

  updateGridSize: (width: number, height: number) =>
    set((state) => {
      // Force odd numbers for center axis
      const newWidth = Math.max(5, Math.min(width, 19));
      const newHeight = Math.max(5, Math.min(height, 19));
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
      const newSize = Math.max(5, Math.min(size, 19));
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


  resetMatrix: () =>
    set(() => ({
      champions: [],
      xAxisLabel: 'X軸',
      yAxisLabel: 'Y軸',
      topLabel: '上',
      bottomLabel: '下',
      leftLabel: '左',
      rightLabel: '右',
      matrixType: 'grid',
      quadrantLabels: {
        topLeft: '第2象限',
        topRight: '第1象限',
        bottomLeft: '第3象限',
        bottomRight: '第4象限',
      },
      gridSize: { width: 11, height: 11 },
    })),
}));