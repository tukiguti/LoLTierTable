import React, { useState } from 'react';
import type { Champion } from '../../types';
import { usePresetStore } from '../../store/presetStore';
import { useAppStore } from '../../store/appStore';

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
  className = ''
}) => {
  const { presets, getChampionsForPreset, addPreset } = usePresetStore();
  const { champions: allChampions } = useAppStore();
  const [showImporter, setShowImporter] = useState(false);
  const [importData, setImportData] = useState('');

  // Filter presets by category
  const rolePresets = presets.filter(preset => 
    preset.tags && preset.tags.some(tag => 
      ['Fighter', 'Tank', 'Marksman', 'Assassin', 'Mage', 'Support'].includes(tag)
    )
  );
  
  const lanePresets = presets.filter(preset => 
    preset.isCustom && ['top-lane', 'jungle', 'mid-lane', 'adc', 'support'].includes(preset.id)
  );

  const presetGroups = [
    { id: 'role', name: 'Role Presets', presets: rolePresets },
    { id: 'lane', name: 'Lane Presets', presets: lanePresets }
  ];

  const currentPresets = selectedGroup === 'role' ? rolePresets : lanePresets;

  const handleImportPreset = () => {
    try {
      const presetData = JSON.parse(importData);
      const newPreset = {
        name: presetData.name,
        description: presetData.description || '',
        icon: presetData.icon || '⭐',
        champions: presetData.champions,
        isCustom: true,
      };
      
      addPreset(newPreset);
      
      // 登録後にtempエリアに設置
      const champions = getChampionsForPreset(
        { ...newPreset, id: `custom-${Date.now()}`, createdAt: '', updatedAt: '' },
        allChampions
      );
      onPresetLoad(champions);
      
      setImportData('');
      setShowImporter(false);
      alert('プリセットを登録してtempエリアに設置しました');
    } catch (error) {
      alert('JSON形式が正しくありません');
    }
  };

  return (
    <div className={`preset-selector space-y-3 ${className}`}>
      {/* Group Selection */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Preset Type:</div>
        <div className="flex gap-2">
          {presetGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => onGroupChange(group.id)}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                selectedGroup === group.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Selection */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          Select {selectedGroup === 'role' ? 'Role' : 'Lane'}:
        </div>
        <div className="grid grid-cols-2 gap-2">
          {currentPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                const champions = getChampionsForPreset(preset, allChampions);
                onPresetLoad(champions);
              }}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <div className="font-medium">{preset.icon} {preset.name}</div>
              <div className="text-xs text-gray-500">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {currentPresets && currentPresets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">📋</div>
          <div>No presets available</div>
        </div>
      )}

      {/* カスタムプリセット登録ボタン */}
      <button
        onClick={() => setShowImporter(true)}
        className="w-full py-2 px-3 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
      >
        + JSONからプリセット登録
      </button>

      {/* プリセット登録モーダル */}
      {showImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">プリセット登録</h3>
              <button onClick={() => setShowImporter(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSONデータをペースト:
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder='{"id": "...", "name": "...", "champions": [...], ...}'
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowImporter(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleImportPreset}
                  disabled={!importData.trim()}
                  className={`px-4 py-2 rounded ${
                    importData.trim()
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};