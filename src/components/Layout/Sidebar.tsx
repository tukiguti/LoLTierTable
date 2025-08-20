import React from 'react';
import { ImprovedChampionPanel } from '../ChampionPanel/ImprovedChampionPanel';
import type { Champion } from '../../types';

interface SidebarProps {
  champions: Champion[];
  searchFilter: string;
  onSearchChange: (filter: string) => void;
  onChampionSelect: (champion: Champion) => void;
  embedded?: boolean; // For use within ThreePaneLayout
}

export const Sidebar: React.FC<SidebarProps> = ({
  champions,
  searchFilter,
  onSearchChange,
  onChampionSelect,
  embedded = false,
}) => {
  return (
    <div className={embedded ? "h-full bg-gray-50 overflow-y-auto" : "w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto"}>
      {!embedded && (
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">チャンピオン</h2>
        </div>
      )}

      <div style={{ padding: 'var(--space-4)' }}>
        <ImprovedChampionPanel
          champions={champions}
          onChampionSelect={onChampionSelect}
          searchFilter={searchFilter}
          onSearchChange={onSearchChange}
          containerHeight={embedded ? 400 : 500}
        />
      </div>
    </div>
  );
};