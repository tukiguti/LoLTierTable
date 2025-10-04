import React from 'react';
import { useMatrixStore } from '../../store/matrixStore';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { InlineEditField, SettingsPanel, ResetButton } from '../shared';

const UI_TEXT = {
  panelTitle: 'ゾーン フリーボード',
  panelSubtitle: 'ゾーンごとのラベルと色はここで編集できます。',
  resetConfirm: 'ゾーンスキャッターをリセットしますか？配置したチャンピオンも削除されます。',
  resetNotice: 'リセットすると配置とラベルが初期化されます。',
  labelHeading: 'ゾーンラベル設定',
  hintInline: 'ゾーン内のラベルも直接編集できます',
  statsPlaced: '配置済み',
  statsStaging: '一時保管',
} as const;

const ZONE_SIZE = {
  width: 420,
  height: 320,
} as const;

const ZONE_META = [
  {
    id: 'topLeft' as const,
    title: '左上',
    chipColor: '#dc2626',
    area: '1 / 1',
    background: 'linear-gradient(135deg, #dc2626 0%, #fef2f2 100%)',
  },
  {
    id: 'topRight' as const,
    title: '右上',
    chipColor: '#16a34a',
    area: '1 / 2',
    background: 'linear-gradient(225deg, #16a34a 0%, #f0fdf4 100%)',
  },
  {
    id: 'bottomLeft' as const,
    title: '左下',
    chipColor: '#9333ea',
    area: '2 / 1',
    background: 'linear-gradient(45deg, #9333ea 0%, #faf5ff 100%)',
  },
  {
    id: 'bottomRight' as const,
    title: '右下',
    chipColor: '#ea580c',
    area: '2 / 2',
    background: 'linear-gradient(315deg, #ea580c 0%, #fff7ed 100%)',
  },
];

export const ZoneScatterMatrix: React.FC = () => {
  const {
    champions,
    zoneLabels,
    updateZoneLabel,
    setMatrixType,
  } = useMatrixStore();

  React.useEffect(() => {
    setMatrixType('scatter');
  }, [setMatrixType]);

  const [showSettings, setShowSettings] = React.useState(false);

  const handleReset = () => {
    const { removeChampion } = useMatrixStore.getState();
    champions
      .filter((pc) => pc.quadrant !== undefined)
      .forEach((pc) => removeChampion(pc.champion.id));
  };

  const getChampionsInZone = (zone: string) => {
    return champions.filter((pc) => pc.quadrant === zone);
  };

  const renderZone = (
    zoneId: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
    label: string,
    fallbackLabel: string,
    backgroundColor: string,
    gridArea: string,
  ) => {
    const zoneChampions = getChampionsInZone(zoneId);
    const zoneLabel = (label ?? '').trim() || fallbackLabel;

    return (
      <div className="relative" style={{ gridArea }}>
        {zoneLabel && (
          <div
            className="pointer-events-none absolute rounded bg-black/70 px-2 py-1 text-[11px] font-semibold text-white"
            style={{
              top: zoneId.includes('top') ? '6px' : 'auto',
              bottom: zoneId.includes('bottom') ? '6px' : 'auto',
              left: zoneId.includes('Left') ? '8px' : 'auto',
              right: zoneId.includes('Right') ? '8px' : 'auto',
              maxWidth: '140px',
              lineHeight: '1.2',
              textAlign: zoneId.includes('Right') ? 'right' : 'left',
              zIndex: 10,
            }}
          >
            {zoneLabel}
          </div>
        )}

        <DroppableZone
          id={`zone-${zoneId}`}
          data={{ type: 'zone-freeboard', zone: zoneId }}
          className="relative"
          style={{
            width: ZONE_SIZE.width,
            height: ZONE_SIZE.height,
            background: backgroundColor,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius:
              zoneId === 'topLeft'
                ? '12px 0 0 0'
                : zoneId === 'topRight'
                ? '0 12px 0 0'
                : zoneId === 'bottomLeft'
                ? '0 0 0 12px'
                : '0 0 12px 0',
          }}
          activeClassName="brightness-110"
        >
          {zoneChampions.map((champion) => (
            <div
              key={`${zoneId}-${champion.champion.id}`}
              className="absolute"
              style={{
                left: champion.x,
                top: champion.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <DraggableChampion
                uniqueId={`${zoneId}-${champion.champion.id}`}
                champion={champion.champion}
                size="small"
              />
            </div>
          ))}
        </DroppableZone>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <SettingsPanel
        title={UI_TEXT.panelTitle}
        subtitle={UI_TEXT.panelSubtitle}
        isVisible={showSettings}
        onToggle={() => setShowSettings((value) => !value)}
      >
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
          <span>{UI_TEXT.resetNotice}</span>
          <ResetButton
            onReset={handleReset}
            confirmMessage={UI_TEXT.resetConfirm}
            className="px-3 py-1 text-xs"
          />
        </div>

        {showSettings && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">{UI_TEXT.labelHeading}</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              {ZONE_META.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2"
                >
                  <span
                    className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: zone.chipColor }}
                  />
                  <InlineEditField
                    value={zoneLabels[zone.id]}
                    onSave={(value) => updateZoneLabel(zone.id, value)}
                    className="flex-1"
                    displayClassName="flex w-full items-center rounded-md border border-transparent px-2 py-1 text-left text-xs font-medium text-slate-700 hover:border-slate-300"
                    editClassName="w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    placeholder="ラベル名"
                  />
                </div>
              ))}
            </div>
            <div className="text-center text-[11px] text-slate-500">{UI_TEXT.hintInline}</div>
          </div>
        )}
      </SettingsPanel>

      <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-3">
        <div
          className="overflow-hidden rounded-lg"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(2, ${ZONE_SIZE.width}px)`,
            gridTemplateRows: `repeat(2, ${ZONE_SIZE.height}px)`,
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {ZONE_META.map((zone) =>
            renderZone(zone.id, zoneLabels[zone.id], zone.title, zone.background, zone.area)
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        {UI_TEXT.statsPlaced}: {champions.filter((pc) => pc.quadrant && pc.quadrant !== 'staging').length} 体 | {UI_TEXT.statsStaging}: {champions.filter((pc) => pc.quadrant === 'staging').length} 体
      </div>
    </div>
  );
};



