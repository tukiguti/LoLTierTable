import { create } from 'zustand';
import type { AppState, Champion, DiagramType } from '../types';

export const useAppStore = create<AppState>((set) => ({
  champions: [],
  loading: false,
  currentMode: 'tierlist',
  ui: {
    sidebarOpen: true,
    searchFilter: '',
    selectedChampion: null,
  },
  
  setChampions: (champions: Champion[]) =>
    set({ champions }),
  
  setLoading: (loading: boolean) =>
    set({ loading }),
  
  setCurrentMode: (mode: DiagramType) =>
    set({ currentMode: mode }),
  
  setSidebarOpen: (open: boolean) =>
    set((state) => ({
      ui: { ...state.ui, sidebarOpen: open }
    })),
  
  setSearchFilter: (filter: string) =>
    set((state) => ({
      ui: { ...state.ui, searchFilter: filter }
    })),
  
  setSelectedChampion: (champion: Champion | null) =>
    set((state) => ({
      ui: { ...state.ui, selectedChampion: champion }
    })),
}));