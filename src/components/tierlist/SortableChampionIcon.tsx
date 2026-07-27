import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChampionIcon } from '../champion/ChampionIcon';
import type { Champion } from '../../types';
import type { ChampionDragData } from './dnd';

interface SortableChampionIconProps {
  id: string;
  data: ChampionDragData;
  champion: Champion;
  /** Tailwindの幅高さクラス（例: "h-16 w-16"）。ブレークポイントで出し分ける */
  sizeClassName: string;
  /** ホバーで2px浮かせる（デザイン仕様§6・段のアイコン欄のみ） */
  hoverLift?: boolean;
}

/**
 * 段・未分類の中に置かれたチャンピオンアイコン（並べ替え対象）。
 *
 * ChampionIcon自体は編集しない共有部品なので、ホバーで罫線を金にする表現は
 * ChampionIconが元々持つ `borderColor` propにホバー状態を渡すことで実現する。
 */
export function SortableChampionIcon({
  id,
  data,
  champion,
  sizeClassName,
  hoverLift = false,
}: SortableChampionIconProps) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data,
  });

  const dndTransform = CSS.Transform.toString(transform);
  const liftTransform = hoverLift && hovered ? 'translateY(-2px)' : '';
  const combinedTransform = [dndTransform, liftTransform].filter(Boolean).join(' ') || undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="touch-none cursor-grab"
      style={{
        transform: combinedTransform,
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <ChampionIcon
        champion={champion}
        className={sizeClassName}
        borderColor={hovered ? 'var(--gold)' : 'var(--border-tile-placed)'}
      />
    </div>
  );
}
