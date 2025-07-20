import { create } from 'zustand';
import type { TierListState, Tier, Champion } from '../types';

const DEFAULT_TIERS: Tier[] = [
  { id: 's-tier', label: 'S', color: '#ff6b6b', champions: [], order: 0 },
  { id: 'a-tier', label: 'A', color: '#4ecdc4', champions: [], order: 1 },
  { id: 'b-tier', label: 'B', color: '#45b7d1', champions: [], order: 2 },
  { id: 'c-tier', label: 'C', color: '#f9ca24', champions: [], order: 3 },
  { id: 'd-tier', label: 'D', color: '#f0932b', champions: [], order: 4 },
];

export const useTierListStore = create<TierListState>((set) => ({
  tiers: DEFAULT_TIERS,
  unplacedChampions: [],
  stagingChampions: [],

  setUnplacedChampions: (champions: Champion[]) =>
    set({ unplacedChampions: champions }),

  addChampionToTier: (championId: string, tierId: string) =>
    set((state) => {
      // Always get fresh champion instance from unplacedChampions
      const championToAdd = state.unplacedChampions.find(c => c.id === championId);
      
      if (!championToAdd) return state;

      const newTiers = state.tiers.map(tier => {
        if (tier.id === tierId) {
          return {
            ...tier,
            champions: [...tier.champions, championToAdd]
          };
        }
        return tier;
      });

      return {
        ...state,
        tiers: newTiers,
      };
    }),

  removeChampionFromTier: (championId: string, tierId: string, championIndex?: number) =>
    set((state) => {
      const tier = state.tiers.find(t => t.id === tierId);
      if (!tier) return state;

      let indexToRemove: number;
      if (championIndex !== undefined) {
        // Remove specific index
        indexToRemove = championIndex;
      } else {
        // Remove first occurrence
        indexToRemove = tier.champions.findIndex(c => c.id === championId);
      }
      
      if (indexToRemove === -1 || indexToRemove >= tier.champions.length) return state;

      const newTiers = state.tiers.map(t => 
        t.id === tierId 
          ? { 
              ...t, 
              champions: t.champions.filter((_, index) => index !== indexToRemove)
            }
          : t
      );

      return {
        ...state,
        tiers: newTiers,
      };
    }),

  moveChampionBetweenTiers: (championId: string, fromTierId: string, toTierId: string) =>
    set((state) => {
      if (fromTierId === toTierId) return state;

      // Always get fresh champion instance from unplacedChampions
      const championToMove = state.unplacedChampions.find(c => c.id === championId);
      
      if (!championToMove) return state;

      const newTiers = state.tiers.map(tier => {
        if (tier.id === toTierId) {
          return {
            ...tier,
            champions: [...tier.champions, championToMove]
          };
        }
        return tier;
      });

      return { ...state, tiers: newTiers };
    }),

  updateTierLabel: (tierId: string, newLabel: string) =>
    set((state) => ({
      ...state,
      tiers: state.tiers.map(tier =>
        tier.id === tierId ? { ...tier, label: newLabel } : tier
      )
    })),

  updateTierColor: (tierId: string, newColor: string) =>
    set((state) => ({
      ...state,
      tiers: state.tiers.map(tier =>
        tier.id === tierId ? { ...tier, color: newColor } : tier
      )
    })),

  addTier: () =>
    set((state) => {
      const newOrder = Math.max(...state.tiers.map(t => t.order)) + 1;
      const newTier: Tier = {
        id: `tier-${Date.now()}`,
        label: `Tier ${newOrder + 1}`,
        color: '#95a5a6',
        champions: [],
        order: newOrder,
      };
      
      return {
        ...state,
        tiers: [...state.tiers, newTier]
      };
    }),

  removeTier: (tierId: string) =>
    set((state) => {
      const tierToRemove = state.tiers.find(t => t.id === tierId);
      if (!tierToRemove) return state;

      return {
        ...state,
        tiers: state.tiers.filter(t => t.id !== tierId),
        // Don't add champions back to unplacedChampions - they remain available in champion panel
      };
    }),

  resetTierList: () =>
    set((state) => ({
      tiers: DEFAULT_TIERS,
      unplacedChampions: state.unplacedChampions // Keep unplacedChampions available
    })),

  resetTiers: () =>
    set((state) => ({
      tiers: DEFAULT_TIERS,
      unplacedChampions: state.unplacedChampions // Keep unplacedChampions available
    })),

  // Staging area functions
  addChampionToStaging: (champion: Champion) =>
    set((state) => {
      // Remove champion from existing location first
      const newTiers = state.tiers.map(tier => ({
        ...tier,
        champions: tier.champions.filter(c => c.id !== champion.id)
      }));
      
      // Remove from staging if already there to avoid duplicates
      const newStagingChampions = state.stagingChampions.filter(c => c.id !== champion.id);
      
      return {
        ...state,
        tiers: newTiers,
        stagingChampions: [...newStagingChampions, champion]
      };
    }),

  removeChampionFromStaging: (championId: string) =>
    set((state) => ({
      ...state,
      stagingChampions: state.stagingChampions.filter(c => c.id !== championId)
    })),

  clearStaging: () =>
    set((state) => ({
      ...state,
      stagingChampions: []
    })),
}));