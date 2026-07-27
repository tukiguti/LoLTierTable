import { useMemo } from 'react';
import { useChampionRoster } from '../../hooks/useChampionRoster';
import { filterChampionsByRoles, searchChampions } from '../../services/championData';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { Champion } from '../../types';

interface SidebarChampionsResult {
  /** 検索語＋ロール絞り込みを適用した後の一覧（アイコングリッドに出す分） */
  champions: Champion[];
  /** 絞り込み前の全件数。「CHAMPIONS {全体数}」表示に使う */
  totalCount: number;
  /** 現在のモードでどこかに配置済みのチャンピオン数。「配置済み {N}」表示に使う */
  placedCount: number;
  loading: boolean;
  error?: string;
}

/**
 * サイドバー（デスクトップ・モバイル共通）が必要とする、チャンピオン一覧まわりの
 * 派生状態をまとめて計算するフック。デスクトップ版・モバイル版の両方から呼ばれる
 * 前提で、検索語・ロール選択はストア（useDiagramStore）を直接購読する。
 */
export function useSidebarChampions(): SidebarChampionsResult {
  const { champions, loading, error } = useChampionRoster();
  const searchQuery = useDiagramStore((state) => state.searchQuery);
  const selectedRoles = useDiagramStore((state) => state.selectedRoles);
  const mode = useDiagramStore((state) => state.mode);

  // 配置済み件数はモードごとに置き場が異なるため、ここで数える
  // （tierlist: 各段 + 未分類 / matrix: 盤面上の配置）。
  const tierPlacedCount = useDiagramStore(
    (state) =>
      state.unclassifiedChampionIds.length +
      state.tiers.reduce((sum, tier) => sum + tier.championIds.length, 0),
  );
  const matrixPlacedCount = useDiagramStore((state) => state.matrixPlacements.length);

  const filtered = useMemo(
    () => filterChampionsByRoles(searchChampions(champions, searchQuery), selectedRoles),
    [champions, searchQuery, selectedRoles],
  );

  return {
    champions: filtered,
    totalCount: champions.length,
    placedCount: mode === 'tierlist' ? tierPlacedCount : matrixPlacedCount,
    loading,
    error,
  };
}
