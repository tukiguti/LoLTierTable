import { create } from 'zustand';
import type { DiagramManagerState, SavedDiagram, DiagramData, TierListData, MatrixData } from '../types';
import { storage } from '../utils/storage';

export const useDiagramStore = create<DiagramManagerState>((set) => ({
  savedDiagrams: storage.loadDiagrams(),
  currentDiagram: null,

  saveDiagram: (diagram: DiagramData) =>
    set((state) => {
      const newDiagram: SavedDiagram = {
        id: `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: diagram.name,
        type: diagram.type,
        data: diagram.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedDiagrams = [...state.savedDiagrams, newDiagram];
      
      try {
        storage.saveDiagrams(updatedDiagrams);
        return {
          ...state,
          savedDiagrams: updatedDiagrams,
          currentDiagram: newDiagram,
        };
      } catch (error) {
        console.error('Failed to save diagram:', error);
        throw error;
      }
    }),

  loadDiagram: (diagramId: string) =>
    set((state) => {
      const diagram = state.savedDiagrams.find(d => d.id === diagramId);
      if (!diagram) {
        console.warn(`Diagram with id ${diagramId} not found`);
        return state;
      }

      return {
        ...state,
        currentDiagram: diagram,
      };
    }),

  deleteDiagram: (diagramId: string) =>
    set((state) => {
      try {
        storage.deleteDiagram(diagramId);
        
        const updatedDiagrams = state.savedDiagrams.filter(d => d.id !== diagramId);
        const currentDiagram = state.currentDiagram?.id === diagramId 
          ? null 
          : state.currentDiagram;

        return {
          ...state,
          savedDiagrams: updatedDiagrams,
          currentDiagram,
        };
      } catch (error) {
        console.error('Failed to delete diagram:', error);
        throw error;
      }
    }),

  updateDiagram: (diagramId: string, data: TierListData | MatrixData) =>
    set((state) => {
      const diagramIndex = state.savedDiagrams.findIndex(d => d.id === diagramId);
      if (diagramIndex === -1) {
        console.warn(`Diagram with id ${diagramId} not found`);
        return state;
      }

      const updatedDiagram: SavedDiagram = {
        ...state.savedDiagrams[diagramIndex],
        data,
        updatedAt: new Date(),
      };

      const updatedDiagrams = [...state.savedDiagrams];
      updatedDiagrams[diagramIndex] = updatedDiagram;

      try {
        storage.saveDiagrams(updatedDiagrams);
        
        return {
          ...state,
          savedDiagrams: updatedDiagrams,
          currentDiagram: state.currentDiagram?.id === diagramId 
            ? updatedDiagram 
            : state.currentDiagram,
        };
      } catch (error) {
        console.error('Failed to update diagram:', error);
        throw error;
      }
    }),

  setCurrentDiagram: (diagram: SavedDiagram | null) =>
    set((state) => ({
      ...state,
      currentDiagram: diagram,
    })),
}));