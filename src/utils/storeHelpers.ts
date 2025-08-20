import type { Champion } from '../types';
import { TIER_CONFIG } from './constants';

/**
 * Common store utility functions
 */

/**
 * Find a champion by ID in an array
 */
export const findChampionById = (champions: Champion[], championId: string): Champion | undefined => {
  return champions.find(champion => champion.id === championId);
};

/**
 * Remove a champion from an array by ID
 */
export const removeChampionById = (champions: Champion[], championId: string): Champion[] => {
  return champions.filter(champion => champion.id !== championId);
};

/**
 * Check if a champion exists in an array
 */
export const championExists = (champions: Champion[], championId: string): boolean => {
  return champions.some(champion => champion.id === championId);
};

/**
 * Add a champion to an array if it doesn't already exist
 */
export const addChampionIfNotExists = (champions: Champion[], champion: Champion): Champion[] => {
  if (championExists(champions, champion.id)) {
    return champions;
  }
  return [...champions, champion];
};

/**
 * Replace a champion in an array or add it if it doesn't exist
 */
export const upsertChampion = (champions: Champion[], champion: Champion): Champion[] => {
  const exists = championExists(champions, champion.id);
  if (exists) {
    return champions.map(c => c.id === champion.id ? champion : c);
  }
  return [...champions, champion];
};

/**
 * Move an item from one array to another by index
 */
export const moveItemBetweenArrays = <T>(
  sourceArray: T[], 
  targetArray: T[], 
  sourceIndex: number
): { source: T[]; target: T[]; movedItem: T | null } => {
  if (sourceIndex < 0 || sourceIndex >= sourceArray.length) {
    return { source: sourceArray, target: targetArray, movedItem: null };
  }

  const movedItem = sourceArray[sourceIndex];
  const newSource = sourceArray.filter((_, index) => index !== sourceIndex);
  const newTarget = [...targetArray, movedItem];

  return { source: newSource, target: newTarget, movedItem };
};

/**
 * Safely parse integer with fallback
 */
export const safeParseInt = (value: string, fallback: number = 0): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Clamp a number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Generate a unique ID based on timestamp
 */
export const generateUniqueId = (prefix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * Deep clone an object (simple implementation for our use case)
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
};

/**
 * Validate coordinates within grid bounds
 */
export const validateCoordinates = (
  x: number, 
  y: number, 
  maxX: number, 
  maxY: number
): { x: number; y: number; valid: boolean } => {
  const clampedX = clamp(x, 0, maxX);
  const clampedY = clamp(y, 0, maxY);
  const valid = x >= 0 && x <= maxX && y >= 0 && y <= maxY;
  
  return { x: clampedX, y: clampedY, valid };
};

/**
 * Create a default tier structure
 */
export const createDefaultTiers = () => {
  return TIER_CONFIG.DEFAULT_LABELS.map((label, index) => ({
    id: `${label.toLowerCase()}-tier`,
    label,
    color: TIER_CONFIG.DEFAULT_COLORS[label as keyof typeof TIER_CONFIG.DEFAULT_COLORS],
    champions: [],
    order: index,
  }));
};