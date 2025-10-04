import React, { type ReactNode } from 'react';

interface SimpleLayoutProps {
  workArea: ReactNode;
  championPanel: ReactNode;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({
  workArea,
  championPanel,
}) => {
  return (
    <div className="min-h-full bg-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <section className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {workArea}
        </section>
        <section className="min-h-[240px] rounded-2xl border border-slate-200 bg-white shadow-sm">
          {championPanel}
        </section>
      </div>
    </div>
  );
};
