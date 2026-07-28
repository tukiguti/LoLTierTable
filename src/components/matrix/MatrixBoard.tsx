import { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { EditableAxisLabel } from './EditableAxisLabel';
import { MatrixChampionPiece } from './MatrixChampionPiece';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { Champion, MatrixAxisLabels, MatrixPlacement } from '../../types';

/** 要素にフォーカスし、中身を全選択する（Tab移動後、そのまま打てば置き換わるように） */
function focusAndSelectAllText(el: HTMLElement | null) {
  if (!el) return;
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

interface MatrixBoardProps {
  champions: Champion[];
}

const axisLabelClassName =
  'font-display text-center text-[14px] leading-none font-bold tracking-[0.12em] text-[var(--gold)] uppercase outline-none lg:text-[19px]';
const yEndClassName = 'text-[11px] font-semibold outline-none lg:text-[13px]';
const xEndClassName = 'text-[11px] font-semibold outline-none lg:text-[13px]';

/**
 * Tabキーでの移動順（要求: 読み手にとって自然な並び）。
 * X軸名 → X左端 → X右端 → Y軸名 → Y下端 → Y上端。DOM上の描画順（Y軸名が先頭）とは
 * 異なるため、ネイティブのTab順に頼らずこの配列で管理する。
 */
const AXIS_LABEL_TAB_ORDER: Array<keyof MatrixAxisLabels> = [
  'xAxisLabel',
  'xLeftLabel',
  'xRightLabel',
  'yAxisLabel',
  'yBottomLabel',
  'yTopLabel',
];

/**
 * マトリクスの枠組み＋盤面＋軸ラベル一式（デザイン仕様§7）。
 *
 * grid-template-columns: 34px(Y軸ラベル) 30px(Y軸両端) 盤面 /
 * grid-template-rows: 盤面 30px(X軸両端) 34px(X軸ラベル)、gap 6px。
 *
 * 盤面の列を 1fr にすると、盤面が正方形で余った横幅の分だけ軸の両端ラベルが
 * 盤面から離れてしまう。ラベルは盤面の端に接していないと軸として読めないので、
 * 枠組み全体を「短い辺に合わせた正方形」にして、盤面の列がちょうど盤面の幅に
 * なるようにしている。ラベル列と行の厚みは縦横とも合計76px（モバイルは54px）で
 * 等しいため、外枠を正方形にすれば内側の盤面も自然に正方形になる。
 *
 * モバイル（1024px未満）は仕様に画面が無いため、列/行の厚みとフォントサイズを
 * 縮めた自己判断のレスポンシブ対応にしている。
 */
export function MatrixBoard({ champions }: MatrixBoardProps) {
  const gridSize = useDiagramStore((state) => state.matrixGridSize);
  const matrixPlacements = useDiagramStore((state) => state.matrixPlacements);
  const axisLabels = useDiagramStore((state) => state.matrixAxisLabels);
  const updateMatrixAxisLabels = useDiagramStore((state) => state.updateMatrixAxisLabels);
  const axisLabelOffsets = useDiagramStore((state) => state.matrixAxisLabelOffsets);
  const updateMatrixAxisLabelOffset = useDiagramStore(
    (state) => state.updateMatrixAxisLabelOffset,
  );

  const { setNodeRef } = useDroppable({
    id: 'droppable-matrix',
    data: { type: 'matrix' },
  });

  // 盤面（正方形部分）の実ピクセルサイズを計測する。軸ラベルの位置ずれは盤面サイズに対する
  // 比率で持っているため、コンテナクエリで可変するこのサイズを知らないとpx変換ができない。
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [boardSize, setBoardSize] = useState(0);
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setBoardSize(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Tabキーでのラベル間フォーカス移動用に、6つのラベルのDOM参照を集めておく
  const labelElementsRef = useRef<Partial<Record<keyof MatrixAxisLabels, HTMLDivElement | null>>>(
    {},
  );
  function handleNavigate(fromKey: keyof MatrixAxisLabels, direction: 1 | -1) {
    const order = AXIS_LABEL_TAB_ORDER;
    const currentIndex = order.indexOf(fromKey);
    const nextIndex = (currentIndex + direction + order.length) % order.length;
    focusAndSelectAllText(labelElementsRef.current[order[nextIndex]] ?? null);
  }

  const placements = matrixPlacements
    .map((placement) => ({
      placement,
      champion: champions.find((c) => c.id === placement.championId),
    }))
    .filter(
      (entry): entry is { placement: MatrixPlacement; champion: Champion } =>
        Boolean(entry.champion),
    );

  const cells = Array.from({ length: gridSize * gridSize });

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 items-center justify-center"
      style={{ containerType: 'size' }}
    >
      <div
        className="grid grid-cols-[22px_20px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_20px_22px] gap-[6px] lg:grid-cols-[34px_30px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)_30px_34px]"
        style={{ width: 'min(100cqw, 100cqh)', height: 'min(100cqw, 100cqh)' }}
      >
      {/* Y軸ラベル */}
      <div className="flex items-center justify-center">
        <EditableAxisLabel
          value={axisLabels.yAxisLabel}
          onCommit={(value) => updateMatrixAxisLabels({ yAxisLabel: value })}
          offset={axisLabelOffsets.yAxisLabel}
          onOffsetChange={(next) => updateMatrixAxisLabelOffset('yAxisLabel', next)}
          boardSize={boardSize}
          onNavigate={(direction) => handleNavigate('yAxisLabel', direction)}
          registerRef={(el) => {
            labelElementsRef.current.yAxisLabel = el;
          }}
          className={axisLabelClassName}
          style={{ writingMode: 'vertical-rl' }}
        />
      </div>

      {/* Y軸の両端 */}
      <div className="flex flex-col items-center justify-between py-[6px]">
        <EditableAxisLabel
          value={axisLabels.yTopLabel}
          onCommit={(value) => updateMatrixAxisLabels({ yTopLabel: value })}
          offset={axisLabelOffsets.yTopLabel}
          onOffsetChange={(next) => updateMatrixAxisLabelOffset('yTopLabel', next)}
          boardSize={boardSize}
          onNavigate={(direction) => handleNavigate('yTopLabel', direction)}
          registerRef={(el) => {
            labelElementsRef.current.yTopLabel = el;
          }}
          className={yEndClassName}
          style={{ writingMode: 'vertical-rl', color: 'var(--text-secondary)' }}
        />
        <EditableAxisLabel
          value={axisLabels.yBottomLabel}
          onCommit={(value) => updateMatrixAxisLabels({ yBottomLabel: value })}
          offset={axisLabelOffsets.yBottomLabel}
          onOffsetChange={(next) => updateMatrixAxisLabelOffset('yBottomLabel', next)}
          boardSize={boardSize}
          onNavigate={(direction) => handleNavigate('yBottomLabel', direction)}
          registerRef={(el) => {
            labelElementsRef.current.yBottomLabel = el;
          }}
          className={yEndClassName}
          style={{ writingMode: 'vertical-rl', color: 'var(--text-weak)' }}
        />
      </div>

      {/* 盤面。外枠が正方形なのでセルを埋めるだけで正方形になる */}
      <div className="min-h-0 min-w-0">
        <div
          ref={(node) => {
            setNodeRef(node);
            boardRef.current = node;
          }}
          className="relative h-full w-full overflow-hidden rounded-[var(--radius-control)] border"
          style={{
            background: 'var(--surface-matrix-board)',
            borderColor: 'var(--border-tile)',
          }}
        >
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {cells.map((_, index) => (
              <div
                key={index}
                style={{
                  borderRight: '1px solid var(--border-matrix-grid)',
                  borderBottom: '1px solid var(--border-matrix-grid)',
                }}
              />
            ))}
          </div>
          <div
            className="absolute inset-y-0 left-1/2 w-[1.5px]"
            style={{ background: 'var(--gold-matrix-center)' }}
          />
          <div
            className="absolute inset-x-0 top-1/2 h-[1.5px]"
            style={{ background: 'var(--gold-matrix-center)' }}
          />

          {placements.map(({ placement, champion }) => (
            <MatrixChampionPiece
              key={placement.id}
              placementId={placement.id}
              champion={champion}
              x={placement.x}
              y={placement.y}
            />
          ))}
        </div>
      </div>

      {/* row2: 左2列は空セル */}
      <div />
      <div />

      {/* X軸の両端 */}
      <div className="flex items-center justify-between px-2">
        <EditableAxisLabel
          value={axisLabels.xLeftLabel}
          onCommit={(value) => updateMatrixAxisLabels({ xLeftLabel: value })}
          offset={axisLabelOffsets.xLeftLabel}
          onOffsetChange={(next) => updateMatrixAxisLabelOffset('xLeftLabel', next)}
          boardSize={boardSize}
          onNavigate={(direction) => handleNavigate('xLeftLabel', direction)}
          registerRef={(el) => {
            labelElementsRef.current.xLeftLabel = el;
          }}
          className={xEndClassName}
          style={{ color: 'var(--text-weak)' }}
        />
        <EditableAxisLabel
          value={axisLabels.xRightLabel}
          onCommit={(value) => updateMatrixAxisLabels({ xRightLabel: value })}
          offset={axisLabelOffsets.xRightLabel}
          onOffsetChange={(next) => updateMatrixAxisLabelOffset('xRightLabel', next)}
          boardSize={boardSize}
          onNavigate={(direction) => handleNavigate('xRightLabel', direction)}
          registerRef={(el) => {
            labelElementsRef.current.xRightLabel = el;
          }}
          className={xEndClassName}
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>

      {/* row3: 左2列は空セル */}
      <div />
      <div />

      {/* X軸ラベル */}
      <div className="flex items-center justify-center">
        <EditableAxisLabel
          value={axisLabels.xAxisLabel}
          onCommit={(value) => updateMatrixAxisLabels({ xAxisLabel: value })}
          offset={axisLabelOffsets.xAxisLabel}
          onOffsetChange={(next) => updateMatrixAxisLabelOffset('xAxisLabel', next)}
          boardSize={boardSize}
          onNavigate={(direction) => handleNavigate('xAxisLabel', direction)}
          registerRef={(el) => {
            labelElementsRef.current.xAxisLabel = el;
          }}
          className={axisLabelClassName}
          />
        </div>
      </div>
    </div>
  );
}
