import type { SavedDiagram } from '../types';

const STORAGE_KEYS = {
  DIAGRAMS: 'lol-tier-table-diagrams',
  SETTINGS: 'lol-tier-table-settings',
} as const;

export class StorageManager {
  static saveDiagrams(diagrams: SavedDiagram[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DIAGRAMS, JSON.stringify(diagrams));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some diagrams to free up space.');
      }
      throw new Error('Failed to save diagrams to storage.');
    }
  }

  static loadDiagrams(): SavedDiagram[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DIAGRAMS);
      if (!stored) return [];

      const diagrams = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return diagrams.map((diagram: SavedDiagram) => ({
        ...diagram,
        createdAt: new Date(diagram.createdAt),
        updatedAt: new Date(diagram.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load diagrams from storage:', error);
      return [];
    }
  }

  static deleteDiagram(diagramId: string): void {
    const diagrams = this.loadDiagrams();
    const filtered = diagrams.filter(d => d.id !== diagramId);
    this.saveDiagrams(filtered);
  }

  static getStorageInfo(): { used: number; available: number } {
    let used = 0;
    
    try {
      // Calculate approximate storage usage
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.warn('Could not calculate storage usage:', error);
    }

    // Most browsers allow 5-10MB for localStorage
    const estimated = 5 * 1024 * 1024; // 5MB
    
    return {
      used,
      available: Math.max(0, estimated - used),
    };
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storage = StorageManager;