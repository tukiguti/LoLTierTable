import { LANES, LANE_PRESETS } from '../../data/presets';
import { useDiagramStore } from '../../store/useDiagramStore';

interface LanePresetsProps {
  /** デスクトップは5列グリッド、モバイルは5等分のフレックス（仕様書§5・§9） */
  variant: 'desktop' | 'mobile';
}

/**
 * レーンプリセット（要求定義§5.1 MUST）。押すと未分類の置き場をそのレーンの
 * チャンピオンで**置き換える**。
 *
 * レーンは1つを選んで使うものなので、押すたびに積み上がると TOP を見たいのに
 * MID のチャンピオンが混ざったままになる。段へ振り分け済みのチャンピオンは
 * ストア側が対象から外すため、評価済みの作業内容は消えない。
 */
export function LanePresets({ variant }: LanePresetsProps) {
  const replaceUnclassifiedWithPreset = useDiagramStore(
    (state) => state.replaceUnclassifiedWithPreset,
  );
  const activeLanePreset = useDiagramStore((state) => state.activeLanePreset);
  const isMobile = variant === 'mobile';

  return (
    <div className={isMobile ? 'flex gap-[6px]' : 'grid grid-cols-5 gap-[5px]'}>
      {LANES.map((lane) => {
        const active = activeLanePreset === lane;
        return (
          <button
            key={lane}
            type="button"
            aria-pressed={active}
            onClick={() => replaceUnclassifiedWithPreset(lane, [...LANE_PRESETS[lane]])}
            style={
              active
                ? {
                    borderColor: 'var(--gold-selected-border)',
                    background: 'var(--gold-selected-bg)',
                    color: 'var(--gold-text-strong)',
                  }
                : undefined
            }
            className={`border border-[var(--border-input-strong)] bg-[var(--surface-input)] text-center font-display text-[14px] font-bold text-[var(--text-secondary)] ${
              isMobile
                ? 'flex h-[38px] flex-1 items-center justify-center rounded-[var(--radius-control)] tracking-[0.04em]'
                : 'rounded-[var(--radius-small)] py-[7px] tracking-[0.05em] hover:border-[var(--gold)] hover:text-[var(--gold-text)]'
            }`}
          >
            {lane}
          </button>
        );
      })}
    </div>
  );
}
