import type { Champion } from './champion';

export interface Tier {
  id: string;
  label: string;
  color: string;
  champions: Champion[];
  order: number;
}

export interface TierListData {
  tiers: Tier[];
  unplacedChampions: Champion[];
}

export interface TierListState {
  tiers: Tier[];
  unplacedChampions: Champion[];
  setUnplacedChampions: (champions: Champion[]) => void;
  addChampionToTier: (championId: string, tierId: string) => void;
  removeChampionFromTier: (championId: string, tierId: string, championIndex?: number) => void;
  moveChampionBetweenTiers: (championId: string, fromTierId: string, toTierId: string) => void;
  updateTierLabel: (tierId: string, newLabel: string) => void;
  updateTierColor: (tierId: string, newColor: string) => void;
  addTier: () => void;
  removeTier: (tierId: string) => void;
  resetTierList: () => void;
  resetTiers: () => void;
}