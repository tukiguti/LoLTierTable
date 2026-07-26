import { useState, type ReactNode } from 'react'

interface MobileSidebarSheetProps {
  /** CHAMPIONS の件数行。実データ接続までの暫定既定値。 */
  championCount?: number
  /** ROLE チップの並び。中身は別担当が差し込む。 */
  roleChips?: ReactNode
  /** LANE PRESET ボタンの並び。中身は別担当が差し込む。 */
  lanePresets?: ReactNode
  /** チャンピオンアイコンの一覧。中身は別担当が差し込む（未指定時は空のグリッド）。 */
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
 */
export function MobileSidebarSheet({
  championCount = 0,
  roleChips,
  lanePresets,
  championGrid,
}: MobileSidebarSheetProps) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[48px] flex-none items-center justify-center gap-2 border-t border-[var(--border-main)] bg-[var(--surface-sidebar)] font-display text-[15px] font-bold uppercase tracking-[0.04em] text-[var(--gold-text)] lg:hidden"
      >
        チャンピオンを選ぶ
        <span className="font-mono-ui text-[11px] font-normal normal-case tracking-normal text-[var(--text-caption)]">
          {championCount}
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
            <div className="font-mono-ui text-[10px] text-[var(--text-caption)]">
              {championCount}
            </div>
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

          {/* 検索欄 */}
          <label className="flex h-[44px] items-center gap-[9px] rounded-[var(--radius-panel)] border border-[var(--border-input-strong)] bg-[var(--surface-input)] px-[12px] focus-within:border-[var(--border-input-focus)]">
            <span className="h-[14px] w-[14px] flex-none rounded-full border-[1.6px] border-[var(--text-weak)]" />
            <input
              type="text"
              placeholder="チャンピオン名で検索"
              className="w-full bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-caption)]"
              style={{ caretColor: 'var(--gold)' }}
            />
          </label>

          {/* レーン（5等分） */}
          <div className="flex gap-[6px]">{lanePresets}</div>

          {/* ロール（横スクロール） */}
          <div className="flex flex-nowrap gap-[6px] overflow-x-auto">{roleChips}</div>
        </div>

        {/* アイコン一覧（内部スクロール。中身が無ければ空のグリッドのまま） */}
        <div className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-[22px]">
          <div className="grid grid-cols-5 gap-[8px]">{championGrid}</div>
        </div>
      </div>
    </div>
  )
}
