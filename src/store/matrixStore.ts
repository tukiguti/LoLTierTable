import { create } from 'zustand';
import type { MatrixState, Champion, PlacedChampion } from '../types';

export const useMatrixStore = create<MatrixState>((set) => ({
  champions: [],
  xAxisLabel: 'X軸',
  yAxisLabel: 'Y軸',
  gridSize: {
    width: 11,
    height: 11,
  },

  addChampion: (champion: Champion, x: number, y: number) =>
    set((state) => {
      const newPlacedChampion: PlacedChampion = {
        champion,
        x: Math.max(0, Math.min(x, state.gridSize.width - 1)),
        y: Math.max(0, Math.min(y, state.gridSize.height - 1)),
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
      gridSize: { width: 11, height: 11 },
    })),
}));