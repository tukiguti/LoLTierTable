import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import { ChampionIcon } from '../champion/ChampionIcon';
import { isChampionPlaced, useDiagramStore } from '../../store/useDiagramStore';
import type { Champion } from '../../types';

interface RosterChampionTileProps {
  champion: Champion;
  /** モバイルは仕様§9で角丸5px・バッジ10px。デスクトップは§5の3px・9px */
  variant?: 'desktop' | 'mobile';
}

/**
 * サイドバー一覧の1枚。ドラッグ元としての登録（ドラッグ受け渡し規約）と、
 * 配置済み表現（仕様書§5: dimPlaced時に薄く＋「配置済」バッジ）を担う。
 *
 * ドラッグ中の見た目（DragOverlay）はティアリスト側の担当範囲。ここでは
 * `DndContext` は置かず、`useDraggable` の登録のみを行う。
 */
export function RosterChampionTile({ champion, variant = 'desktop' }: RosterChampionTileProps) {
  const dimPlaced = useDiagramStore((state) => state.dimPlaced);
  const placed = useDiagramStore((state) => isChampionPlaced(state, champion.id));
  const [hovered, setHovered] = useState(false);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `roster:${champion.id}`,
    data: { type: 'champion', championId: champion.id, from: 'roster' },
  });

  const shouldDim = (dimPlaced && placed) || isDragging;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-grab touch-none"
    >
      <ChampionIcon
        champion={champion}
        dimmed={shouldDim}
        badge={dimPlaced && placed ? '配置済' : undefined}
        borderColor={hovered ? 'var(--gold)' : 'var(--border-input)'}
        radius={variant === 'mobile' ? 5 : undefined}
        badgeFontSize={variant === 'mobile' ? 10 : 9}
      />
    </div>
  );
}
