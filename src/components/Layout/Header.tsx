import React, { memo, useCallback } from 'react';
import type { DiagramType } from '../../types';

type ModeOption = {
  id: DiagramType;
  label: string;
  hint: string;
};

interface HeaderProps {
  currentMode: DiagramType;
  onModeChange: (mode: DiagramType) => void;
}

const MODE_OPTIONS: ModeOption[] = [
  { id: 'tierlist', label: 'ティアリスト', hint: '評価をランク付け' },
  { id: 'matrix', label: 'マトリクス', hint: '2軸で比較' },
  { id: 'scatter', label: 'ゾーンスキャッター', hint: '4象限で整理' }
];

export const Header: React.FC<HeaderProps> = memo(({
  currentMode,
  onModeChange,
}) => {
  const handleModeChange = useCallback((mode: DiagramType) => {
    onModeChange(mode);
  }, [onModeChange]);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">LoL Tier Table</h1>
            <p className="text-xs text-slate-500">ドラッグ＆ドロップでチャンピオン評価を直感的に整理</p>
          </div>

          <div className="flex items-center">
            <nav className="flex bg-slate-100 p-1 rounded-xl" aria-label="表示モード切り替え">
              {MODE_OPTIONS.map((mode) => {
                const isActive = currentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeChange(mode.id)}
                    aria-pressed={isActive}
                    className={`px-3 py-2 rounded-lg text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{mode.label}</span>
                    <span className="block text-[10px] tracking-wide uppercase text-slate-400">
                      {mode.hint}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
});
