import { useState } from 'react';
import type { Champion } from '../../types';

interface ChampionIconProps {
  champion: Champion;
  /** 一辺の長さ(px)。サイドバーの一覧は枠に合わせるので省略できる */
  size?: number;
  /** 配置済みを薄く見せる（サイドバー一覧の dimPlaced 表現） */
  dimmed?: boolean;
  /** 下端に出す小さな帯の文言。サイドバー一覧の「配置済」表現に使う */
  badge?: string;
  /** 罫線の色。既定はタイルの罫線 */
  borderColor?: string;
  /** 角丸(px)。既定は小物の3px。モバイルの一覧は仕様§9で5px */
  radius?: number;
  /** バッジの文字サイズ(px)。既定は9px。モバイルの一覧は仕様§9で10px */
  badgeFontSize?: number;
  className?: string;
}

/**
 * チャンピオンのアイコン。サイドバー・段の中・未分類・マトリクスの駒で共通に使う。
 *
 * 画像はビルド時取得したローカルの `/champions/{id}.png` を指すが、取得漏れなどで
 * 404になったときは Data Dragon のCDNへ切り替える（要求定義§6.1 SHOULD）。
 * 画像そのものはドラッグ操作の邪魔になるため、ブラウザ既定のドラッグを禁止している。
 */
export function ChampionIcon({
  champion,
  size,
  dimmed = false,
  badge,
  borderColor = 'var(--border-tile)',
  radius,
  badgeFontSize = 9,
  className = '',
}: ChampionIconProps) {
  const [src, setSrc] = useState(champion.iconUrl);

  return (
    <div
      title={`${champion.name}（${champion.enName}）`}
      className={`relative overflow-hidden ${radius === undefined ? 'rounded-[var(--radius-small)]' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        aspectRatio: size ? undefined : '1',
        border: `1px solid ${borderColor}`,
        opacity: dimmed ? 0.32 : 1,
        background: 'var(--surface-button-secondary)',
      }}
    >
      <img
        src={src}
        alt={champion.name}
        loading="lazy"
        draggable={false}
        onError={() => {
          if (src !== champion.iconFallbackUrl) setSrc(champion.iconFallbackUrl);
        }}
        className="block h-full w-full object-cover"
        style={{ pointerEvents: 'none' }}
      />
      {badge && (
        <div
          className="font-mono-ui absolute inset-x-0 bottom-0 flex items-center justify-center"
          style={{
            height: 14,
            fontSize: badgeFontSize,
            background: 'var(--surface-badge-band)',
            color: 'var(--gold)',
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}
