import type { TierColor } from '../types';

/**
 * 段の既定パレット5色。デザイン仕様§2「段のパレット」の実測値そのまま。
 * 各段のラベル下に並ぶ色丸のクリック候補にもこの配列をそのまま使う。
 */
export const TIER_PALETTE: TierColor[] = [
  { id: 's', background: 'oklch(0.55 0.17 25)', text: 'oklch(0.97 0.02 25)' },
  { id: 'a', background: 'oklch(0.63 0.14 55)', text: 'oklch(0.20 0.05 55)' },
  { id: 'b', background: 'oklch(0.75 0.13 92)', text: 'oklch(0.22 0.05 92)' },
  { id: 'c', background: 'oklch(0.58 0.11 155)', text: 'oklch(0.97 0.02 155)' },
  { id: 'd', background: 'oklch(0.52 0.10 255)', text: 'oklch(0.97 0.02 255)' },
];

export function getTierColor(colorId: string): TierColor {
  return TIER_PALETTE.find((color) => color.id === colorId) ?? TIER_PALETTE[TIER_PALETTE.length - 1];
}
