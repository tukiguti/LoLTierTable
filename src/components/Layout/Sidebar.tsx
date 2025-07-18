import React from 'react';
import { ChampionPanel } from '../ChampionPanel';
import type { Champion } from '../../types';

interface SidebarProps {
  champions: Champion[];
  searchFilter: string;
  onSearchChange: (filter: string) => void;
  onChampionSelect: (champion: Champion) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  champions,
  searchFilter,
  onSearchChange,
  onChampionSelect,
}) => {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">チャンピオン</h2>
      </div>

      <div className="p-4">
        <ChampionPanel
          champions={champions}
          onChampionSelect={onChampionSelect}
          searchFilter={searchFilter}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
};