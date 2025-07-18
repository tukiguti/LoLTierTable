import type { TierListData } from './tierlist';
import type { MatrixData } from './matrix';

export type DiagramType = 'tierlist' | 'matrix';

export interface SavedDiagram {
  id: string;
  name: string;
  type: DiagramType;
  data: TierListData | MatrixData;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagramData {
  name: string;
  type: DiagramType;
  data: TierListData | MatrixData;
}

export interface DiagramManagerState {
  savedDiagrams: SavedDiagram[];
  currentDiagram: SavedDiagram | null;
  saveDiagram: (diagram: DiagramData) => void;
  loadDiagram: (diagramId: string) => void;
  deleteDiagram: (diagramId: string) => void;
  updateDiagram: (diagramId: string, data: TierListData | MatrixData) => void;
  setCurrentDiagram: (diagram: SavedDiagram | null) => void;
}