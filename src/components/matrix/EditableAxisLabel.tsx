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
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={className}
      style={style}
    >
      {value}
    </div>
  );
}
