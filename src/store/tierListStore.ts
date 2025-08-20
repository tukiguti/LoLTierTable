import { create } from 'zustand';
import type { TierListState, Tier, Champion } from '../types';
import { createDefaultTiers, findChampionById, removeChampionById, generateUniqueId } from '../utils/storeHelpers';
import { TIER_CONFIG } from '../utils/constants';

const DEFAULT_TIERS: Tier[] = createDefaultTiers();

export const useTierListStore = create<TierListState>((set) => ({
  tiers: DEFAULT_TIERS,
  unplacedChampions: [],
  stagingChampions: [],

  setUnplacedChampions: (champions: Champion[]) =>
    set({ unplacedChampions: champions }),

  addChampionToTier: (championId: string, tierId: string) =>
    set((state) => {
      const championToAdd = findChampionById(state.unplacedChampions, championId);
      
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

      return { ...state, tiers: newTiers };
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

      const championToMove = findChampionById(state.unplacedChampions, championId);
      
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
        id: generateUniqueId('tier'),
        label: `Tier ${newOrder + 1}`,
        color: TIER_CONFIG.DEFAULT_COLORS.DEFAULT,
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
      stagingChampions: removeChampionById(state.stagingChampions, championId)
    })),

  clearStaging: () =>
    set((state) => ({
      ...state,
      stagingChampions: []
    })),
}));