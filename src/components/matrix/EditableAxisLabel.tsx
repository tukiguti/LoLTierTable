import type { CSSProperties, FocusEvent, KeyboardEvent } from 'react';

interface EditableAxisLabelProps {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * マトリクスの軸ラベル（軸名2つ＋両端4つ、デザイン仕様§7）で使う contentEditable な1行テキスト。
 * Enterで確定・改行を入れない作法は TierRow の段ラベル編集と同じにする。
 *
 * 「強い」「簡単」のような両端ラベルは文字数が少なく、素のままだと当たり判定が
 * 20px四方ほどしかない。編集できることに気づけず、気づいても狙って押しにくいので、
 * 内側に余白を入れて掴みやすくし、触れたときに薄い下地を出して編集できると示す。
 */
export function EditableAxisLabel({ value, onCommit, className, style }: EditableAxisLabelProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.currentTarget.textContent?.trim() ?? '';
    if (next && next !== value) {
      onCommit(next);
    } else {
      event.currentTarget.textContent = value;
    }
  }

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      title="クリックで編集"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={`rounded-[var(--radius-small)] px-[6px] py-[4px] hover:bg-white/10 focus:bg-white/10 ${className ?? ''}`}
      style={style}
    >
      {value}
    </div>
  );
}
