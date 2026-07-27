import { CHAMPION_ROLES } from '../../data/presets';
import { useDiagramStore } from '../../store/useDiagramStore';

interface RoleChipsProps {
  /** デスクトップは折り返しチップ、モバイルは横スクロールのピル（仕様書§5・§9） */
  variant: 'desktop' | 'mobile';
}

const selectedClasses =
  'border-[var(--gold-selected-border)] bg-[var(--gold-selected-bg)] text-[var(--gold-text-strong)]';
const unselectedClasses =
  'border-[var(--border-input-strong)] bg-[var(--surface-input)] text-[var(--text-tertiary)]';

/**
 * ロール絞り込みチップ（要求定義§5.1 MUST）。複数選択可能で、ストアの
 * selectedRoles / toggleRole にそのまま繋ぐ。デスクトップ・モバイルで
 * 選択ロジックは同一のため、見た目だけを variant で出し分ける。
 */
export function RoleChips({ variant }: RoleChipsProps) {
  const selectedRoles = useDiagramStore((state) => state.selectedRoles);
  const toggleRole = useDiagramStore((state) => state.toggleRole);
  const isMobile = variant === 'mobile';

  return (
    <div className={isMobile ? 'flex flex-nowrap gap-[6px] overflow-x-auto' : 'flex flex-wrap gap-[5px]'}>
      {CHAMPION_ROLES.map((role) => {
        const selected = selectedRoles.includes(role);
        return (
          <button
            key={role}
            type="button"
            onClick={() => toggleRole(role)}
            aria-pressed={selected}
            className={`border font-semibold ${selected ? selectedClasses : unselectedClasses} ${
              isMobile
                ? 'flex h-[34px] flex-none items-center rounded-[17px] px-[12px] text-[13px]'
                : 'rounded-[var(--radius-small)] px-[10px] py-[5px] text-[12px] tracking-[0.02em]'
            }`}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}
