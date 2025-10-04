import React from 'react';
import { useTierListStore } from '../../store/tierListStore';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { SimpleLayout } from '../Layout/SimpleLayout';
import { TierListStagingArea } from '../StagingArea/TierListStagingArea';
import { UniversalChampionContainer } from '../common';
import { useAppStore } from '../../store/appStore';
import { InlineEditField, ResetButton } from '../shared';
import type { Champion } from '../../types';

const UI_TEXT = {
  title: '\u30c6\u30a3\u30a2\u30ea\u30b9\u30c8\u4f5c\u6210',
  subtitle: '\u30b9\u30c6\u30fc\u30b8\u30f3\u30b0\u3067\u5019\u88dc\u3092\u96c6\u3081\u3066\u304b\u3089\u3001\u5404\u30c6\u30a3\u30a2\u306b\u30c9\u30e9\u30c3\u30b0\uff06\u30c9\u30ed\u30c3\u30d7\u3057\u307e\u3059\u3002',
  addTier: '\u30c6\u30a3\u30a2\u3092\u8ffd\u52a0',
  resetLabel: '\u30ea\u30bb\u30c3\u30c8',
  resetConfirm: '\u30c6\u30a3\u30a2\u30ea\u30b9\u30c8\u3092\u30ea\u30bb\u30c3\u30c8\u3057\u307e\u3059\u304b\uff1f\u914d\u7f6e\u6e08\u307f\u306e\u30c1\u30e3\u30f3\u30d4\u30aa\u30f3\u304c\u3059\u3079\u3066\u524a\u9664\u3055\u308c\u307e\u3059\u3002',
  emptyTier: '\u3053\u3053\u306b\u30c1\u30e3\u30f3\u30d4\u30aa\u30f3\u3092\u30c9\u30e9\u30c3\u30b0\u3057\u3066\u30e9\u30f3\u30af\u4ed8\u3051',
  statsLabel: '\u914d\u7f6e\u6e08\u307f\u30c1\u30e3\u30f3\u30d4\u30aa\u30f3:',
  stagingTitle: '\u4e00\u6642\u4fdd\u7ba1\u30b9\u30da\u30fc\u30b9'
} as const;

export const SimpleTierList: React.FC = () => {
  const { tiers, addTier, updateTierLabel, resetTiers } = useTierListStore();
  const { champions: allChampions, setSelectedChampion } = useAppStore();

  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
  };

  const totalPlaced = tiers.reduce((sum, tier) => sum + tier.champions.length, 0);

  const workArea = (
    <div className="flex h-full flex-col gap-3 overflow-hidden px-3 pb-3 pt-2">
      <section className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">{UI_TEXT.title}</h2>
            <p className="text-[11px] text-slate-500">{UI_TEXT.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addTier}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              {UI_TEXT.addTier}
            </button>
            <ResetButton
              onReset={resetTiers}
              confirmMessage={UI_TEXT.resetConfirm}
            >
              {UI_TEXT.resetLabel}
            </ResetButton>
          </div>
        </header>
      </section>

      <section className="flex-1 overflow-auto">
        <div className="space-y-2.5 pr-1">
          {tiers.map((tier) => (
            <div key={tier.id} className="rounded-xl border border-slate-200 bg-white">
              <div className="flex">
                <div
                  className="flex flex-col items-center justify-center gap-1 px-3 py-3"
                  style={{ backgroundColor: tier.color, minWidth: "10rem" }}
                >
                  <InlineEditField
                    value={tier.label}
                    onSave={(value) => updateTierLabel(tier.id, value)}
                    className="w-full text-center uppercase tracking-wide"
                    displayClassName="flex w-full items-center justify-center rounded-md px-3 py-1 text-2xl font-bold text-white transition-colors"
                    editClassName="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-xl font-bold uppercase text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
                  />
                </div>
                <DroppableZone
                  id={tier.id}
                  data={{ type: 'tier', tierId: tier.id }}
                  className="flex flex-1 flex-wrap items-center gap-2 p-3"
                  activeClassName="bg-blue-50"
                >
                  {tier.champions.length === 0 ? (
                    <p className="w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 py-3 text-center text-xs text-slate-500">
                      {UI_TEXT.emptyTier}
                    </p>
                  ) : (
                    tier.champions.map((champion, index) => (
                      <DraggableChampion
                        key={`${tier.id}-${champion.id}-${index}`}
                        uniqueId={`${tier.id}__${champion.id}__${index}`}
                        champion={champion}
                        size="medium"
                        className="rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
                      />
                    ))
                  )}
                </DroppableZone>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
        <span>{UI_TEXT.statsLabel}</span>
        <span className="font-semibold text-slate-800">{totalPlaced}体</span>
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
            filters: true
          }}
          displayConfig={{
            iconSize: 'small',
            gridColumns: 'auto-fit',
            maxItems: 0,
            containerHeight: 300,
            showItemCount: true
          }}
          layout={{
            mode: 'tabs',
            presetWidth: 200,
            searchWidth: 280,
            stagingHeight: 100
          }}
          operations={{
            onChampionSelect: handleChampionSelect
          }}
          mode="tierlist"
        />
      </div>
    </div>
  );

  return (
    <SimpleLayout
      workArea={workArea}
      championPanel={championPanel}
    />
  );
};







