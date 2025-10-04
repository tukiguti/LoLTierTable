import React, { useState } from 'react';
import type { Champion } from '../../types';
import { usePresetStore } from '../../store/presetStore';
import { useAppStore } from '../../store/appStore';

const TEXT = {
  roleGroup: '\u30ed\u30fc\u30eb\u30d7\u30ea\u30bb\u30c3\u30c8',
  laneGroup: '\u30ec\u30fc\u30f3\u30d7\u30ea\u30bb\u30c3\u30c8',
  groupLabel: '\u30d7\u30ea\u30bb\u30c3\u30c8\u306e\u7a2e\u985e',
  roleSelect: '\u30ed\u30fc\u30eb\u3092\u9078\u629e:',
  laneSelect: '\u30ec\u30fc\u30f3\u3092\u9078\u629e:',
  noPresets: '\u5229\u7528\u3067\u304d\u308b\u30d7\u30ea\u30bb\u30c3\u30c8\u304c\u3042\u308a\u307e\u305b\u3093',
  addPreset: '+ JSON\u304b\u3089\u30d7\u30ea\u30bb\u30c3\u30c8\u767b\u9332',
  modalTitle: '\u30d7\u30ea\u30bb\u30c3\u30c8\u767b\u9332',
  modalLabel: 'JSON\u30c7\u30fc\u30bf\u3092\u30da\u30fc\u30b9\u30c8',
  cancel: '\u30ad\u30e3\u30f3\u30bb\u30eb',
  submit: '\u767b\u9332',
  invalidPreset: '\u30d7\u30ea\u30bb\u30c3\u30c8\u30c7\u30fc\u30bf\u304c\u4e0d\u6b63\u3067\u3059\u3002name \u3068 champions \u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
  invalidJson: 'JSON\u306e\u5f62\u5f0f\u304c\u6b63\u3057\u304f\u3042\u308a\u307e\u305b\u3093\u3002',
  success: (name: string, count: number) => `\u30d7\u30ea\u30bb\u30c3\u30c8「${name}」\u3092\u767b\u9332\u3057、${count}\u4f53\u3092\u30b9\u30c6\u30fc\u30b8\u30f3\u30b0\u306b\u8ffd\u52a0\u3057\u307e\u3057\u305f\u3002`,
  placeholder: '{"name": "...", "champions": ["Ahri", ...]}',
  labelPlaceholder: '\u30e9\u30d9\u30eb\u540d',
} as const;

interface PresetSelectorProps {
  selectedGroup: string;
  onGroupChange: (group: string) => void;
  onPresetLoad: (champions: Champion[]) => void;
  className?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedGroup,
  onGroupChange,
  onPresetLoad,
  className = '',
}) => {
  const { presets, getChampionsForPreset, addPreset } = usePresetStore();
  const { champions: allChampions } = useAppStore();
  const [showImporter, setShowImporter] = useState(false);
  const [importData, setImportData] = useState('');

  const rolePresets = presets.filter((preset) =>
    preset.tags?.some((tag) => ['Fighter', 'Tank', 'Marksman', 'Assassin', 'Mage', 'Support'].includes(tag))
  );

  const lanePresets = presets.filter((preset) =>
    preset.isCustom && ['top-lane', 'jungle', 'mid-lane', 'adc', 'support'].includes(preset.id)
  );

  const groups = [
    { id: 'role', name: TEXT.roleGroup, items: rolePresets },
    { id: 'lane', name: TEXT.laneGroup, items: lanePresets },
  ];

  const currentPresets = selectedGroup === 'role' ? rolePresets : lanePresets;

  const handleImportPreset = () => {
    try {
      const presetData = JSON.parse(importData);
      if (!presetData.name || !Array.isArray(presetData.champions)) {
        alert(TEXT.invalidPreset);
        return;
      }

      const newPreset = {
        name: presetData.name,
        description: presetData.description ?? '',
        icon: presetData.icon ?? '⭐',
        champions: presetData.champions,
        isCustom: true,
      };

      addPreset(newPreset);
      const champions = getChampionsForPreset(
        { ...newPreset, id: `custom-${Date.now()}`, createdAt: '', updatedAt: '' },
        allChampions,
      );
      onPresetLoad(champions);

      setImportData('');
      setShowImporter(false);
      alert(TEXT.success(newPreset.name, champions.length));
    } catch (error) {
      alert(TEXT.invalidJson);
    }
  };

  return (
    <div className={`preset-selector space-y-3 text-xs text-slate-600 ${className}`}>
      <div className="space-y-1">
        <div className="font-medium text-slate-700">{TEXT.groupLabel}</div>
        <div className="flex gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onGroupChange(group.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedGroup === group.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="font-medium text-slate-700">
          {selectedGroup === 'role' ? TEXT.roleSelect : TEXT.laneSelect}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {currentPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                const champions = getChampionsForPreset(preset, allChampions);
                onPresetLoad(champions);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-slate-800">{preset.icon} {preset.name}</div>
              <div className="mt-0.5 text-[11px] text-slate-500">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {currentPresets.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-slate-400">
          {TEXT.noPresets}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowImporter(true)}
        className="w-full rounded-md bg-purple-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-600"
      >
        {TEXT.addPreset}
      </button>

      {showImporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-xl rounded-xl bg-white p-4 text-xs text-slate-600">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{TEXT.modalTitle}</h3>
              <button type="button" onClick={() => setShowImporter(false)} className="text-slate-400 hover:text-slate-600">
                \u2715
              </button>
            </div>
            <div className="space-y-3">
              <label className="block font-medium text-slate-700">
                {TEXT.modalLabel}
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="mt-1 h-32 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder={TEXT.placeholder}
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImporter(false)}
                  className="rounded-md px-3 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  {TEXT.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleImportPreset}
                  disabled={!importData.trim()}
                  className={`rounded-md px-3 py-1.5 text-white transition-colors ${
                    importData.trim()
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {TEXT.submit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
