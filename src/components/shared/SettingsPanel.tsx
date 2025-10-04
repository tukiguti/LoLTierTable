import React from 'react';

export interface SettingsPanelProps {
  title: string;
  isVisible: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  title,
  isVisible,
  onToggle,
  children,
  className = '',
  subtitle,
}) => {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            isVisible
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isVisible ? '\u8a2d\u5b9a\u3092\u975e\u8868\u793a' : '\u8a2d\u5b9a\u3092\u8868\u793a'}
        </button>
      </div>

      {isVisible && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};
