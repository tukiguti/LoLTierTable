import { useState, type ReactNode } from 'react'
import { ChampionGrid } from '../sidebar/ChampionGrid'
import { LanePresets } from '../sidebar/LanePresets'
import { RoleChips } from '../sidebar/RoleChips'
import { SearchInput } from '../sidebar/SearchInput'
import { useSidebarChampions } from '../sidebar/useSidebarChampions'

interface MobileSidebarSheetProps {
  /** @deprecated 実データ（useSidebarChampions）に置き換え済み。App.tsx の型互換のためだけに残す */
  championCount?: number
  /** @deprecated 中身を自己完結で描画するようになったため未使用 */
  roleChips?: ReactNode
  /** @deprecated 中身を自己完結で描画するようになったため未使用 */
  lanePresets?: ReactNode
  /** @deprecated 中身を自己完結で描画するようになったため未使用 */
  championGrid?: ReactNode
}

/**
 * サイドバーのモバイル版（仕様書 §9）。デスクトップの左サイドバー
 * （SidebarShell）を、画面下から引き出すシートに置き換える。
 *
 * 開閉状態はこのコンポーネント内のローカル state（useState）で持ち、
 * ストア（useDiagramStore）には入れない。既定は閉じた状態。
 *
 * シートを開く手段は仕様に明示が無いための判断: 閉じている間は画面下部に
 * 「チャンピオンを選ぶ」の固定バーを表示し、これをタップすると開く。
 *
 * 開いている間はメイン領域（背後のティアリスト等）に覆い（スクリム）を
 * かけ、スクリムがクリック/タップを受け止めるため背後は操作もスクロールも
 * できない。シート自体は内部（アイコン一覧）だけがスクロールする。
 *
 * ルート要素に lg:hidden を付けているため、デスクトップでは開閉状態に
 * 関わらず何も表示しない。
 *
 * 検索・ロール絞り込み・レーンプリセット・アイコン一覧はデスクトップ版
 * （SidebarShell）と同じ部品（src/components/sidebar/ 以下）を variant="mobile"
 * で使い回す。見た目（寸法・並び順）だけが仕様書§9のとおり異なる。
 */
export function MobileSidebarSheet(_props: MobileSidebarSheetProps = {}) {
  const [open, setOpen] = useState(false)
  const { champions, totalCount, error } = useSidebarChampions()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[48px] flex-none items-center justify-center gap-2 border-t border-[var(--border-main)] bg-[var(--surface-sidebar)] font-display text-[15px] font-bold uppercase tracking-[0.04em] text-[var(--gold-text)] lg:hidden"
      >
        チャンピオンを選ぶ
        <span className="font-mono-ui text-[11px] font-normal normal-case tracking-normal text-[var(--text-caption)]">
          {totalCount}
        </span>
      </button>
    )
  }

  return (
    <div className="absolute inset-0 z-30 lg:hidden">
      {/* 覆い（スクリム）。ここが背後の操作とスクロールを受け止めて止める */}
      <button
        type="button"
        aria-label="一覧を閉じる"
        onClick={() => setOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-[var(--surface-mobile-scrim)]"
      />

      {/* 下部シート */}
      <div
        role="dialog"
        aria-label="チャンピオン一覧"
        className="absolute inset-x-0 bottom-0 flex h-[474px] max-h-[80vh] flex-col rounded-t-[var(--radius-sheet)] border-t border-[var(--gold-sheet-border)] bg-[var(--surface-sidebar)] shadow-[0_-20px_50px_-20px_#000]"
      >
        {/* 掴み手 */}
        <div className="flex flex-none justify-center pb-[4px] pt-[9px]">
          <div className="h-[4px] w-[44px] rounded-[var(--radius-control)] bg-[var(--border-matrix-piece)]" />
        </div>

        <div className="flex flex-none flex-col gap-[10px] px-[14px] pb-[12px] pt-[4px]">
          {/* 見出し行 */}
          <div className="flex items-center gap-[10px]">
            <div className="font-display text-[17px] font-bold uppercase tracking-[0.05em] text-[var(--text-primary)]">
              Champions
            </div>
            <div className="font-mono-ui text-[10px] text-[var(--text-caption)]">{totalCount}</div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="閉じる"
              className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-tile)] text-[15px] text-[var(--text-muted)]"
            >
              ×
            </button>
          </div>

          <SearchInput variant="mobile" />

          {/* レーン（5等分） */}
          <LanePresets variant="mobile" />

          {/* ロール（横スクロール） */}
          <RoleChips variant="mobile" />
        </div>

        {/* アイコン一覧（内部スクロール） */}
        <div className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-[22px]">
          {error ? (
            <p className="text-[12px] text-[var(--danger-text)]">
              チャンピオン情報を読み込めません: {error}
            </p>
          ) : (
            <ChampionGrid champions={champions} variant="mobile" />
          )}
        </div>
      </div>
    </div>
  )
}
