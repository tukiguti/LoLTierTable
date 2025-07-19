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
      const newPlacedChampion: PlacedChampion = {
        champion,
        x: state.matrixType === 'quadrant' && quadrant 
          ? Math.max(0, Math.min(x, Math.floor(state.gridSize.width / 2) - 1))
          : Math.max(0, Math.min(x, state.gridSize.width - 1)),
        y: state.matrixType === 'quadrant' && quadrant 
          ? Math.max(0, Math.min(y, Math.floor(state.gridSize.width / 2) - 1))
          : Math.max(0, Math.min(y, state.gridSize.height - 1)),
        quadrant,
      };

      return {
        ...state,
        champions: [...state.champions, newPlacedChampion]
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