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

/** フッター（仕様書 §8）。高さ58pxは AppShell 側のグリッド行が決める。 */
export function AppFooter({ patchVersion }: AppFooterProps) {
  return (
    <footer className="flex h-full items-center gap-[16px] border-t border-[var(--border-weak-2)] bg-[var(--surface-footer)] px-[20px]">
      <span className="font-mono-ui flex-none rounded-[var(--radius-small)] border border-[var(--border-tile)] px-2 py-[3px] text-[11px] text-[var(--gold-text-soft)]">
        PATCH {patchVersion ?? '—'}
      </span>
      <span className="text-[11.5px] leading-[1.45] text-[var(--text-weaker)]">
        {DISCLAIMER}
      </span>
    </footer>
  )
}
