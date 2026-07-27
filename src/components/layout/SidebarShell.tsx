import type { ReactNode } from 'react'
import { ChampionGrid } from '../sidebar/ChampionGrid'
import { LanePresets } from '../sidebar/LanePresets'
import { RoleChips } from '../sidebar/RoleChips'
import { SearchInput } from '../sidebar/SearchInput'
import { useSidebarChampions } from '../sidebar/useSidebarChampions'

interface SidebarShellProps {
  /** @deprecated 実データ（useSidebarChampions）に置き換え済み。App.tsx の型互換のためだけに残す */
  championCount?: number
  /** @deprecated 実データ（useSidebarChampions）に置き換え済み */
  placedCount?: number
  /** @deprecated 中身を自己完結で描画するようになったため未使用 */
  roleChips?: ReactNode
  /** @deprecated 中身を自己完結で描画するようになったため未使用 */
  lanePresets?: ReactNode
  /** @deprecated 中身を自己完結で描画するようになったため未使用 */
  championGrid?: ReactNode
}

/**
 * サイドバーの中身（仕様書 §5）。検索・ロール絞り込み・レーンプリセット・
 * アイコン一覧を自己完結で描画する。以前は roleChips 等を ReactNode で
 * 外から差し込む方式だったが、App.tsx 側から差し込む必要が無くなったため
 * 自己完結型に変更した。props はApp.tsxの型互換のためオプショナルのまま
 * 残すが、中身の描画には使わない。
 */
export function SidebarShell(_props: SidebarShellProps = {}) {
  const { champions, totalCount, placedCount, error } = useSidebarChampions()

  return (
    <aside className="flex h-full flex-col border-r border-[var(--border-main)] bg-[var(--surface-sidebar)]">
      {/* 上段ブロック */}
      <div className="flex flex-col gap-3 border-b border-[var(--border-weak)] px-[14px] pt-[14px] pb-3">
        <SearchInput variant="desktop" />

        {/* Role */}
        <div className="flex flex-col gap-[7px]">
          <div className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-[var(--text-caption)]">
            Role
          </div>
          <RoleChips variant="desktop" />
        </div>

        {/* Lane preset */}
        <div className="flex flex-col gap-[7px]">
          <div className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-[var(--text-caption)]">
            Lane preset
          </div>
          <LanePresets variant="desktop" />
        </div>
      </div>

      {/* 件数の行 */}
      <div className="flex items-center justify-between px-[14px] pt-[10px] pb-2">
        <div className="font-mono-ui text-[10px] tracking-[0.14em] text-[var(--text-caption)]">
          CHAMPIONS {totalCount}
        </div>
        <div className="text-[11px] text-[var(--text-faint)]">配置済み {placedCount}</div>
      </div>

      {/* アイコン一覧（内部スクロール） */}
      <div className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-4">
        {error ? (
          <p className="text-[12px] text-[var(--danger-text)]">
            チャンピオン情報を読み込めません: {error}
          </p>
        ) : (
          <ChampionGrid champions={champions} variant="desktop" />
        )}
      </div>
    </aside>
  )
}
