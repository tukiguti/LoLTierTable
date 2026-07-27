import { ChampionIcon } from '../champion/ChampionIcon';
import { buildChampionMap, EXPORT_MIDDLE_HEIGHT, EXPORT_MIDDLE_WIDTH } from './exportMetrics';
import type { Champion, MatrixAxisLabels, MatrixGridSize, MatrixPlacement } from '../../types';

interface ExportMatrixBoardProps {
  placements: MatrixPlacement[];
  axisLabels: MatrixAxisLabels;
  gridSize: MatrixGridSize;
  champions: Champion[];
}

const AXIS_LABEL_SIZE = 34;
const AXIS_END_SIZE = 30;
const GRID_GAP = 6;
const PIECE_SIZE = 56;

/**
 * 書き出し用マトリクスの中央（デザイン仕様には無い画面のため、§7の画面用レイアウトと
 * ExportFrame§10の余白・書体・色を組み合わせて独自に構成した。§10は元々ティアリストの
 * 書き出ししか無いが、マトリクスモードでも書き出せるようにという指示のため実装判断で追加）。
 *
 * 枠組みは画面用（MatrixBoard.tsx）と同じ34px|30px|盤面・盤面|30px|34pxの構成。ただし
 * 画面用はコンテナクエリで可変幅に追従するのに対し、書き出しは常に1200×900固定なので、
 * 盤面のピクセルサイズをExportFrameの定数から一度だけ計算して決め打ちする。
 */
export function ExportMatrixBoard({ placements, axisLabels, gridSize, champions }: ExportMatrixBoardProps) {
  const championMap = buildChampionMap(champions);

  const availableRowHeight = EXPORT_MIDDLE_HEIGHT - AXIS_END_SIZE - AXIS_LABEL_SIZE - GRID_GAP * 2;
  const availableColWidth = EXPORT_MIDDLE_WIDTH - AXIS_LABEL_SIZE - AXIS_END_SIZE - GRID_GAP * 2;
  const boardSize = Math.max(120, Math.min(availableRowHeight, availableColWidth));

  const resolvedPlacements = placements
    .map((placement) => ({ placement, champion: championMap.get(placement.championId) }))
    .filter(
      (entry): entry is { placement: MatrixPlacement; champion: Champion } => Boolean(entry.champion),
    );

  const cells = Array.from({ length: gridSize * gridSize });

  return (
    <div
      style={{
        height: EXPORT_MIDDLE_HEIGHT,
        width: EXPORT_MIDDLE_WIDTH,
        display: 'grid',
        gridTemplateColumns: `${AXIS_LABEL_SIZE}px ${AXIS_END_SIZE}px ${boardSize}px`,
        gridTemplateRows: `${boardSize}px ${AXIS_END_SIZE}px ${AXIS_LABEL_SIZE}px`,
        gap: GRID_GAP,
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      {/* Y軸ラベル */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="font-display"
          style={{
            writingMode: 'vertical-rl',
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}
        >
          {axisLabels.yAxisLabel}
        </div>
      </div>

      {/* Y軸両端 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 0',
        }}
      >
        <div style={{ writingMode: 'vertical-rl', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {axisLabels.yTopLabel}
        </div>
        <div style={{ writingMode: 'vertical-rl', fontSize: 13, fontWeight: 600, color: 'var(--text-weak)' }}>
          {axisLabels.yBottomLabel}
        </div>
      </div>

      {/* 盤面 */}
      <div
        style={{
          position: 'relative',
          width: boardSize,
          height: boardSize,
          background: 'var(--surface-matrix-board)',
          border: '1px solid var(--border-tile)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
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
          style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1.5, background: 'var(--gold-matrix-center)' }}
        />
        <div
          style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1.5, background: 'var(--gold-matrix-center)' }}
        />

        {resolvedPlacements.map(({ placement, champion }) => (
          <div
            key={placement.id}
            style={{
              position: 'absolute',
              left: `${placement.x}%`,
              top: `${placement.y}%`,
              width: PIECE_SIZE,
              height: PIECE_SIZE,
              margin: `${-PIECE_SIZE / 2}px 0 0 ${-PIECE_SIZE / 2}px`,
            }}
          >
            <ChampionIcon
              champion={champion}
              size={PIECE_SIZE}
              radius={4}
              borderColor="var(--border-matrix-piece)"
              className="shadow-[0_6px_18px_-6px_#000]"
            />
          </div>
        ))}
      </div>

      {/* 左2列は空セル(row2) */}
      <div />
      <div />

      {/* X軸両端 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-weak)' }}>{axisLabels.xLeftLabel}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{axisLabels.xRightLabel}</div>
      </div>

      {/* 左2列は空セル(row3) */}
      <div />
      <div />

      {/* X軸ラベル */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="font-display"
          style={{
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}
        >
          {axisLabels.xAxisLabel}
        </div>
      </div>
    </div>
  );
}
