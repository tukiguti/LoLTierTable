import { useState } from 'react'
import type { AppMode } from '../../types'
import { PngExportDialog } from '../export/PngExportDialog'
import { ShareDialog } from '../../share/ShareDialog'

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

/** モバイル版モードタブ（全幅2分割・アイコン無し、仕様書 §9） */
const mobileModeButtonBase =
  'flex-1 rounded-[var(--radius-small)] py-[6px] text-center font-display text-[15px] font-bold uppercase tracking-[0.06em] cursor-pointer'
const mobileModeButtonInactive = 'bg-transparent text-[var(--text-muted)]'

/**
 * ヘッダー（仕様書 §4・§9）。
 *
 * デスクトップ（lg以上）とモバイル（lg未満）で構造そのものが異なるため
 * （1段組↔2段組、右側の個別ボタン↔「⋯」メニューへの集約）、両方のDOMを
 * 常に描画してTailwindの `hidden`/`lg:hidden` で出し分ける。高さはAppShell
 * 側のグリッド行が決める（デスクトップ64px固定・モバイルは内容に応じた
 * auto）。
 */
export function AppHeader({ mode, onModeChange }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pngDialogOpen, setPngDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  return (
    <header className="h-full border-b border-[var(--border-main)] bg-[var(--surface-header)]">
      {/* ===== デスクトップ（1024px以上）。寸法・見た目は現状のまま ===== */}
      <div className="hidden h-full items-center gap-[24px] px-[20px] lg:flex">
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
            onClick={() => setPngDialogOpen(true)}
            className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--gold)] bg-[var(--gold)] px-[18px] py-[9px] text-[14px] font-bold text-[var(--gold-ink)] hover:bg-[var(--gold-hover)]"
          >
            PNG保存
          </button>
          <button
            type="button"
            onClick={() => setShareDialogOpen(true)}
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
      </div>

      {/* ===== モバイル（1024px未満・仕様書 §9） ===== */}
      <div className="flex h-full flex-col gap-[9px] px-[14px] pb-0 pt-[env(safe-area-inset-top)] lg:hidden">
        {/* 上段: ロゴ + PNG + ⋯メニュー */}
        <div className="flex items-center gap-[8px]">
          <div
            className="h-[18px] w-[18px] flex-none rotate-45 rounded-[var(--radius-logo-mobile)]"
            style={{
              background:
                'linear-gradient(135deg, var(--gold-gradient-start), var(--gold-gradient-end))',
            }}
          />
          <div className="font-display text-[18px] font-bold uppercase tracking-[0.05em] text-[var(--text-logo)]">
            LoL<span className="text-[var(--gold)]">TierTable</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              onClick={() => setPngDialogOpen(true)}
              className="flex h-[32px] flex-none items-center rounded-[var(--radius-control)] bg-[var(--gold)] px-[12px] text-[13px] font-bold text-[var(--gold-ink)]"
            >
              PNG
            </button>

            <div className="relative flex-none">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label="その他の操作"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-tile-placed)] text-[16px] text-[var(--text-icon-muted)]"
              >
                ⋯
              </button>

              {menuOpen && (
                <>
                  {/* 外側クリックで閉じるための透明キャッチャー */}
                  <button
                    type="button"
                    aria-label="メニューを閉じる"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div className="absolute right-0 top-[calc(100%+6px)] z-20 flex w-[140px] flex-col gap-[6px] rounded-[var(--radius-control)] border border-[var(--border-input)] bg-[var(--surface-button-secondary)] p-[8px] shadow-[0_10px_30px_-12px_#000]">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setShareDialogOpen(true)
                      }}
                      className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--border-secondary-btn)] bg-transparent px-[10px] py-[8px] text-left text-[13px] font-semibold text-[var(--text-button)] hover:border-[var(--border-secondary-btn-hover)]"
                    >
                      共有
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--danger-border)] bg-transparent px-[10px] py-[8px] text-left text-[13px] font-semibold text-[var(--danger-text)] hover:bg-[var(--danger-bg-hover)] hover:text-[var(--danger-text-hover)]"
                    >
                      全消去
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 下段: モード切替（全幅2分割） */}
        <div className="flex gap-[2px] rounded-[var(--radius-control)] border border-[var(--border-input)] bg-[var(--surface-input)] p-[2px]">
          <button
            type="button"
            onClick={() => onModeChange('tierlist')}
            aria-pressed={mode === 'tierlist'}
            className={`${mobileModeButtonBase} ${mode === 'tierlist' ? modeButtonActive : mobileModeButtonInactive}`}
          >
            Tier list
          </button>
          <button
            type="button"
            onClick={() => onModeChange('matrix')}
            aria-pressed={mode === 'matrix'}
            className={`${mobileModeButtonBase} ${mode === 'matrix' ? modeButtonActive : mobileModeButtonInactive}`}
          >
            Matrix
          </button>
        </div>
      </div>

      <PngExportDialog open={pngDialogOpen} onClose={() => setPngDialogOpen(false)} />
      <ShareDialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} />
    </header>
  )
}
