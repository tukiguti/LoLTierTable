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

export const SimpleTierList: React.FC = () => {
  const { 
    tiers, 
    addTier, 
    removeTier, 
    updateTierLabel, 
    resetTiers
  } = useTierListStore();
  
  const { 
    champions: allChampions, 
    setSelectedChampion 
  } = useAppStore();

  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
  };

  // Work Area - Tier List with staging at bottom
  const workArea = (
    <div className="h-full flex flex-col overflow-hidden" style={{ 
      background: 'transparent'
    }}>
      {/* Control Panel - Enhanced TierMaker Style */}
      <div 
        className="text-white rounded-xl shadow-2xl border p-4 flex-shrink-0 m-4 mb-2"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          border: '2px solid #3b82f6',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)'
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              T
            </div>
            <h2 className="text-2xl font-black text-white tracking-wider drop-shadow-lg">
              TIER LIST MAKER
            </h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={addTier}
              className="px-6 py-3 text-white rounded-lg text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 border-2"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderColor: '#10b981',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)';
              }}
            >
              + ADD TIER
            </button>
            <ResetButton
              onReset={resetTiers}
              confirmMessage="ティアリストをリセットしますか？すべてのチャンピオン配置が削除されます。"
            />
          </div>
        </div>
      </div>

      {/* Content Area - No Scroll */}
      <div className="flex-1 px-4 flex flex-col overflow-hidden">
        {/* Tier List - Enhanced Main Content */}
        <div className="space-y-2 flex-1">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="mb-2"
            >
            <div 
              className="flex shadow-2xl rounded-xl overflow-hidden border-2"
              style={{
                borderColor: '#3b82f6',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 10px rgba(59, 130, 246, 0.1)'
              }}
            >
              {/* Enhanced Tier Label */}
              <div
                className="flex flex-col items-center justify-center p-6 text-white font-black shadow-inner relative border-r-2"
                style={{ 
                  width: '100px',
                  minWidth: '100px',
                  background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}cc 50%, ${tier.color}aa 100%)`,
                  textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
                  borderRightColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <InlineEditField
                  value={tier.label}
                  onSave={(value) => updateTierLabel(tier.id, value)}
                  className="text-center font-black text-white bg-transparent border-none outline-none uppercase tracking-wider"
                  editClassName="text-black bg-white rounded-lg px-4 py-3 font-black uppercase shadow-lg"
                  displayClassName="cursor-pointer hover:bg-black hover:bg-opacity-20 rounded-lg px-3 py-3 transition-all duration-200"
                  style={{ 
                    textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
                    fontSize: '3rem',
                    lineHeight: '1.1'
                  }}
                />
              </div>

              {/* Enhanced Champion Drop Zone */}
              <div 
                className="flex-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'
                }}
              >
                <DroppableZone
                  id={tier.id}
                  data={{ type: 'tier', tierId: tier.id }}
                  className="min-h-24 p-4 bg-transparent flex flex-wrap gap-3 items-center justify-start"
                  activeClassName="bg-blue-100 bg-opacity-70"
                  style={{
                    minHeight: '96px'
                  }}
                >
                  {tier.champions.length === 0 ? (
                    <div 
                      className="text-sm w-full text-center py-8 font-semibold italic rounded-lg border-2 border-dashed transition-all duration-200"
                      style={{
                        color: '#64748b',
                        borderColor: '#cbd5e1',
                        background: 'rgba(241, 245, 249, 0.5)'
                      }}
                    >
                      Drop champions here to rank them
                    </div>
                  ) : (
                    tier.champions.map((champion, index) => (
                      <DraggableChampion
                        key={`${tier.id}-${champion.id}-${index}`}
                        uniqueId={`${tier.id}__${champion.id}__${index}`}
                        champion={champion}
                        size="medium"
                        className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-3 border-transparent hover:border-blue-400 hover:scale-105"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                        }}
                      />
                    ))
                  )}
                </DroppableZone>
              </div>
            </div>
          </div>
          ))}
        </div>


        {/* Compact Stats */}
        <div 
          className="text-center text-xs font-semibold mt-2 px-2 py-1 rounded"
          style={{
            color: '#e2e8f0',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          配置済み: {tiers.reduce((sum, tier) => sum + tier.champions.length, 0)} 体
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