import type { ReactNode } from 'react'

interface SidebarShellProps {
  /** CHAMPIONS の件数行。実データ接続までの暫定既定値。 */
  championCount?: number
  /** 配置済みの件数行。実データ接続までの暫定既定値。 */
  placedCount?: number
  /** ROLE チップの並び。中身は別担当が差し込む。 */
  roleChips?: ReactNode
  /** LANE PRESET ボタンの並び。中身は別担当が差し込む。 */
  lanePresets?: ReactNode
  /** チャンピオンアイコンの一覧。中身は別担当が差し込む（未指定時は空のグリッド）。 */
  championGrid?: ReactNode
}

/**
 * サイドバーの枠（仕様書 §5）。幅300pxは AppShell 側のグリッド列が決める。
 * 検索欄・見出し・件数行・一覧の器だけを組み、中身のロジック（検索・絞り込み・
 * ドラッグ元アイコン）は別担当の実装に委ねる。
 */
export function SidebarShell({
  championCount = 0,
  placedCount = 0,
  roleChips,
  lanePresets,
  championGrid,
}: SidebarShellProps) {
  return (
    <aside className="flex h-full flex-col border-r border-[var(--border-main)] bg-[var(--surface-sidebar)]">
      {/* 上段ブロック */}
      <div className="flex flex-col gap-3 border-b border-[var(--border-weak)] px-[14px] pt-[14px] pb-3">
        {/* 検索欄 */}
        <label className="flex items-center gap-[9px] rounded-[var(--radius-control)] border border-[var(--border-input-strong)] bg-[var(--surface-input)] px-[11px] py-[9px] focus-within:border-[var(--border-input-focus)]">
          <span className="h-[13px] w-[13px] flex-none rounded-full border-[1.6px] border-[var(--text-weak)]" />
          <input
            type="text"
            placeholder="チャンピオン名で検索"
            className="w-full bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-caption)]"
            style={{ caretColor: 'var(--gold)' }}
          />
        </label>

        {/* Role */}
        <div className="flex flex-col gap-[7px]">
          <div className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-[var(--text-caption)]">
            Role
          </div>
          <div className="flex flex-wrap gap-[5px]">{roleChips}</div>
        </div>

        {/* Lane preset */}
        <div className="flex flex-col gap-[7px]">
          <div className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-[var(--text-caption)]">
            Lane preset
          </div>
          <div className="grid grid-cols-5 gap-[5px]">{lanePresets}</div>
        </div>
      </div>

      {/* 件数の行 */}
      <div className="flex items-center justify-between px-[14px] pt-[10px] pb-2">
        <div className="font-mono-ui text-[10px] tracking-[0.14em] text-[var(--text-caption)]">
          CHAMPIONS {championCount}
        </div>
        <div className="text-[11px] text-[var(--text-faint)]">配置済み {placedCount}</div>
      </div>

      {/* アイコン一覧（内部スクロール。中身が無ければ空のグリッドのまま） */}
      <div className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-4">
        <div className="grid grid-cols-5 gap-[6px]">{championGrid}</div>
      </div>
    </aside>
  )
}
