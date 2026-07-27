import { useDroppable } from '@dnd-kit/core';
import { EditableAxisLabel } from './EditableAxisLabel';
import { MatrixChampionPiece } from './MatrixChampionPiece';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { Champion, MatrixPlacement } from '../../types';

interface MatrixBoardProps {
  champions: Champion[];
}

const axisLabelClassName =
  'font-display cursor-text text-center text-[14px] leading-none font-bold tracking-[0.12em] text-[var(--gold)] uppercase outline-none lg:text-[19px]';
const yEndClassName =
  'cursor-text text-[11px] font-semibold outline-none lg:text-[13px]';
const xEndClassName = 'cursor-text text-[11px] font-semibold outline-none lg:text-[13px]';

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

  const { setNodeRef } = useDroppable({
    id: 'droppable-matrix',
    data: { type: 'matrix' },
  });

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
          className={axisLabelClassName}
          style={{ writingMode: 'vertical-rl' }}
        />
      </div>

      {/* Y軸の両端 */}
      <div className="flex flex-col items-center justify-between py-[6px]">
        <EditableAxisLabel
          value={axisLabels.yTopLabel}
          onCommit={(value) => updateMatrixAxisLabels({ yTopLabel: value })}
          className={yEndClassName}
          style={{ writingMode: 'vertical-rl', color: 'var(--text-secondary)' }}
        />
        <EditableAxisLabel
          value={axisLabels.yBottomLabel}
          onCommit={(value) => updateMatrixAxisLabels({ yBottomLabel: value })}
          className={yEndClassName}
          style={{ writingMode: 'vertical-rl', color: 'var(--text-weak)' }}
        />
      </div>

      {/* 盤面。外枠が正方形なのでセルを埋めるだけで正方形になる */}
      <div className="min-h-0 min-w-0">
        <div
          ref={setNodeRef}
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
              key={champion.id}
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
          className={xEndClassName}
          style={{ color: 'var(--text-weak)' }}
        />
        <EditableAxisLabel
          value={axisLabels.xRightLabel}
          onCommit={(value) => updateMatrixAxisLabels({ xRightLabel: value })}
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
          className={axisLabelClassName}
          />
        </div>
      </div>
    </div>
  );
}
