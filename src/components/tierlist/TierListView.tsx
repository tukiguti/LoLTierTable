import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TierRow } from './TierRow';
import { UnclassifiedZone } from './UnclassifiedZone';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { Champion } from '../../types';

interface TierListViewProps {
  champions: Champion[];
}

/**
 * ティアリストのメイン領域（デザイン仕様§6）。App.tsx のプレースホルダの差し替え先。
 * DndContext/DragOverlay 本体は App.tsx に置き、ここは描画だけを担当する。
 */
export function TierListView({ champions }: TierListViewProps) {
  const tiers = useDiagramStore((state) => state.tiers);
  const addTier = useDiagramStore((state) => state.addTier);
  const showHints = useDiagramStore((state) => state.showHints);
  const dismissHints = useDiagramStore((state) => state.dismissHints);

  return (
    <main className="relative flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto p-[16px_20px_20px]">
        <SortableContext
          items={tiers.map((tier) => `tier-row:${tier.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {tiers.map((tier) => (
            <TierRow key={tier.id} tier={tier} champions={champions} />
          ))}
        </SortableContext>

        <button
          type="button"
          onClick={addTier}
          className="font-display h-[38px] cursor-pointer rounded-[var(--radius-panel)] border border-dashed border-[var(--border-dashed)] text-[15px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase hover:border-[var(--gold)] hover:text-[var(--gold-text)]"
        >
          + 段を追加
        </button>

        <UnclassifiedZone champions={champions} />
      </div>

      {showHints && (
        <div
          className="absolute right-[20px] bottom-[18px] flex items-center gap-[10px] rounded-[var(--radius-control)] px-[12px] py-[9px] shadow-[0_10px_30px_-12px_#000]"
          style={{ background: 'var(--surface-tooltip)', border: '1px solid var(--gold-matrix-center)' }}
        >
          <span className="text-[12.5px]" style={{ color: 'oklch(0.88 0.01 265)' }}>
            左の一覧からアイコンをドラッグして段に置く
          </span>
          <button
            type="button"
            onClick={dismissHints}
            aria-label="ヒントを閉じる"
            className="cursor-pointer text-[14px]"
            style={{ color: 'oklch(0.60 0.01 265)' }}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
