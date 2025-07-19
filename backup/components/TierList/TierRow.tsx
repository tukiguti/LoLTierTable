import React from 'react';
import type { Tier } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { DroppableZone } from '../DragDrop/DroppableZone';

interface TierRowProps {
  tier: Tier;
  onLabelChange: (tierId: string, newLabel: string) => void;
  onColorChange: (tierId: string, newColor: string) => void;
  onDeleteTier: (tierId: string) => void;
  canDelete?: boolean;
}

export const TierRow: React.FC<TierRowProps> = ({
  tier,
  onLabelChange,
  onColorChange,
  onDeleteTier,
  canDelete = true,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editLabel, setEditLabel] = React.useState(tier.label);

  const handleLabelSubmit = () => {
    if (editLabel.trim() && editLabel !== tier.label) {
      onLabelChange(tier.id, editLabel.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setEditLabel(tier.label);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-2">
      {/* Tier Label Section */}
      <div 
        className="w-24 h-20 flex items-center justify-center text-white font-bold text-lg relative"
        style={{ backgroundColor: tier.color, color: 'white' }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={handleKeyPress}
            className="w-full h-full text-center text-white bg-transparent border-none outline-none placeholder-white placeholder-opacity-70"
            style={{ color: 'white' }}
            placeholder="ティア名"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full h-full flex items-center justify-center hover:bg-black hover:bg-opacity-20 transition-colors cursor-pointer"
            style={{ color: 'white' }}
            title="クリックして編集"
          >
            {tier.label}
          </button>
        )}

        {/* Color Picker */}
        <input
          type="color"
          value={tier.color}
          onChange={(e) => onColorChange(tier.id, e.target.value)}
          className="absolute top-1 right-1 w-4 h-4 border border-white border-opacity-50 rounded cursor-pointer"
          title="色を変更"
        />
      </div>

      {/* Champions Section */}
      <DroppableZone
        id={tier.id}
        data={{ tier }}
        className="flex-1 min-h-20 p-2"
        activeClassName="bg-blue-50 border-blue-300"
      >
        <div className="flex flex-wrap gap-2">
          {tier.champions.length === 0 ? (
            <div className="w-full h-16 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
              チャンピオンをドロップ
            </div>
          ) : (
            tier.champions.map((champion, index) => (
              <DraggableChampion
                key={`${tier.id}__${champion.id}__${index}`}
                uniqueId={`${tier.id}__${champion.id}__${index}`}
                champion={champion}
                size="medium"
              />
            ))
          )}
        </div>
      </DroppableZone>

      {/* Actions */}
      <div className="w-12 flex flex-col h-20">
        {canDelete && (
          <button
            onClick={() => onDeleteTier(tier.id)}
            className="flex-1 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="ティアを削除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};