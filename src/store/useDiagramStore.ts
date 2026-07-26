import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppMode,
  ChampionRole,
  MatrixAxisLabels,
  MatrixGridSize,
  MatrixPlacement,
  Tier,
} from '../types';

/**
 * 図の状態をまとめて持つ唯一のストア（要求定義§7: モードごとに分けず1つに集約）。
 *
 * 配置はチャンピオンID（文字列）だけを持つ。チャンピオンの実体（アイコンURL・名前等）は
 * services/championData.ts が public/data/champions.json から読み込む別ロースターであり、
 * このストアはその一覧を保持しない。理由は2つ:
 * 1. 171件のチャンピオン情報をLocalStorageに毎回書き込むのは無駄
 * 2. パッチ更新でチャンピオン情報が変わっても、保存されているのはIDだけなので壊れない
 */

const DEFAULT_TIER_LABELS = ['S', 'A', 'B', 'C', 'D'];
const DEFAULT_TIER_COLOR_IDS = ['s', 'a', 'b', 'c', 'd'];

function createDefaultTiers(): Tier[] {
  return DEFAULT_TIER_LABELS.map((label, index) => ({
    id: crypto.randomUUID(),
    label,
    colorId: DEFAULT_TIER_COLOR_IDS[index],
    championIds: [],
  }));
}

function createDefaultMatrixAxisLabels(): MatrixAxisLabels {
  return {
    xAxisLabel: '操作難易度',
    yAxisLabel: '現環境の強さ',
    xLeftLabel: '簡単',
    xRightLabel: '難しい',
    yTopLabel: '強い',
    yBottomLabel: '弱い',
  };
}

const DEFAULT_MATRIX_GRID_SIZE: MatrixGridSize = 4;

interface DiagramState {
  // --- 現在のモード ---
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // --- ティアリスト: 段 ---
  tiers: Tier[];
  addTier: () => void;
  removeTier: (tierId: string) => void;
  reorderTiers: (fromIndex: number, toIndex: number) => void;
  updateTierLabel: (tierId: string, label: string) => void;
  updateTierColor: (tierId: string, colorId: string) => void;

  // --- ティアリスト: チャンピオンの配置 ---
  /** 未分類の一時置き場（候補を集めてから各段へ振り分ける、要求定義§5.2 SHOULD） */
  unclassifiedChampionIds: string[];
  /** レーンプリセットの一括投入等。既にどこかに配置済みのIDは無視する */
  addChampionIdsToUnclassified: (championIds: string[]) => void;
  /** 段への配置。他の段・未分類にあれば取り除いてから挿入する（段間移動も兼ねる） */
  placeChampionInTier: (championId: string, tierId: string, index?: number) => void;
  /** 段内の並べ替え */
  moveChampionWithinTier: (tierId: string, fromIndex: number, toIndex: number) => void;
  /** 段の外へドラッグしたときの配置解除。未分類へ戻す（デザイン仕様§12の決定） */
  unplaceChampion: (championId: string) => void;

  // --- マトリクス ---
  matrixPlacements: MatrixPlacement[];
  /** 盤面への配置・移動（既に配置済みなら座標を上書き） */
  placeChampionOnMatrix: (championId: string, x: number, y: number) => void;
  /** 盤面外へドラッグしたときの配置解除 */
  removeChampionFromMatrix: (championId: string) => void;
  matrixAxisLabels: MatrixAxisLabels;
  updateMatrixAxisLabels: (labels: Partial<MatrixAxisLabels>) => void;
  matrixGridSize: MatrixGridSize;
  setMatrixGridSize: (size: MatrixGridSize) => void;

  // --- サイドバー ---
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  /** 複数選択可能なロール絞り込み */
  selectedRoles: ChampionRole[];
  toggleRole: (role: ChampionRole) => void;
  clearSelectedRoles: () => void;

  // --- 表示設定 ---
  showHints: boolean;
  dismissHints: () => void;
  dimPlaced: boolean;
  setDimPlaced: (dim: boolean) => void;

