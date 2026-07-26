/**
 * アプリ内で扱うチャンピオンの型。
 *
 * public/data/champions.json（Data Dragon生形式）を
 * src/services/championData.ts で変換して生成する。
 */

/** Riotのロールタグ（要求定義§5.1で列挙された6種） */
export type ChampionRole =
  | 'Fighter'
  | 'Tank'
  | 'Marksman'
  | 'Mage'
  | 'Assassin'
  | 'Support';

export interface Champion {
  /** Data Dragonのチャンピオン ID（例: "Aatrox", "Kaisa"）。検索・全ての参照に使う一意キー */
  id: string;
  /** 日本語表示名（ja_JPロケール） */
  name: string;
  /** 日本語の称号 */
  title: string;
  /**
   * 整形済みの英語名。IDをそのまま見せると "Kaisa" "Khazix" のように読みにくいため、
   * Kai'Sa / Kha'Zix / LeBlanc / Lee Sin 等に整形したもの（デザイン仕様§12末尾）。
   */
  enName: string;
  /** Riotのロールタグ（複数持ちうる） */
  roles: ChampionRole[];
  /** ローカルアイコンのパス。public/champions/{id}.png を指す */
  iconUrl: string;
  /**
   * ローカル画像が404だったときに切り替えるData Dragon CDN上のアイコンURL
   * （要求定義§6.1 SHOULD）
   */
  iconFallbackUrl: string;
}
