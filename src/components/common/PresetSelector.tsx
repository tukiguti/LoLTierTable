import React from 'react';
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
  const { presets, getChampionsForPreset } = usePresetStore();
  const { champions: allChampions } = useAppStore();

  // Filter presets by category
  const rolePresets = presets.filter(preset => 
    preset.tags && preset.tags.some(tag => 
      ['Fighter', 'Tank', 'Marksman', 'Assassin', 'Mage', 'Support'].includes(tag)
    )
  );
  
  const lanePresets = presets.filter(preset => 
    preset.name.toLowerCase().includes('top') ||
    preset.name.toLowerCase().includes('jungle') ||
    preset.name.toLowerCase().includes('mid') ||
    preset.name.toLowerCase().includes('adc') ||
    preset.name.toLowerCase().includes('support')
  );

  const presetGroups = [
    { id: 'role', name: 'Role Presets', presets: rolePresets },
    { id: 'lane', name: 'Lane Presets', presets: lanePresets }
  ];

  const currentPresets = selectedGroup === 'role' ? rolePresets : lanePresets;

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
    </div>
  );
};