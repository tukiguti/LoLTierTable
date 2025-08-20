import React from 'react';
import { SimpleLayout } from '../Layout/SimpleLayout';
import { TierListStagingArea } from '../StagingArea/TierListStagingArea';
import { UniversalChampionContainer } from '../common';
import { ZoneScatterMatrix } from './ZoneScatterMatrix';
import { useAppStore } from '../../store/appStore';
import type { Champion } from '../../types';

export const ZoneScatterMatrixLayout: React.FC = () => {
  const { 
    champions: allChampions, 
    setSelectedChampion 
  } = useAppStore();

  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
  };

  // Work Area - Zone Scatter Matrix with staging at bottom
  const workArea = (
    <div className="h-full flex flex-col overflow-hidden" style={{ 
      background: 'transparent'
    }}>
      {/* Enhanced Control Panel - TierMaker Style */}
      <div 
        className="p-4 flex-shrink-0 m-4 mb-2"
        style={{
          background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
          border: '2px solid #8b5cf6'
        }}
      >
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-black text-lg"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            >
              Z
            </div>
            <h2 className="text-2xl font-black text-white tracking-wider drop-shadow-lg">
              ZONE SCATTER
            </h2>
          </div>
        </div>
      </div>

      {/* Content Area - No Scroll */}
      <div className="flex-1 px-4 flex flex-col overflow-hidden">
        {/* Zone Scatter Matrix - Main Content */}
        <div className="flex-1">
          <ZoneScatterMatrix />
        </div>

        {/* Compact Staging Area - Bottom */}
        <div className="mt-2">
          <TierListStagingArea />
        </div>
      </div>
    </div>
  );

  // Enhanced Champion Panel
  const championPanel = (
    <div className="h-full p-2" style={{ background: 'transparent' }}>
      <div 
        className="rounded-xl shadow-2xl border-2 p-1 h-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          borderColor: '#3b82f6',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.1)'
        }}
      >
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
            containerHeight: 320,
            showItemCount: true
          }}
          layout={{
            mode: 'tabs',
            presetWidth: 200,
            searchWidth: 300,
            stagingHeight: 100
          }}
          operations={{
            onChampionSelect: handleChampionSelect
          }}
          mode="scatter"
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