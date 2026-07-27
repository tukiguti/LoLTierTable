import type { FocusEvent, KeyboardEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableChampionIcon } from './SortableChampionIcon';
import { TIER_PALETTE, getTierColor } from '../../data/tierPalette';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { Champion, Tier } from '../../types';

interface TierRowProps {
  tier: Tier;
  champions: Champion[];
}

/**
 * 段の行（デザイン仕様§6）。
 *
 * grid-template-columns: 112px(ラベル) / 1fr(アイコン) / 34px(右レール)。
 * モバイル（1024px未満）では 52px / 1fr の2列になり、色スウォッチと
 * 右レール（並べ替え・行削除）は隠す（design-mock 03画面の実測どおり。
 * 右レール分の列自体が無いため、行の削除・並べ替え・色変更はデスクトップ限定）。
 */
export function TierRow({ tier, champions }: TierRowProps) {
  const updateTierLabel = useDiagramStore((state) => state.updateTierLabel);
  const updateTierColor = useDiagramStore((state) => state.updateTierColor);
  const removeTier = useDiagramStore((state) => state.removeTier);
  const color = getTierColor(tier.colorId);

  const {
    attributes,
    listeners,
    setNodeRef: setRowRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `tier-row:${tier.id}`,
    data: { type: 'tier-row', tierId: tier.id },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-tier:${tier.id}`,
    data: { type: 'tier', tierId: tier.id },
  });

  /**
   * 行全体をドロップ先にする。アイコン欄だけを受け口にすると、色付きのラベル欄
   * （行の中で最も目立つ部分）へ落としたときに何も起きず、操作が失敗したように見える。
   * 並べ替え用の ref と共存させるため、同じ要素を両方へ渡す。
   */
  const setRowAndDropRef = (node: HTMLElement | null) => {
    setRowRef(node);
    setDropRef(node);
  };

  const championObjs = tier.championIds
    .map((id) => champions.find((c) => c.id === id))
    .filter((c): c is Champion => Boolean(c));

  function handleLabelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  function handleLabelBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.currentTarget.textContent?.trim() ?? '';
    if (next && next !== tier.label) {
      updateTierLabel(tier.id, next);
    } else {
      event.currentTarget.textContent = tier.label;
    }
  }

  return (
    <div
      ref={setRowAndDropRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="grid min-h-[70px] grid-cols-[52px_1fr] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-main)] bg-[var(--surface-tier-row)] lg:min-h-[88px] lg:grid-cols-[112px_1fr_34px]"
    >
      {/* ラベル欄 */}
      <div
        className="group flex flex-col items-center justify-center gap-[6px] px-2"
        style={{ background: color.background, borderRight: '1px solid oklch(0.20 0.02 265 / .5)' }}
      >
        <div
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleLabelKeyDown}
          onBlur={handleLabelBlur}
          className="font-display cursor-text rounded-[3px] px-2 py-[2px] text-center text-[26px] leading-none font-bold tracking-[0.04em] outline-none group-hover:bg-white/16 lg:text-[34px]"
          style={{ color: color.text }}
        >
          {tier.label}
        </div>
        <div className="hidden gap-1 lg:flex">
          {TIER_PALETTE.map((swatch) => (
            <button
              key={swatch.id}
              type="button"
              aria-label={`段の色を${swatch.id.toUpperCase()}にする`}
              onClick={() => updateTierColor(tier.id, swatch.id)}
              className="h-[9px] w-[9px] cursor-pointer rounded-full"
              style={{ background: swatch.background, border: '1px solid oklch(0.20 0.02 265 / .45)' }}
            />
          ))}
        </div>
      </div>

      {/* アイコン欄（ドロップ先は行全体。ここは並びの器） */}
      <div className="flex flex-wrap content-start gap-[5px] p-[7px_8px] lg:gap-[6px] lg:p-[9px_10px]">
        <SortableContext
          items={championObjs.map((c) => `tier:${tier.id}:${c.id}`)}
          strategy={rectSortingStrategy}
        >
          {championObjs.map((champion) => (
            <SortableChampionIcon
              key={champion.id}
              id={`tier:${tier.id}:${champion.id}`}
              data={{ type: 'champion', championId: champion.id, from: 'tier', tierId: tier.id }}
              champion={champion}
              sizeClassName="h-[52px] w-[52px] lg:h-16 lg:w-16"
              hoverLift
            />
          ))}
        </SortableContext>
        {isOver && (
          <div
            className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[4px] border-[1.5px] border-dashed text-[22px] lg:h-16 lg:w-16"
            style={{
              borderColor: 'var(--gold-drop-border)',
              background: 'var(--gold-drop-bg)',
              color: 'var(--gold-drop-border)',
            }}
          >
            +
          </div>
        )}
      </div>

      {/* 右レール（並べ替え・行削除。デスクトップのみ） */}
      <div
        className="hidden flex-col items-center justify-center gap-[9px] border-l lg:flex"
        style={{
          background: 'var(--surface-rail)',
          borderColor: 'var(--border-weak-2)',
          color: 'var(--text-weaker)',
        }}
      >
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          title="並べ替え"
          className="flex cursor-grab touch-none flex-col gap-[2px]"
        >
          <i className="block h-[1.5px] w-[12px] bg-current" />
          <i className="block h-[1.5px] w-[12px] bg-current" />
          <i className="block h-[1.5px] w-[12px] bg-current" />
        </div>
        <button
          type="button"
          title="行を削除"
          onClick={() => removeTier(tier.id)}
          className="cursor-pointer text-[15px] leading-none hover:text-[var(--danger-row-hover)]"
        >
          ×
        </button>
      </div>
    </div>
  );
}
