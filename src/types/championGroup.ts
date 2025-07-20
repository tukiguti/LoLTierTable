import type { Champion } from './champion';

export interface ChampionGroup {
  name: string;
  description?: string;
  champions: string[]; // Champion IDs or names
  createdAt?: string;
  version?: string;
}

export interface ChampionGroupData {
  groups: ChampionGroup[];
  metadata?: {
    createdAt: string;
    appVersion: string;
    totalChampions: number;
  };
}

// For internal use after resolving champion data
export interface ResolvedChampionGroup {
  name: string;
  description?: string;
  champions: Champion[];
  createdAt?: string;
  version?: string;
}