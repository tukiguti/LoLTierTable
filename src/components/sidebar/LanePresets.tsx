import { LANES, LANE_PRESETS } from '../../data/presets';
import { useDiagramStore } from '../../store/useDiagramStore';

interface LanePresetsProps {
  /** デスクトップは5列グリッド、モバイルは5等分のフレックス（仕様書§5・§9） */
  variant: 'desktop' | 'mobile';
}

/**
 * レーンプリセットの一括投入（要求定義§5.1 MUST）。押すとそのレーンの
 * チャンピオンIDを未分類の置き場へまとめて入れる。既に配置済みのIDは
 * ストア側（addChampionIdsToUnclassified）が無視するので、ここでは
 * プリセットのID配列をそのまま渡すだけでよい。
 */
export function LanePresets({ variant }: LanePresetsProps) {
  const addChampionIdsToUnclassified = useDiagramStore((state) => state.addChampionIdsToUnclassified);
  const isMobile = variant === 'mobile';

  return (
    <div className={isMobile ? 'flex gap-[6px]' : 'grid grid-cols-5 gap-[5px]'}>
      {LANES.map((lane) => (
        <button
          key={lane}
          type="button"
          onClick={() => addChampionIdsToUnclassified([...LANE_PRESETS[lane]])}
          className={`border border-[var(--border-input-strong)] bg-[var(--surface-input)] text-center font-display text-[14px] font-bold text-[var(--text-secondary)] ${
            isMobile
              ? 'flex h-[38px] flex-1 items-center justify-center rounded-[var(--radius-control)] tracking-[0.04em]'
              : 'rounded-[var(--radius-small)] py-[7px] tracking-[0.05em] hover:border-[var(--gold)] hover:text-[var(--gold-text)]'
          }`}
        >
          {lane}
        </button>
      ))}
    </div>
  );
}
