import React, { useMemo, useCallback, useState } from 'react';
import type { Champion } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';

interface VirtualizedChampionGridProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
  selectedChampion?: Champion | null;
  containerHeight?: number;
  iconSize?: number;
}

export const VirtualizedChampionGrid: React.FC<VirtualizedChampionGridProps> = ({
  champions,
  onChampionSelect,
  selectedChampion,
  containerHeight = 400,
  iconSize = 48,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewSize, setViewSize] = useState({ width: 300, height: containerHeight });

  // アイコンとグリッド設定
  const ICON_SIZE = iconSize; // アイコンサイズ
  const GAP = Math.max(4, iconSize * 0.1); // アイコン間の間隔（アイコンサイズの10%、最小4px）
  const PADDING = 16; // コンテナの余白

  // グリッド計算
  const gridCalc = useMemo(() => {
    const availableWidth = viewSize.width - (PADDING * 2);
    const itemWidth = ICON_SIZE + GAP;
    const cols = Math.max(1, Math.floor(availableWidth / itemWidth));
    const rows = Math.ceil(champions.length / cols);
    const rowHeight = ICON_SIZE + GAP;
    const totalHeight = rows * rowHeight;

    return {
      cols,
      rows,
      rowHeight,
      totalHeight,
      itemWidth,
    };
  }, [champions.length, viewSize.width, GAP, ICON_SIZE]);

  // 表示する行の範囲を計算
  const visibleRange = useMemo(() => {
    const { rowHeight } = gridCalc;
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
    const endRow = Math.min(
      gridCalc.rows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + 1
    );
    return { startRow, endRow };
  }, [scrollTop, containerHeight, gridCalc]);

  // 表示するアイテムを計算
  const visibleItems = useMemo(() => {
    const { cols } = gridCalc;
    const { startRow, endRow } = visibleRange;
    const items = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        if (index < champions.length) {
          const champion = champions[index];
          items.push({
            champion,
            index,
            row,
            col,
            x: PADDING + col * (ICON_SIZE + GAP),
            y: row * (ICON_SIZE + GAP),
          });
        }
      }
    }
    return items;
  }, [champions, gridCalc, visibleRange, ICON_SIZE, GAP, PADDING]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // リサイズオブザーバー
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setViewSize({ width, height });
      });
      resizeObserver.observe(node);
      return () => resizeObserver.disconnect();
    }
  }, []);

  if (champions.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ 
        height: '256px',
        color: 'var(--color-neutral-600)'
      }}>
        <div className="text-center">
          <div className="atlassian-text-heading-small" style={{ 
            marginBottom: 'var(--space-8)',
            color: 'var(--color-neutral-700)'
          }}>
            チャンピオンが見つかりません
          </div>
          <div className="atlassian-text-body atlassian-text-subtle">
            検索条件を変更してください
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ 
        height: containerHeight,
        backgroundColor: 'var(--color-neutral-50)',
        borderRadius: 'var(--border-radius-8)'
      }}
      onScroll={handleScroll}
    >
      <div 
        className="relative"
        style={{ height: gridCalc.totalHeight }}
      >
        {visibleItems.map(({ champion, index, x, y }) => (
          <div
            key={`${champion.id}-${index}`}
            className="absolute"
            style={{
              left: x,
              top: y,
              width: ICON_SIZE,
              height: ICON_SIZE,
            }}
          >
            <DraggableChampion
              uniqueId={`panel-${champion.id}`}
              champion={champion}
              size="small"
              onClick={() => onChampionSelect(champion)}
              className={`
                ${selectedChampion?.id === champion.id 
                  ? 'ring-2 ring-offset-1' 
                  : ''
                }
                hover:scale-110 transition-transform duration-150
              `}
              style={{
                borderRadius: 'var(--border-radius-4)',
                boxShadow: selectedChampion?.id === champion.id 
                  ? '0 0 0 2px var(--color-brand-primary)'
                  : 'var(--shadow-sm)'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* スクロールヒント */}
      <div 
        className="absolute atlassian-text-caption"
        style={{
          top: 'var(--space-8)',
          right: 'var(--space-8)',
          color: 'var(--color-neutral-600)',
          backgroundColor: 'var(--color-neutral-0)',
          padding: 'var(--space-4) var(--space-8)',
          borderRadius: 'var(--border-radius-4)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {champions.length}体
      </div>
    </div>
  );
};