import { pointerWithin, rectIntersection } from '@dnd-kit/core';
import type { CollisionDetection } from '@dnd-kit/core';

/**
 * ドラッグ&ドロップのid/data規約（チームリード指示）。
 *
 * サイドバー一覧のアイコン（ドラッグ元のみ・並べ替え対象ではない）は
 * 別担当が次の規約で実装する: `{ id: 'roster:'+championId, data: { type:'champion', championId, from:'roster' } }`
 * ここではその形に合わせて段・未分類側を実装する。
 */
export type ChampionDragData =
  | { type: 'champion'; championId: string; from: 'roster' }
  | { type: 'champion'; championId: string; from: 'tier'; tierId: string }
  | { type: 'champion'; championId: string; from: 'unclassified' };

/** 段の行そのものの並べ替え用ドラッグデータ（右レールの掴み手からのみ開始する） */
export interface TierRowDragData {
  type: 'tier-row';
  tierId: string;
}

/** ドロップ先（段のコンテナ・未分類のコンテナ）、または他のアイコン/行の上 */
export type DropData =
  | { type: 'tier'; tierId: string }
  | { type: 'unclassified' }
  | ChampionDragData
  | TierRowDragData;

/**
 * ドラッグ中の種類（champion / tier-row）ごとに衝突判定の対象を絞り込み、
 * 「本当にどこにも重なっていない」を検出できる方式で判定する。
 *
 * 段の行(tier-row)はドラッグの当たり判定(setNodeRef)を行全体
 * （アイコン欄を含む）に張っているため、絞り込まずに判定すると
 * 「段へのチャンピオン配置」用の droppable-tier:* と衝突してしまい、
 * 段の並べ替えとチャンピオンの配置が誤判定される。ドラッグ中の型に応じて
 * 候補のdroppableを絞ることで防ぐ。
 *
 * closestCorners/closestCenterは「最も近いdroppable」を常に返してしまうため
 * 「段の外へドロップ→未分類へ戻す」（デザイン仕様§12）の判定に使えない
 * （over が常に非nullになり、外に出したことを検出できない）。
 * pointerWithin→rectIntersectionの順に試し、どちらも当たりが無ければ
 * 空（over=null）を返す方式にする。
 */
export const tierListCollisionDetection: CollisionDetection = (args) => {
  const activeType = (args.active.data.current as { type?: string } | undefined)?.type;
  const containers = args.droppableContainers.filter((container) => {
    const containerType = (container.data.current as { type?: string } | undefined)?.type;
    if (activeType === 'tier-row') return containerType === 'tier-row';
    if (activeType === 'champion') {
      return (
        containerType === 'tier' || containerType === 'unclassified' || containerType === 'champion'
      );
    }
    return true;
  });
  const filteredArgs = { ...args, droppableContainers: containers };
  const pointerCollisions = pointerWithin(filteredArgs);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(filteredArgs);
};
