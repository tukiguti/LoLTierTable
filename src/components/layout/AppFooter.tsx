interface AppFooterProps {
  /**
   * Data Dragon のバージョン表記。champions.json の version をそのまま渡す。
   * 読み込み前は未確定なので、その間はハイフンを出して数字を捏造しない。
   */
  patchVersion?: string
}

// Riot Games「Legal Jibber Jabber」ポリシーで指定される定型文。
// 要求定義 §5.6 / デザイン仕様 §8 の原文をそのまま使用し、自前で翻訳・改変しない。
const DISCLAIMER =
  'LoLTierTable was created under Riot Games’ "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.'

/**
 * フッター（仕様書 §8）。
 *
 * デスクトップ（lg以上）: 高さ58px固定・横並び。AppShell側のグリッド行が
 * 高さを決めるので、ここでは寸法を変えず現状のまま維持する。
 *
 * モバイル（lg未満）: デザイン原本のモバイル画面にはフッターが無いが、
 * Riot指定の免責文は掲載が必須（要求定義§5.6）のため省略できない。
 * 固定58pxではなく内容に応じた自動高さにし、文字サイズを落として
 * パッチのピルと免責文を縦積みにすることで、狭い幅でも2行程度に収める
 * （仕様からの意図的な逸脱）。
 */
export function AppFooter({ patchVersion }: AppFooterProps) {
  return (
    <footer className="flex flex-col items-start gap-[4px] border-t border-[var(--border-weak-2)] bg-[var(--surface-footer)] px-[14px] py-[8px] lg:h-full lg:flex-row lg:items-center lg:gap-[16px] lg:px-[20px] lg:py-0">
      <span className="font-mono-ui flex-none rounded-[var(--radius-small)] border border-[var(--border-tile)] px-2 py-[3px] text-[10px] text-[var(--gold-text-soft)] lg:text-[11px]">
        PATCH {patchVersion ?? '—'}
      </span>
      <span className="text-[10px] leading-[1.4] text-[var(--text-weaker)] lg:text-[11.5px] lg:leading-[1.45]">
        {DISCLAIMER}
      </span>
    </footer>
  )
}
