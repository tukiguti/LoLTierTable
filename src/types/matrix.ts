import type { Champion } from './champion';

export interface PlacedChampion {
  champion: Champion;
  x: number;
  y: number;
}

export interface MatrixData {
  champions: PlacedChampion[];
  xAxisLabel: string;
  yAxisLabel: string;
  gridSize: {
    width: number;
    height: number;
  };
}

export interface MatrixState {
  champions: PlacedChampion[];
  xAxisLabel: string;
  yAxisLabel: string;
  gridSize: {
    width: number;
    height: number;
  };
  addChampion: (champion: Champion, x: number, y: number) => void;
  removeChampion: (championId: string) => void;
  moveChampion: (championId: string, x: number, y: number) => void;
  updateXAxisLabel: (label: string) => void;
  updateYAxisLabel: (label: string) => void;
  updateGridSize: (width: number, height: number) => void;
  resetMatrix: () => void;
}