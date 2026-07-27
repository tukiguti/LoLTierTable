import { useDiagramStore } from '../../store/useDiagramStore';
import { MatrixBoard } from './MatrixBoard';
import type { Champion, MatrixGridSize } from '../../types';

interface MatrixViewProps {
  champions: Champion[];
}

const GRID_SIZES: MatrixGridSize[] = [4, 6];

const segmentButtonBase =
  'font-mono-ui cursor-pointer rounded-[var(--radius-small)] px-[14px] py-[5px] text-[12px]';
const segmentButtonActive = 'bg-[var(--gold)] text-[var(--gold-ink)]';
const segmentButtonInactive =
  'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]';

/**
 * マトリクスモードのメイン領域（デザイン仕様§7）。App.tsx のプレースホルダの差し替え先。
 * DndContext/DragOverlay 本体は App.tsx に置き、ここは描画だけを担当する（TierListView と同じ方針）。
 */
export function MatrixView({ champions }: MatrixViewProps) {
  const gridSize = useDiagramStore((state) => state.matrixGridSize);
  const setMatrixGridSize = useDiagramStore((state) => state.setMatrixGridSize);

  return (
    <main className="flex h-full min-h-0 flex-col gap-[14px] overflow-y-auto p-[14px_16px] lg:p-[18px_24px]">
      <div className="flex flex-none flex-wrap items-center gap-[14px]">
        <div className="flex gap-[3px] rounded-[var(--radius-control)] border border-[var(--border-input)] bg-[var(--surface-input)] p-[3px]">
          {GRID_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setMatrixGridSize(size)}
              aria-pressed={gridSize === size}
              className={`${segmentButtonBase} ${gridSize === size ? segmentButtonActive : segmentButtonInactive}`}
            >
              {size} × {size}
            </button>
          ))}
        </div>
        <div className="text-[12px] text-[var(--text-caption)]">
          アイコンはグリッド上の任意の位置にドラッグで移動できます
        </div>
      </div>

      <MatrixBoard champions={champions} />
    </main>
  );
}
