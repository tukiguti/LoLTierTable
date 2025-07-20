import React from 'react';
import { useTierListStore } from '../../store/tierListStore';
import { TierRow } from './TierRow';
import { TierListControls } from './TierListControls';
import { DroppableZone } from '../DragDrop/DroppableZone';

interface TierListProps {
  onSave?: () => void;
  onExport?: () => void;
}

export const TierList: React.FC<TierListProps> = ({ onSave, onExport }) => {
  const {
    tiers,
    updateTierLabel,
    updateTierColor,
    addTier,
    removeTier,
    resetTierList,
  } = useTierListStore();

  const handleAddTier = () => {
    addTier();
  };

  const handleDeleteTier = (tierId: string) => {
    const tier = tiers.find(t => t.id === tierId);
    if (!tier) return;

    const shouldDelete = tier.champions.length === 0 || 
      window.confirm(`ティア "${tier.label}" には ${tier.champions.length} 体のチャンピオンがいます。削除しますか？`);
    
    if (shouldDelete) {
      removeTier(tierId);
    }
  };

  const handleReset = () => {
    const hasChampions = tiers.some(tier => tier.champions.length > 0);
    
    if (!hasChampions || window.confirm('ティアリストをリセットしますか？すべてのチャンピオンが未配置に戻ります。')) {
      resetTierList();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      // Default save behavior - could implement auto-save to localStorage
      console.log('Saving tier list...', { tiers });
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export behavior - could implement basic export
      console.log('Exporting tier list as image...');
    }
  };

  return (
    <div className="space-y-4">
      <TierListControls
        onAddTier={handleAddTier}
        onReset={handleReset}
        onSave={handleSave}
        onExport={handleExport}
        canSave={!!onSave}
      />

      <div className="space-y-2">
        {tiers
          .sort((a, b) => a.order - b.order)
          .map((tier) => (
            <TierRow
              key={tier.id}
              tier={tier}
              onLabelChange={updateTierLabel}
              onColorChange={updateTierColor}
              onDeleteTier={handleDeleteTier}
              canDelete={tiers.length > 1}
            />
          ))}
      </div>

      {/* Trash Bin */}
      <div className="mt-4 flex justify-center">
        <DroppableZone
          id="trash"
          data={{ type: 'trash' }}
          className="w-16 h-16 bg-red-100 border-2 border-red-300 border-dashed rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
          activeClassName="bg-red-200 border-red-500"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </DroppableZone>
      </div>
    </div>
  );
};