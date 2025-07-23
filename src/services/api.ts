import type { Champion, ChampionData } from '../types';

const DDRAGON_VERSION = '15.14.1';
const LANGUAGE = 'ja_JP';

export const API_ENDPOINTS = {
  CHAMPIONS: `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/${LANGUAGE}/champion.json`,
  CHAMPION_ICON: (championId: string) => 
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championId}.png`,
  SPLASH_ART: (championId: string) => 
    `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`,
  LOCAL_CHAMPION_ICON: (championId: string) => `/champions/${championId}.png`,
  LOCAL_TILE_ICON: (championId: string) => `/tiles/${championId}_0.jpg`,
  LOCAL_MANIFEST: '/champions/manifest.json',
  LOCAL_DATA: '/data/champions.json',
  LOCAL_DATA_MANIFEST: '/data/manifest.json',
} as const;

export class DataDragonAPI {
  private static instance: DataDragonAPI;
  private championCache: Champion[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour
  private useLocalIcons: boolean = false;

  static getInstance(): DataDragonAPI {
    if (!DataDragonAPI.instance) {
      DataDragonAPI.instance = new DataDragonAPI();
    }
    return DataDragonAPI.instance;
  }

  async checkLocalData(): Promise<boolean> {
    try {
      // Check if local data manifest exists
      const dataResponse = await fetch(API_ENDPOINTS.LOCAL_DATA_MANIFEST);
      if (dataResponse.ok) {
        await dataResponse.json();
        this.useLocalIcons = true;
        console.log('🎯 Local champion data found! Using local assets.');
        return true;
      }
    } catch (error) {
      console.log('📡 No local data found, using remote assets.');
    }
    
    this.useLocalIcons = false;
    return false;
  }

  private getChampionIconUrl(championId: string): string {
    // Use local champion icons (square icons) instead of tiles
    return this.useLocalIcons 
      ? API_ENDPOINTS.LOCAL_CHAMPION_ICON(championId)
      : API_ENDPOINTS.CHAMPION_ICON(championId);
  }

  async fetchChampions(): Promise<Champion[]> {
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (this.championCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.championCache;
    }

    // Check for local data first
    const hasLocalData = await this.checkLocalData();
    
    try {
      let data: ChampionData;
      
      if (hasLocalData) {
        // Use local data
        console.log('📁 Loading champions from local data...');
        const response = await fetch(API_ENDPOINTS.LOCAL_DATA);
        if (!response.ok) {
          throw new Error(`Failed to fetch local champions: ${response.status}`);
        }
        data = await response.json();
      } else {
        // Use remote data
        console.log('📡 Loading champions from remote API...');
        const response = await fetch(API_ENDPOINTS.CHAMPIONS);
        if (!response.ok) {
          throw new Error(`Failed to fetch champions: ${response.status} ${response.statusText}`);
        }
        data = await response.json();
      }
      
      const champions: Champion[] = Object.values(data.data).map(champion => ({
        id: champion.id,
        name: champion.name,
        title: champion.title,
        iconUrl: this.getChampionIconUrl(champion.id),
        splashUrl: API_ENDPOINTS.SPLASH_ART(champion.id),
        tags: champion.tags,
      }));

      this.championCache = champions;
      this.lastFetch = now;
      
      // Save to localStorage for offline access
      this.saveCachedChampions(champions);
      
      return champions;
    } catch (error) {
      console.error('Error fetching champions:', error);
      
      // Try to load from cache if both local and remote fail
      const cachedChampions = this.loadCachedChampions();
      if (cachedChampions) {
        console.warn('Using cached champion data due to error');
        return cachedChampions;
      }
      
      throw new Error('Failed to fetch champions and no cached data available');
    }
  }

  private saveCachedChampions(champions: Champion[]): void {
    try {
      const cacheData = {
        champions,
        timestamp: Date.now(),
      };
      localStorage.setItem('lol-champions-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save champions to localStorage:', error);
    }
  }

  private loadCachedChampions(): Champion[] | null {
    try {
      const cachedData = localStorage.getItem('lol-champions-cache');
      if (!cachedData) return null;

      const { champions, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      
      // Check if cached data is not too old (7 days)
      if (now - timestamp < 1000 * 60 * 60 * 24 * 7) {
        return champions;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to load champions from localStorage:', error);
      return null;
    }
  }

  async preloadChampionImages(champions: Champion[]): Promise<void> {
    // Skip preloading if using local icons (they should be fast to load)
    if (this.useLocalIcons) {
      console.log('🚀 Using local icons, skipping preload.');
      return;
    }

    const loadPromises = champions.slice(0, 20).map(champion => 
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
        img.src = champion.iconUrl;
      })
    );

    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.warn('Some champion images failed to preload:', error);
    }
  }

  clearCache(): void {
    this.championCache = null;
    this.lastFetch = 0;
    localStorage.removeItem('lol-champions-cache');
  }

  // Force refresh champions data
  async refreshChampions(): Promise<Champion[]> {
    this.clearCache();
    return this.fetchChampions();
  }
}

export const api = DataDragonAPI.getInstance();