import React, { useMemo, useCallback, useState } from 'react';
import type { Champion } from '../../types';
import { DraggableChampion } from '../DragDrop/DraggableChampion';

interface VirtualizedChampionListProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
  selectedChampion?: Champion | null;
  containerHeight?: number;
  iconSize?: number;
}

export const VirtualizedChampionList: React.FC<VirtualizedChampionListProps> = ({
  champions,
  onChampionSelect,
  selectedChampion,
  containerHeight = 400,
  iconSize = 48,
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  // リスト設定
  const ITEM_HEIGHT = iconSize + 16; // アイコン + パディング

  // 表示する行の範囲を計算
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 1);
    const endIndex = Math.min(
      champions.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + 1
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, ITEM_HEIGHT, champions.length]);

  // 表示するアイテムを計算
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    const items = [];

    for (let i = startIndex; i <= endIndex; i++) {
      if (i < champions.length) {
        const champion = champions[i];
        items.push({
          champion,
          index: i,
          y: i * ITEM_HEIGHT,
        });
      }
    }
    return items;
  }, [champions, visibleRange, ITEM_HEIGHT]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
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

  const totalHeight = champions.length * ITEM_HEIGHT;

  return (
    <div 
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
        style={{ height: totalHeight }}
      >
        {visibleItems.map(({ champion, index, y }) => (
          <div
            key={`${champion.id}-${index}`}
            className="absolute left-0 right-0 flex items-center cursor-pointer"
            style={{
              top: y,
              height: ITEM_HEIGHT,
              padding: 'var(--space-8) var(--space-12)',
              borderBottom: '1px solid var(--color-neutral-200)',
              backgroundColor: selectedChampion?.id === champion.id 
                ? 'var(--color-brand-primary-hover)' 
                : 'transparent',
              transition: 'background-color 0.15s ease',
              gap: 'var(--space-12)'
            }}
            onMouseEnter={(e) => {
              if (selectedChampion?.id !== champion.id) {
                e.currentTarget.style.backgroundColor = 'var(--color-neutral-0)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedChampion?.id !== champion.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onClick={() => onChampionSelect(champion)}
          >
            {/* チャンピオンアイコン */}
            <div className="flex-shrink-0">
              <DraggableChampion
                uniqueId={`panel-list-${champion.id}`}
                champion={champion}
                size="small"
                style={{ 
                  width: iconSize, 
                  height: iconSize,
                  borderRadius: 'var(--border-radius-4)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
            </div>

            {/* チャンピオン情報 */}
            <div className="flex-1 min-w-0">
              <div className="atlassian-text-body" style={{ 
                fontWeight: 500, 
                color: 'var(--color-neutral-900)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {champion.name}
              </div>
              <div className="atlassian-text-caption atlassian-text-subtle" style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {champion.title}
              </div>
            </div>

            {/* タグ */}
            <div className="flex-shrink-0">
              <div className="flex atlassian-gap-4">
                {champion.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="atlassian-tag"
                    style={{
                      fontSize: '10px',
                      padding: 'var(--space-2) var(--space-4)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {champion.tags.length > 2 && (
                  <span className="atlassian-tag" style={{
                    fontSize: '10px',
                    padding: 'var(--space-2) var(--space-4)'
                  }}>
                    +{champion.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
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