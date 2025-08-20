import React, { useState } from 'react';
import { useMatrixStore } from '../../store/matrixStore';
import { DroppableZone } from '../DragDrop/DroppableZone';
import { DraggableChampion } from '../DragDrop/DraggableChampion';
import { InlineEditField, SettingsPanel, ResetButton } from '../shared';

export const ZoneScatterMatrix: React.FC = () => {
  const { 
    champions, 
    zoneLabels,
    updateZoneLabel,
    setMatrixType,
  } = useMatrixStore();
  
  // Set matrix type to scatter when this component mounts
  React.useEffect(() => {
    setMatrixType('scatter');
  }, [setMatrixType]);
  
  const [showSettings, setShowSettings] = useState(false);

  // Compact zone sizes for better 2x2 layout
  const ZONE_WIDTH = 480;
  const ZONE_HEIGHT = 360;

  const handleReset = () => {
    // Remove only scatter mode champions (keep grid mode champions)
    const { removeChampion } = useMatrixStore.getState();
    const scatterChampionsToRemove = champions.filter(pc => pc.quadrant !== undefined);
    scatterChampionsToRemove.forEach(pc => {
      removeChampion(pc.champion.id);
    });
  };

  // Get champions for each zone
  const getChampionsInZone = (zone: string) => {
    return champions.filter(pc => pc.quadrant === zone);
  };

  const renderZone = (zoneType: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', label: string, bgColor: string, backgroundColor: string, gridArea?: string) => {
    const zoneChampions = getChampionsInZone(zoneType);
    
    return (
      <div className="relative" style={{ gridArea: gridArea }}>
        {/* Zone Label - Corner position based on gradient origin (darkest part) */}
        {label && (
          <div 
            className="absolute px-2 py-1 rounded text-xs font-semibold z-20 pointer-events-none"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              backdropFilter: 'blur(6px)',
              maxWidth: '140px',
              wordBreak: 'break-word' as const,
              fontSize: '11px',
              lineHeight: '1.2',
              textAlign: zoneType.includes('Right') ? 'right' as const : 'left' as const,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              // 各ゾーンの適切な角に配置
              top: zoneType === 'topLeft' || zoneType === 'topRight' ? '8px' : 'auto',
              bottom: zoneType === 'bottomLeft' || zoneType === 'bottomRight' ? '8px' : 'auto',
              left: zoneType === 'topLeft' || zoneType === 'bottomLeft' ? '8px' : 'auto',
              right: zoneType === 'topRight' || zoneType === 'bottomRight' ? '8px' : 'auto'
            }}
          >
            {label}
          </div>
        )}
        
        {/* Zone Board - Color Coded with seamless borders */}
        <DroppableZone
          id={`zone-${zoneType}`}
          data={{ type: 'zone-freeboard', zone: zoneType }}
          className="relative"
          style={{
            width: ZONE_WIDTH,
            height: ZONE_HEIGHT,
            background: backgroundColor,
            border: '1px solid rgba(255, 255, 255, 0.2)', // Subtle inner border for zone distinction
            borderRadius: zoneType === 'topLeft' ? '12px 0 0 0' :
                         zoneType === 'topRight' ? '0 12px 0 0' :
                         zoneType === 'bottomLeft' ? '0 0 0 12px' :
                         zoneType === 'bottomRight' ? '0 0 12px 0' : '0',
            boxSizing: 'border-box'
          }}
          activeClassName="brightness-110"
        >
          {/* Positioned Champions in this zone */}
          {zoneChampions.map((champion) => (
            <div
              key={`${zoneType}-${champion.champion.id}`}
              className="absolute"
              style={{
                left: champion.x,
                top: champion.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 50
              }}
            >
              <DraggableChampion
                uniqueId={`${zoneType}-${champion.champion.id}`}
                champion={champion.champion}
                size="small"
              />
            </div>
          ))}
        </DroppableZone>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <SettingsPanel
        title="ゾーン フリーボード"
        isVisible={showSettings}
        onToggle={() => setShowSettings(!showSettings)}
      >
        <div className="flex justify-end gap-2 mb-4">
          <ResetButton
            onReset={handleReset}
            confirmMessage="ゾーンフリーボードをリセットしますか？配置されたチャンピオンも削除されます。"
          />
        </div>

        {/* Settings Panel - Collapsible */}
        {showSettings && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-4">ゾーンラベル設定</h3>
            
            {/* Visual 2x2 Grid for Label Setting */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Top Left Zone - Red */}
              <div className="p-3 bg-red-100 rounded border-2 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-xs font-semibold text-red-800">左上</span>
                </div>
                <InlineEditField
                  value={zoneLabels.topLeft}
                  onSave={(value) => updateZoneLabel('topLeft', value)}
                  className="w-full px-2 py-1 text-xs border border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  placeholder="ラベル名"
                />
              </div>

              {/* Top Right Zone - Green */}
              <div className="p-3 bg-green-100 rounded border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-xs font-semibold text-green-800">右上</span>
                </div>
                <InlineEditField
                  value={zoneLabels.topRight}
                  onSave={(value) => updateZoneLabel('topRight', value)}
                  className="w-full px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                  placeholder="ラベル名"
                />
              </div>

              {/* Bottom Left Zone - Purple */}
              <div className="p-3 bg-purple-100 rounded border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-xs font-semibold text-purple-800">左下</span>
                </div>
                <InlineEditField
                  value={zoneLabels.bottomLeft}
                  onSave={(value) => updateZoneLabel('bottomLeft', value)}
                  className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                  placeholder="ラベル名"
                />
              </div>

              {/* Bottom Right Zone - Orange */}
              <div className="p-3 bg-orange-100 rounded border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  <span className="text-xs font-semibold text-orange-800">右下</span>
                </div>
                <InlineEditField
                  value={zoneLabels.bottomRight}
                  onSave={(value) => updateZoneLabel('bottomRight', value)}
                  className="w-full px-2 py-1 text-xs border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                  placeholder="ラベル名"
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-600 text-center">
              💡 各ゾーンのラベルをクリックして編集できます
            </div>
          </div>
        )}
      </SettingsPanel>

      {/* Zone Free Boards - 2x2 Grid without gaps */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div 
          className="w-fit mx-auto rounded-xl overflow-hidden"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 480px)',
            gridTemplateRows: 'repeat(2, 360px)',
            gap: '0px', // Remove gaps between zones
            width: 'fit-content',
            border: '2px solid rgba(0, 0, 0, 0.1)' // Outer border for the whole grid
          }}
        >
          {/* Top Row: Red and Green zones */}
          {renderZone('topLeft', zoneLabels.topLeft, 'bg-red-600', 'linear-gradient(135deg, #dc2626 0%, #fef2f2 100%)', '1 / 1')}
          {renderZone('topRight', zoneLabels.topRight, 'bg-green-600', 'linear-gradient(225deg, #16a34a 0%, #f0fdf4 100%)', '1 / 2')}
          
          {/* Bottom Row: Purple and Orange zones */}
          {renderZone('bottomLeft', zoneLabels.bottomLeft, 'bg-purple-600', 'linear-gradient(45deg, #9333ea 0%, #faf5ff 100%)', '2 / 1')}
          {renderZone('bottomRight', zoneLabels.bottomRight, 'bg-orange-600', 'linear-gradient(315deg, #ea580c 0%, #fff7ed 100%)', '2 / 2')}
        </div>
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        配置済みチャンピオン: {champions.filter(pc => pc.quadrant !== undefined && pc.quadrant !== 'staging').length} 体 | 一時保存: {champions.filter(pc => pc.quadrant === 'staging').length} 体
      </div>
    </div>
  );
};