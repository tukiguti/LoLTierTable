import { useRef, useState } from 'react';
import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import type { MatrixAxisLabelOffset } from '../../types';

interface EditableAxisLabelProps {
  value: string;
  onCommit: (value: string) => void;
  /** 既定位置からのずれ（盤面サイズに対する比率） */
  offset: MatrixAxisLabelOffset;
  /** ドラッグで位置が確定したときの通知。ドラッグでなければ呼ばれない */
  onOffsetChange: (offset: MatrixAxisLabelOffset) => void;
  /** 盤面（正方形部分）の現在のピクセルサイズ。0のときはまだ未計測 */
  boardSize: number;
  /** Tab(1) / Shift+Tab(-1) が押されたときの通知。次/前のラベルへフォーカスを移す判断は親が持つ */
  onNavigate: (direction: 1 | -1) => void;
  /** 親がラベル間フォーカス移動に使うDOM参照を受け取る */
  registerRef: (el: HTMLDivElement | null) => void;
  className?: string;
  style?: CSSProperties;
}

/** pointerdownからこの距離(px)以上動いたらドラッグとみなす */
const DRAG_THRESHOLD_PX = 5;

function offsetToTransform(offset: MatrixAxisLabelOffset, boardSize: number): string {
  return `translate(${offset.dx * boardSize}px, ${offset.dy * boardSize}px)`;
}

/**
 * マトリクスの軸ラベル（軸名2つ＋両端4つ、デザイン仕様§7）で使う contentEditable な1行テキスト。
 * Enterで確定・改行を入れない作法は TierRow の段ラベル編集と同じにする。
 *
 * 「強い」「簡単」のような両端ラベルは文字数が少なく、素のままだと当たり判定が
 * 20px四方ほどしかない。編集できることに気づけず、気づいても狙って押しにくいので、
 * 内側に余白を入れて掴みやすくし、触れたときに薄い下地を出して編集できると示す。
 *
 * ドラッグでの移動も同じ要素が担う（チームリード要望）。クリック（動かさず離す）は
 * ネイティブのcontentEditableクリック挙動にまかせて編集に入り、pointerdownから
 * DRAG_THRESHOLD_PX以上動いたらドラッグと判定してフォーカス/選択を明示的に外す。
 * 判定はpointerdown時点のネイティブフォーカス処理を妨げないためpreventDefaultしない。
 */
export function EditableAxisLabel({
  value,
  onCommit,
  offset,
  onOffsetChange,
  boardSize,
  onNavigate,
  registerRef,
  className,
  style,
}: EditableAxisLabelProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: MatrixAxisLabelOffset;
    dragging: boolean;
  } | null>(null);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
      dragging: false,
    };
    // 捕捉できないと、ラベルの当たり判定（小さい）からポインタが外れた瞬間に
    // move/upが届かなくなりドラッグが途切れる。稀に(合成イベント等で)例外を投げる
    // 環境があるため、失敗してもpointerdown自体は継続できるよう握りつぶす。
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // no-op
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dxPx = event.clientX - drag.startX;
    const dyPx = event.clientY - drag.startY;

    if (!drag.dragging) {
      if (Math.hypot(dxPx, dyPx) < DRAG_THRESHOLD_PX) return;
      drag.dragging = true;
      setIsDragging(true);
      // ドラッグと判定した時点で、pointerdown時にネイティブが置いたキャレット/選択を消す。
      // 動かしている最中は編集モードに見えないようにするため。
      window.getSelection()?.removeAllRanges();
      elementRef.current?.blur();
    }

    if (boardSize > 0 && elementRef.current) {
      const nextOffset: MatrixAxisLabelOffset = {
        dx: drag.startOffset.dx + dxPx / boardSize,
        dy: drag.startOffset.dy + dyPx / boardSize,
      };
      // ドラッグ中はDOMへ直接書いて再レンダーを避け、確定時だけストアへ反映する
      elementRef.current.style.transform = offsetToTransform(nextOffset, boardSize);
    }
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    if (!drag.dragging) return;

    setIsDragging(false);
    if (boardSize > 0) {
      const dxPx = event.clientX - drag.startX;
      const dyPx = event.clientY - drag.startY;
      onOffsetChange({
        dx: drag.startOffset.dx + dxPx / boardSize,
        dy: drag.startOffset.dy + dyPx / boardSize,
      });
    } else if (elementRef.current) {
      elementRef.current.style.transform = offsetToTransform(offset, boardSize);
    }
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    // ストアに未確定のまま終わった場合、見た目を確定済みの位置へ戻す
    elementRef.current?.style.setProperty(
      'transform',
      offsetToTransform(offset, boardSize),
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.currentTarget.textContent = value;
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      onNavigate(event.shiftKey ? -1 : 1);
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
      ref={(el) => {
        elementRef.current = el;
        registerRef(el);
      }}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      title="クリックで編集・ドラッグで移動"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={`touch-none rounded-[var(--radius-small)] px-[6px] py-[4px] outline-none hover:bg-white/10 focus:bg-white/10 ${
        isDragging ? 'cursor-grabbing bg-white/10 select-none' : 'cursor-grab'
      } ${className ?? ''}`}
      style={{ ...style, transform: offsetToTransform(offset, boardSize) }}
    >
      {value}
    </div>
  );
}
