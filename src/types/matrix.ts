import type { Champion } from './champion';

export interface PlacedChampion {
  champion: Champion;
  x: number;
  y: number;
  quadrant?: string; // For quadrant-based positioning
}

export interface MatrixData {
  champions: PlacedChampion[];
  xAxisLabel: string;
  yAxisLabel: string;
  topLabel: string;
  bottomLabel: string;
  leftLabel: string;
  rightLabel: string;
  gridSize: {
    width: number;
    height: number;
  };
  matrixType: 'grid' | 'quadrant';
  quadrantLabels?: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
}

export interface MatrixState {
  champions: PlacedChampion[];
  xAxisLabel: string;
  yAxisLabel: string;
  topLabel: string;
  bottomLabel: string;
  leftLabel: string;
  rightLabel: string;
  gridSize: {
    width: number;
    height: number;
  };
  matrixType: 'grid' | 'quadrant';
  quadrantLabels: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  addChampion: (champion: Champion, x: number, y: number, quadrant?: string) => void;
  removeChampion: (championId: string) => void;
  moveChampion: (championId: string, x: number, y: number) => void;
  updateXAxisLabel: (label: string) => void;
  updateYAxisLabel: (label: string) => void;
  updateTopLabel: (label: string) => void;
  updateBottomLabel: (label: string) => void;
  updateLeftLabel: (label: string) => void;
  updateRightLabel: (label: string) => void;
  updateGridSize: (width: number, height: number) => void;
  setMatrixType: (type: 'grid' | 'quadrant') => void;
  updateQuadrantLabel: (quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', label: string) => void;
  updateAxisLabels: (xLabel: string, yLabel: string) => void;
  setGridSize: (size: number) => void;
  resetMatrix: () => void;
}