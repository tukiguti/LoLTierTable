import type { Champion } from './champion';
import type { DiagramType } from './diagram';

export interface AppState {
  champions: Champion[];
  loading: boolean;
  currentMode: DiagramType;
  ui: {
    sidebarOpen: boolean;
    searchFilter: string;
    selectedChampion: Champion | null;
  };
  setChampions: (champions: Champion[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentMode: (mode: DiagramType) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchFilter: (filter: string) => void;
  setSelectedChampion: (champion: Champion | null) => void;
}

export interface ChampionPanelProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
  searchFilter: string;
  onSearchChange: (filter: string) => void;
}

export interface TierListProps {
  onChampionMove: (championId: string, fromTier: string, toTier: string) => void;
}

export interface MatrixProps {
  onChampionMove: (championId: string, x: number, y: number) => void;
  onAxisLabelChange: (axis: 'x' | 'y', label: string) => void;
}

export interface DiagramManagerProps {
  onLoad: (diagramId: string) => void;
  onDelete: (diagramId: string) => void;
  onSave: (name: string) => void;
}