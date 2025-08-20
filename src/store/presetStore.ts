import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChampionPreset } from '../data/championPresets';
import { DEFAULT_PRESETS, SAMPLE_LANE_PRESETS } from '../data/championPresets';
import type { Champion } from '../types/champion';

interface PresetStore {
  presets: ChampionPreset[];
  
  // プリセット管理
  addPreset: (preset: Omit<ChampionPreset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePreset: (id: string, updates: Partial<ChampionPreset>) => void;
  deletePreset: (id: string) => void;
  
  // プリセットからチャンピオン取得
  getChampionsForPreset: (preset: ChampionPreset, allChampions: Champion[]) => Champion[];
  
  // 初期化
  initializePresets: () => void;
  
  // プリセット設定管理
  showDefaultPresets: boolean;
  showCustomPresets: boolean;
  setShowDefaultPresets: (show: boolean) => void;
  setShowCustomPresets: (show: boolean) => void;
}

export const usePresetStore = create<PresetStore>()(
  persist(
    (set, get) => ({
      presets: [],
      showDefaultPresets: true,
      showCustomPresets: true,

      addPreset: (presetData) => {
        const newPreset: ChampionPreset = {
          ...presetData,
          id: `custom-${Date.now()}`,
          isCustom: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          presets: [...state.presets, newPreset]
        }));
      },

      updatePreset: (id, updates) => {
        set((state) => ({
          presets: state.presets.map(preset =>
            preset.id === id
              ? { ...preset, ...updates, updatedAt: new Date().toISOString() }
              : preset
          )
        }));
      },

      deletePreset: (id) => {
        set((state) => ({
          presets: state.presets.filter(preset => preset.id !== id)
        }));
      },

      getChampionsForPreset: (preset, allChampions) => {
        // タグベースのフィルタリング
        if (preset.tags && preset.tags.length > 0) {
          return allChampions.filter(champion =>
            preset.tags!.some(tag => champion.tags.includes(tag))
          );
        }
        
        // 手動指定されたチャンピオンリスト
        if (preset.champions && preset.champions.length > 0) {
          return preset.champions
            .map(id => allChampions.find(c => c.id === id))
            .filter((c): c is Champion => c !== undefined);
        }
        
        return [];
      },

      initializePresets: () => {
        const { presets } = get();
        
        // 初回起動時のみデフォルトプリセットを追加
        if (presets.length === 0) {
          set({
            presets: [...DEFAULT_PRESETS, ...SAMPLE_LANE_PRESETS]
          });
        }
      },

      setShowDefaultPresets: (show) => set({ showDefaultPresets: show }),
      setShowCustomPresets: (show) => set({ showCustomPresets: show }),
    }),
    {
      name: 'preset-store',
      version: 1,
    }
  )
);