import { ChampionIcon } from '../champion/ChampionIcon';
import { getTierColor } from '../../data/tierPalette';
import { buildChampionMap, clamp, EXPORT_MIDDLE_HEIGHT, EXPORT_MIDDLE_WIDTH } from './exportMetrics';
import { resolveColor } from './exportColors';
import type { Champion, Tier } from '../../types';

interface ExportTierListBoardProps {
  tiers: Tier[];
  champions: Champion[];
}

const ROW_GAP = 10;
/** デザイン仕様§10の既定値（96px|1fr・最小高84px・アイコン64px） */
const LABEL_COL_WIDTH = 96;
const DEFAULT_ROW_MIN_HEIGHT = 84;
const DEFAULT_ICON_SIZE = 64;
/** 段数が多いときに縮める下限。これ未満は視認性が崩れるためこれ以上は縮めない */
const MIN_ROW_HEIGHT = 40;
const MIN_ICON_SIZE = 26;
const ICON_GAP = 6;
const ROW_PADDING_X = 10;
const ROW_PADDING_Y = 8;

/**
 * 書き出し用ティアリストの中央（段の行一式、デザイン仕様§10）。
 *
 * 仕様は「各行flex:1で高さを均等配分・最小高84px・アイコン64px」だが、これは
 * 既定5段を前提にした値であり、段数を増やせる仕様（要求定義§5.2）と組み合わせると
 * 1200×900に収まらなくなる。段が多いときや1段のアイコンが多いときでも枠に収まる
 * よう、行の最低高さとアイコンサイズを段数から逆算して縮める（仕様に明記が無いため
 * 自己判断で実装。詳細は実装報告を参照）。
 */
export function ExportTierListBoard({ tiers, champions }: ExportTierListBoardProps) {
  const championMap = buildChampionMap(champions);
  const tierCount = Math.max(1, tiers.length);

  const totalGap = ROW_GAP * Math.max(0, tierCount - 1);
  const rowMinHeight = clamp(
    (EXPORT_MIDDLE_HEIGHT - totalGap) / tierCount,
    MIN_ROW_HEIGHT,
    DEFAULT_ROW_MIN_HEIGHT,
  );
  // アイコンは行の高さ(上下padding分を引く)に収まる大きさへ連動して縮める
  const iconSize = clamp(rowMinHeight - ROW_PADDING_Y * 2, MIN_ICON_SIZE, DEFAULT_ICON_SIZE);
  const labelFontSize = clamp(rowMinHeight * 0.42, 18, 36);

  return (
    <div
      style={{
        height: EXPORT_MIDDLE_HEIGHT,
        width: EXPORT_MIDDLE_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        gap: ROW_GAP,
        overflow: 'hidden',
      }}
    >
      {tiers.map((tier) => {
        const rawColor = getTierColor(tier.colorId);
        // getTierColor()はoklch()の生文字列を返す(src/data/tierPalette.ts)。
        // html2canvasが解釈できないため、htmlに載せる直前に解決する。
        const color = { background: resolveColor(rawColor.background), text: resolveColor(rawColor.text) };
        const championObjs = tier.championIds
          .map((id) => championMap.get(id))
          .filter((champion): champion is Champion => Boolean(champion));

        return (
          <div
            key={tier.id}
            style={{
              flex: 1,
              minHeight: rowMinHeight,
              display: 'grid',
              gridTemplateColumns: `${LABEL_COL_WIDTH}px 1fr`,
              background: 'var(--surface-export-row)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              className="font-display"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: color.background,
                color: color.text,
                fontSize: labelFontSize,
                fontWeight: 700,
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              {tier.label}
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'center',
                gap: ICON_GAP,
                padding: `${ROW_PADDING_Y}px ${ROW_PADDING_X}px`,
                overflow: 'hidden',
              }}
            >
              {championObjs.map((champion) => (
                <ChampionIcon key={champion.id} champion={champion} size={iconSize} radius={4} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
