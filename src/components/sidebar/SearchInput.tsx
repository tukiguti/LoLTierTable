import { useDiagramStore } from '../../store/useDiagramStore';

interface SearchInputProps {
  /** デスクトップ左パネル / モバイル下部シートで寸法・文字サイズが異なる（仕様書§5・§9） */
  variant: 'desktop' | 'mobile';
}

/**
 * チャンピオン名検索欄。ストアの searchQuery に直結する（要求定義§5.1 MUST）。
 * `searchChampions` が日本語名・英語ID・整形済み英語名のいずれにも部分一致するため、
 * ここでは値を渡すだけでよい。
 */
export function SearchInput({ variant }: SearchInputProps) {
  const searchQuery = useDiagramStore((state) => state.searchQuery);
  const setSearchQuery = useDiagramStore((state) => state.setSearchQuery);
  const isMobile = variant === 'mobile';

  return (
    <label
      className={`flex items-center gap-[9px] border border-[var(--border-input-strong)] bg-[var(--surface-input)] focus-within:border-[var(--border-input-focus)] ${
        isMobile
          ? 'h-[44px] rounded-[var(--radius-panel)] px-[12px]'
          : 'rounded-[var(--radius-control)] px-[11px] py-[9px]'
      }`}
    >
      <span
        className={`flex-none rounded-full border-[1.6px] border-[var(--text-weak)] ${
          isMobile ? 'h-[14px] w-[14px]' : 'h-[13px] w-[13px]'
        }`}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="チャンピオン名で検索"
        className={`w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-caption)] ${
          isMobile ? 'text-[15px]' : 'text-[14px]'
        }`}
        style={{ caretColor: 'var(--gold)' }}
      />
    </label>
  );
}
