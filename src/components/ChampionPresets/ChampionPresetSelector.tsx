import React, { useState } from 'react';
import { usePresetStore } from '../../store/presetStore';
import type { Champion } from '../../types/champion';
import type { ChampionPreset } from '../../data/championPresets';
import { DEFAULT_PRESETS, SAMPLE_LANE_PRESETS } from '../../data/championPresets';

interface ChampionPresetSelectorProps {
  champions: Champion[];
  onSelectPreset: (champions: Champion[]) => void;
  showEditButton?: boolean;
}

export const ChampionPresetSelector: React.FC<ChampionPresetSelectorProps> = ({
  champions,
  onSelectPreset,
  showEditButton = false,
}) => {
  const { getChampionsForPreset } = usePresetStore();
  
  const [selectedCategory, setSelectedCategory] = useState<'role' | 'lane'>('role');
  const [selectedPreset, setSelectedPreset] = useState<ChampionPreset | null>(null);

  // カテゴリに応じてプリセットを取得
  const currentPresets = selectedCategory === 'role' ? DEFAULT_PRESETS : SAMPLE_LANE_PRESETS;


  const handleLoadPreset = () => {
    if (selectedPreset) {
      const presetChampions = getChampionsForPreset(selectedPreset, champions);
      onSelectPreset(presetChampions);
    }
  };


  return (
    <div className="h-full flex flex-col space-y-1"> {/* スペースを極小に */}
      {/* カテゴリ選択 */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-1">カテゴリ</h4>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value as 'role' | 'lane');
            setSelectedPreset(null);
          }}
          className="w-full px-2 py-1 text-xs border-0 rounded bg-gray-50 focus:outline-none focus:bg-white" // ボーダー削除、コンパクト
        >
          <option value="role">役職</option>
          <option value="lane">レーン</option>
        </select>
      </div>

      {/* プリセット選択 */}
      <div className="flex-1 overflow-hidden">
        <h4 className="text-xs font-semibold text-gray-700 mb-1">
          プリセット
        </h4>
        <select
          value={selectedPreset?.id || ''}
          onChange={(e) => {
            const preset = currentPresets.find(p => p.id === e.target.value);
            setSelectedPreset(preset || null);
          }}
          className="w-full px-2 py-1 text-xs border-0 rounded bg-gray-50 focus:outline-none focus:bg-white"
        >
          <option value="">
            {selectedCategory === 'role' ? '役職を選択してください' : 'レーンを選択してください'}
          </option>
          {currentPresets.map(preset => {
            const presetChampions = getChampionsForPreset(preset, champions);
            return (
              <option key={preset.id} value={preset.id}>
                {preset.icon} {preset.name} ({presetChampions.length}体)
              </option>
            );
          })}
        </select>
      </div>

      {/* 読み込みボタン */}
      <div>
        <button
          onClick={handleLoadPreset}
          disabled={!selectedPreset}
          className={`w-full py-1 px-2 text-xs font-semibold rounded transition-colors ${
            selectedPreset
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedPreset ? `読み込み` : 'プリセット選択'}
        </button>
      </div>
    </div>
  );
};