  // --- 全消去 ---
  /** 図の内容（段・未分類・マトリクス配置・軸ラベル・グリッドサイズ）を初期状態に戻す。
   * モード・検索語・ロール選択・表示設定は「作業内容」ではないため保持する。 */
  clearAll: () => void;
}

/** 指定したチャンピオンIDを、全ての段と未分類置き場から取り除く（内部ヘルパー） */
function removeChampionFromPlacements(
  tiers: Tier[],
  unclassifiedChampionIds: string[],
  championId: string,
): { tiers: Tier[]; unclassifiedChampionIds: string[] } {
  return {
    tiers: tiers.map((tier) =>
      tier.championIds.includes(championId)
        ? { ...tier, championIds: tier.championIds.filter((id) => id !== championId) }
        : tier,
    ),
    unclassifiedChampionIds: unclassifiedChampionIds.filter((id) => id !== championId),
  };
}

const STORAGE_KEY = 'loltiertable:diagram';
/** 保存形式のバージョン。永続化するstateの形を変えたらインクリメントし、migrateで移行する */
const STORAGE_VERSION = 1;

export const useDiagramStore = create<DiagramState>()(
  persist(
    (set) => ({
      mode: 'tierlist',
      setMode: (mode) => set({ mode }),

      tiers: createDefaultTiers(),

      addTier: () =>
        set((state) => ({
          tiers: [
            ...state.tiers,
            {
              id: crypto.randomUUID(),
              label: `Tier ${state.tiers.length + 1}`,
              colorId: DEFAULT_TIER_COLOR_IDS[state.tiers.length % DEFAULT_TIER_COLOR_IDS.length],
              championIds: [],
            },
          ],
        })),

      removeTier: (tierId) =>
        set((state) => {
          const target = state.tiers.find((tier) => tier.id === tierId);
          if (!target) return state;
          return {
            tiers: state.tiers.filter((tier) => tier.id !== tierId),
            // 行の削除であってチャンピオンの削除ではないので、未分類へ戻す
            unclassifiedChampionIds: [
              ...state.unclassifiedChampionIds,
              ...target.championIds.filter((id) => !state.unclassifiedChampionIds.includes(id)),
            ],
          };
        }),

      reorderTiers: (fromIndex, toIndex) =>
        set((state) => {
          if (
            fromIndex < 0 ||
            fromIndex >= state.tiers.length ||
            toIndex < 0 ||
            toIndex >= state.tiers.length
          ) {
            return state;
          }
          const next = [...state.tiers];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return { tiers: next };
        }),

      updateTierLabel: (tierId, label) =>
        set((state) => ({
          tiers: state.tiers.map((tier) => (tier.id === tierId ? { ...tier, label } : tier)),
        })),

      updateTierColor: (tierId, colorId) =>
        set((state) => ({
          tiers: state.tiers.map((tier) => (tier.id === tierId ? { ...tier, colorId } : tier)),
        })),

      unclassifiedChampionIds: [],

      addChampionIdsToUnclassified: (championIds) =>
        set((state) => {
          const alreadyPlaced = new Set([
            ...state.unclassifiedChampionIds,
            ...state.tiers.flatMap((tier) => tier.championIds),
          ]);
          const toAdd = championIds.filter((id) => !alreadyPlaced.has(id));
          if (toAdd.length === 0) return state;
          return { unclassifiedChampionIds: [...state.unclassifiedChampionIds, ...toAdd] };
        }),

      placeChampionInTier: (championId, tierId, index) =>
        set((state) => {
          const { tiers: clearedTiers, unclassifiedChampionIds } = removeChampionFromPlacements(
            state.tiers,
            state.unclassifiedChampionIds,
            championId,
          );
          const tiers = clearedTiers.map((tier) => {
            if (tier.id !== tierId) return tier;
            const championIds = [...tier.championIds];
            const insertAt = index === undefined ? championIds.length : index;
            championIds.splice(insertAt, 0, championId);
            return { ...tier, championIds };
          });
          return { tiers, unclassifiedChampionIds };
        }),

      moveChampionWithinTier: (tierId, fromIndex, toIndex) =>
        set((state) => ({
          tiers: state.tiers.map((tier) => {
            if (tier.id !== tierId) return tier;
            if (
              fromIndex < 0 ||
              fromIndex >= tier.championIds.length ||
              toIndex < 0 ||
              toIndex >= tier.championIds.length
            ) {
              return tier;
            }
            const championIds = [...tier.championIds];
            const [moved] = championIds.splice(fromIndex, 1);
            championIds.splice(toIndex, 0, moved);
            return { ...tier, championIds };
          }),
        })),

      unplaceChampion: (championId) =>
        set((state) => {
          const { tiers, unclassifiedChampionIds } = removeChampionFromPlacements(
            state.tiers,
            state.unclassifiedChampionIds,
            championId,
          );
          return {
            tiers,
            unclassifiedChampionIds: [...unclassifiedChampionIds, championId],
          };
        }),

      matrixPlacements: [],

      placeChampionOnMatrix: (championId, x, y) =>
        set((state) => {
          const clampedX = Math.min(100, Math.max(0, x));
          const clampedY = Math.min(100, Math.max(0, y));
          const withoutChampion = state.matrixPlacements.filter(
            (placement) => placement.championId !== championId,
          );
          return {
            matrixPlacements: [...withoutChampion, { championId, x: clampedX, y: clampedY }],
          };
        }),

      removeChampionFromMatrix: (championId) =>
        set((state) => ({
          matrixPlacements: state.matrixPlacements.filter(
            (placement) => placement.championId !== championId,
          ),
        })),

      matrixAxisLabels: createDefaultMatrixAxisLabels(),

      updateMatrixAxisLabels: (labels) =>
        set((state) => ({ matrixAxisLabels: { ...state.matrixAxisLabels, ...labels } })),

      matrixGridSize: DEFAULT_MATRIX_GRID_SIZE,

      setMatrixGridSize: (size) => set({ matrixGridSize: size }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      selectedRoles: [],
      toggleRole: (role) =>
        set((state) => ({
          selectedRoles: state.selectedRoles.includes(role)
            ? state.selectedRoles.filter((r) => r !== role)
            : [...state.selectedRoles, role],
        })),
      clearSelectedRoles: () => set({ selectedRoles: [] }),

      showHints: true,
      dismissHints: () => set({ showHints: false }),
      dimPlaced: true,
      setDimPlaced: (dim) => set({ dimPlaced: dim }),

      clearAll: () =>
        set({
          tiers: createDefaultTiers(),
          unclassifiedChampionIds: [],
          matrixPlacements: [],
          matrixAxisLabels: createDefaultMatrixAxisLabels(),
          matrixGridSize: DEFAULT_MATRIX_GRID_SIZE,
        }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      // 作業内容(図の状態)と設定を保存する。検索語とロール選択は再訪時に
      // 引き継ぐ必要のないセッション的な状態なので保存しない。
      // showHints は保存する。要求定義§5.5の「初回のみの案内」を満たすには、
      // 閉じたことが次回以降も残っている必要がある（毎回出るなら常設と変わらない）。
      partialize: (state) => ({
        mode: state.mode,
        tiers: state.tiers,
        unclassifiedChampionIds: state.unclassifiedChampionIds,
        matrixPlacements: state.matrixPlacements,
        matrixAxisLabels: state.matrixAxisLabels,
        matrixGridSize: state.matrixGridSize,
        dimPlaced: state.dimPlaced,
        showHints: state.showHints,
      }),
    },
  ),
);

/**
 * 現在のモードで、指定したチャンピオンが盤面上のどこかに配置済みかどうか。
 * サイドバー一覧の「配置済み」表現に使う。ストアのstateを引数に取る素朴な関数にしてあるので
 * `useDiagramStore((state) => isChampionPlaced(state, championId))` のように選択的に購読できる。
 */
export function isChampionPlaced(state: DiagramState, championId: string): boolean {
  if (state.mode === 'tierlist') {
    return (
      state.unclassifiedChampionIds.includes(championId) ||
      state.tiers.some((tier) => tier.championIds.includes(championId))
    );
  }
  return state.matrixPlacements.some((placement) => placement.championId === championId);
}
