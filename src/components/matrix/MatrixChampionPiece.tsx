import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChampionIcon } from '../champion/ChampionIcon';
import type { Champion } from '../../types';

interface MatrixChampionPieceProps {
  champion: Champion;
  /** 盤面左上を原点(0,0)としたパーセント座標（MatrixPlacement参照） */
  x: number;
  y: number;
}

/**
 * マトリクス盤面上の駒（デザイン仕様§7）。
 *
 * マス目に吸着しない自由配置なので、並べ替え用の useSortable ではなく
 * useDraggable を使う（チームリード指示）。座標の計算は App.tsx の onDragEnd で行い、
 * ここは見た目とドラッグ登録だけを担当する。
 *
 * ドラッグ中は元の駒を薄くし（SortableChampionIcon と同じ作法）、実際に指へ追従する
 * 見た目は App.tsx の共有 DragOverlay が担う（マトリクス専用の2つ目のオーバーレイは作らない）。
 */
export function MatrixChampionPiece({ champion, x, y }: MatrixChampionPieceProps) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `matrix:${champion.id}`,
    data: { type: 'champion', championId: champion.id, from: 'matrix' },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute -mt-5 -ml-5 h-10 w-10 cursor-grab touch-none lg:-mt-[26px] lg:-ml-[26px] lg:h-[52px] lg:w-[52px]"
      style={{ left: `${x}%`, top: `${y}%`, opacity: isDragging ? 0.3 : 1 }}
    >
      <ChampionIcon
        champion={champion}
        radius={4}
        borderColor={hovered ? 'var(--gold)' : 'var(--border-matrix-piece)'}
        className="h-full w-full shadow-[0_6px_18px_-6px_#000]"
      />
    </div>
  );
}
