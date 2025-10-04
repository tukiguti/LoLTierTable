import React from 'react';
import { SimpleLayout } from '../Layout/SimpleLayout';
import { TierListStagingArea } from '../StagingArea/TierListStagingArea';
import { UniversalChampionContainer } from '../common';
import { ZoneScatterMatrix } from './ZoneScatterMatrix';
import { useAppStore } from '../../store/appStore';
import type { Champion } from '../../types';

const UI_TEXT = {
  title: 'ゾーンスキャッター',
  hint: 'ステージングのチャンピオンをゾーンにドラッグして配置します。',
} as const;

export const ZoneScatterMatrixLayout: React.FC = () => {
  const { champions: allChampions, setSelectedChampion } = useAppStore();

  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
  };

  const workArea = (
    <div className="flex h-full flex-col gap-3 overflow-hidden px-3 pb-3 pt-2">
      <section className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">{UI_TEXT.title}</h2>
          <p className="text-[11px] text-slate-500">{UI_TEXT.hint}</p>
        </div>
      </section>

      <section className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
        <ZoneScatterMatrix />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-2 py-2">
        <TierListStagingArea />
      </section>
    </div>
  );

  const championPanel = (
    <div className="h-full px-2 py-2">
      <div className="h-full rounded-xl border border-slate-200 bg-white">
        <UniversalChampionContainer
          champions={allChampions}
          features={{
            search: true,
            presets: true,
            staging: false,
            filters: true,
          }}
          displayConfig={{
            iconSize: 'small',
            gridColumns: 'auto-fit',
            maxItems: 0,
            containerHeight: 300,
            showItemCount: true,
          }}
          layout={{
            mode: 'tabs',
            presetWidth: 220,
            searchWidth: 280,
            stagingHeight: 100,
          }}
          operations={{
            onChampionSelect: handleChampionSelect,
          }}
          mode="scatter"
        />
      </div>
    </div>
  );

  return <SimpleLayout workArea={workArea} championPanel={championPanel} />;
};

