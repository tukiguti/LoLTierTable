import { RosterChampionTile } from './RosterChampionTile';
import type { Champion } from '../../types';

interface ChampionGridProps {
  champions: Champion[];
  /** デスクトップ gap 6px・モバイル gap 8px（仕様書§5・§9）。列数はどちらも5列 */
  variant: 'desktop' | 'mobile';
}

/** サイドバーのアイコン一覧（5列グリッド）。ドラッグ元アイコンはRosterChampionTileが担う */
export function ChampionGrid({ champions, variant }: ChampionGridProps) {
  return (
    <div className={`grid grid-cols-5 ${variant === 'mobile' ? 'gap-[8px]' : 'gap-[6px]'}`}>
      {champions.map((champion) => (
        <RosterChampionTile key={champion.id} champion={champion} variant={variant} />
      ))}
    </div>
  );
}
