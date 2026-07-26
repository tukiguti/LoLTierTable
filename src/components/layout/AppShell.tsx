import type { ReactNode } from 'react'

interface AppShellProps {
  header: ReactNode
  sidebar: ReactNode
  main: ReactNode
  footer: ReactNode
}

/**
 * アプリ全体の骨格（仕様書 §3）。
 *
 * grid-template-rows: 64px / 1fr / 58px、本体は 300px / 1fr。
 * 画面全体はスクロールしない前提のため、内部スクロールを持つ子要素
 * （サイドバーのアイコン一覧・メイン領域）までの祖先チェーンには
 * すべて min-height: 0 を付けている。
 */
export function AppShell({ header, sidebar, main, footer }: AppShellProps) {
  return (
    <div
      className="grid h-full w-full overflow-hidden bg-[var(--surface-app)] text-[var(--text-primary)]"
      style={{ gridTemplateRows: 'var(--header-height) 1fr var(--footer-height)' }}
    >
      <div className="min-h-0 min-w-0">{header}</div>

      <div
        className="grid h-full min-h-0 w-full min-w-0"
        style={{ gridTemplateColumns: 'var(--sidebar-width) 1fr' }}
      >
        <div className="h-full min-h-0 min-w-0">{sidebar}</div>
        <div className="h-full min-h-0 min-w-0">{main}</div>
      </div>

      <div className="min-h-0 min-w-0">{footer}</div>
    </div>
  )
}
