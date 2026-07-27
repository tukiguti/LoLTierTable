import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableChampionIcon } from './SortableChampionIcon';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { Champion } from '../../types';

interface UnclassifiedZoneProps {
  champions: Champion[];
}

/**
 * 未分類の置き場（デザイン仕様§6・要求定義§5.2 SHOULD）。
 * 段の外へドラッグしたチャンピオンの戻り先でもある（デザイン仕様§12の決定）。
 */
export function UnclassifiedZone({ champions }: UnclassifiedZoneProps) {
  const unclassifiedChampionIds = useDiagramStore((state) => state.unclassifiedChampionIds);
  const { setNodeRef, isOver } = useDroppable({
    id: 'droppable-unclassified',
    data: { type: 'unclassified' },
  });

  const championObjs = unclassifiedChampionIds
    .map((id) => champions.find((c) => c.id === id))
    .filter((c): c is Champion => Boolean(c));

  return (
    <div
      className="mt-[6px] flex flex-col gap-2 rounded-[var(--radius-panel)] border border-dashed p-[10px_12px]"
      style={{ background: 'var(--surface-rail)', borderColor: 'var(--border-tile-placed)' }}
    >
      <div className="flex items-center gap-[10px]">
        <span className="font-mono-ui text-[10px] tracking-[0.14em] text-[var(--text-weak)]">
          UNRANKED
        </span>
        <span className="text-[11px] text-[var(--text-faint)]">候補を集めてから各段へ振り分け</span>
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-[56px] flex-wrap gap-[6px] rounded-[4px]"
        style={isOver ? { outline: '1.5px dashed var(--gold-drop-border)', outlineOffset: 2 } : undefined}
      >
        <SortableContext
          items={championObjs.map((c) => `unclassified:${c.id}`)}
          strategy={rectSortingStrategy}
        >
          {championObjs.map((champion) => (
            <SortableChampionIcon
              key={champion.id}
              id={`unclassified:${champion.id}`}
              data={{ type: 'champion', championId: champion.id, from: 'unclassified' }}
              champion={champion}
              sizeClassName="h-14 w-14"
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
