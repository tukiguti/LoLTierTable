import type { ReactNode } from 'react'

interface AppShellProps {
  header: ReactNode
  /** デスクトップ（lg以上）でのみ表示する左サイドバー */
  sidebar: ReactNode
  /** モバイル（lg未満）でのみ表示する下部シート一式。開閉状態は自身で持つ */
  mobileSidebar: ReactNode
  main: ReactNode
  footer: ReactNode
}

/**
 * アプリ全体の骨格（仕様書 §3・§9）。
 *
 * デスクトップ（1024px以上）: grid-template-rows: 64px / 1fr / 58px、
 * 本体は 300px / 1fr の2カラム。寸法は現状のまま完全に維持する。
 *
 * モバイル（1024px未満）: 行は auto / 1fr / auto（ヘッダー・フッターとも
 * 内容に応じた高さ）。本体は1カラムになり、デスクトップの左サイドバーは
 * 非表示（display:none）になる。代わりに `mobileSidebar`
 * （下部シート＋開閉トリガー）を本体カラムの上に重ねる。
 *
 * 切り替えは全てCSSのメディアクエリ（Tailwindの `lg:` = 1024px）で行い、
 * JS側で幅を判定する分岐は持たない。デスクトップ用とモバイル用のDOMは
 * 両方常に存在し、非表示側は `display:none` になるだけ（要素数は増えるが、
 * ウィンドウリサイズに即座に追従でき、JS計算のズレも起きない）。
 *
 * 画面全体はスクロールしない前提のため、内部スクロールを持つ子要素
 * （サイドバー・シートのアイコン一覧・メイン領域）までの祖先チェーンには
 * すべて min-height: 0 を付けている。
 */
export function AppShell({ header, sidebar, mobileSidebar, main, footer }: AppShellProps) {
  return (
    <div
      className="grid h-full w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-[var(--surface-app)] text-[var(--text-primary)] lg:grid-rows-[var(--header-height)_1fr_var(--footer-height)]"
    >
      <div className="min-h-0 min-w-0">{header}</div>

      <div className="relative grid h-full min-h-0 w-full min-w-0 grid-cols-1 lg:grid-cols-[var(--sidebar-width)_1fr]">
        {/* デスクトップ専用サイドバー（lg未満では display:none） */}
        <div className="hidden min-h-0 min-w-0 lg:block">{sidebar}</div>

        {/* メインカラム。モバイルではここがサイドバー分も含めた全幅になり、
            下部シート（mobileSidebar）をこの上に重ねて表示する */}
        <div className="relative flex h-full min-h-0 min-w-0 flex-col">
          <div className="min-h-0 min-w-0 flex-1">{main}</div>
          {mobileSidebar}
        </div>
      </div>

      <div className="min-h-0 min-w-0">{footer}</div>
    </div>
  )
}
