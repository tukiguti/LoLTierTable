import type { AppMode } from '../../types'

interface AppHeaderProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
}

/** モードタブの「ティアリスト」アイコン（横3本線、13px） */
function TierListIcon() {
  return (
    <span className="grid h-[13px] w-[13px] grid-rows-3 gap-[2px]">
      <i className="block rounded-[1px] bg-current" />
      <i className="block rounded-[1px] bg-current" />
      <i className="block rounded-[1px] bg-current" />
    </span>
  )
}

/** モードタブの「マトリクス」アイコン（2×2のマス、13px） */
function MatrixIcon() {
  return (
    <span className="grid h-[13px] w-[13px] grid-cols-2 grid-rows-2 gap-[2px]">
      <i className="block rounded-[1px] bg-current" />
      <i className="block rounded-[1px] bg-current" />
      <i className="block rounded-[1px] bg-current" />
      <i className="block rounded-[1px] bg-current" />
    </span>
  )
}

const modeButtonBase =
  'flex items-center gap-2 rounded-[var(--radius-small)] px-4 py-[7px] font-display text-[16px] font-bold uppercase tracking-[0.06em] cursor-pointer'
const modeButtonActive = 'bg-[var(--gold)] text-[var(--gold-ink)]'
const modeButtonInactive =
  'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-segment-hover)] hover:text-[var(--text-primary)]'

/** ヘッダー（仕様書 §4）。高さ64pxは AppShell 側のグリッド行が決める。 */
export function AppHeader({ mode, onModeChange }: AppHeaderProps) {
  return (
    <header className="flex h-full items-center gap-[24px] border-b border-[var(--border-main)] bg-[var(--surface-header)] px-[20px]">
      {/* ロゴ */}
      <div className="flex flex-none items-center gap-[10px]">
        <div
          className="h-[26px] w-[26px] rotate-45 rounded-[var(--radius-small)]"
          style={{
            background:
              'linear-gradient(135deg, var(--gold-gradient-start), var(--gold-gradient-end))',
          }}
        />
        <div className="font-display text-[23px] font-bold uppercase tracking-[0.06em] text-[var(--text-logo)]">
          LoL<span className="text-[var(--gold)]">TierTable</span>
        </div>
      </div>

      {/* モード切替 */}
      <div className="flex flex-none gap-[3px] rounded-[var(--radius-control)] border border-[var(--border-input)] bg-[var(--surface-button-secondary)] p-[3px]">
        <button
          type="button"
          onClick={() => onModeChange('tierlist')}
          aria-pressed={mode === 'tierlist'}
          className={`${modeButtonBase} ${mode === 'tierlist' ? modeButtonActive : modeButtonInactive}`}
        >
          <TierListIcon />
          Tier list
        </button>
        <button
          type="button"
          onClick={() => onModeChange('matrix')}
          aria-pressed={mode === 'matrix'}
          className={`${modeButtonBase} ${mode === 'matrix' ? modeButtonActive : modeButtonInactive}`}
        >
          <MatrixIcon />
          Matrix
        </button>
      </div>

      {/* 右側のアクション */}
      <div className="ml-auto flex flex-none items-center gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--gold)] bg-[var(--gold)] px-[18px] py-[9px] text-[14px] font-bold text-[var(--gold-ink)] hover:bg-[var(--gold-hover)]"
        >
          PNG保存
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--border-secondary-btn)] bg-[var(--surface-button-secondary)] px-4 py-[9px] text-[14px] font-semibold text-[var(--text-button)] hover:border-[var(--border-secondary-btn-hover)]"
        >
          共有
        </button>
        <div className="mx-1 h-[26px] w-px bg-[var(--border-input)]" />
        <button
          type="button"
          className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--danger-border)] bg-transparent px-[14px] py-[9px] text-[14px] font-semibold text-[var(--danger-text)] hover:bg-[var(--danger-bg-hover)] hover:text-[var(--danger-text-hover)]"
        >
          全消去
        </button>
      </div>
    </header>
  )
}
