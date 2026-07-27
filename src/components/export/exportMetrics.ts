import type { Champion } from '../../types';

/**
 * PNG書き出し（デザイン仕様§10）の寸法定数とヘルパー。
 *
 * 書き出しは常に1200×900の固定サイズであり、画面のようにビューポート幅で
 * 変わることが無いため、余白・ヘッダー・フッターの高さをここで固定値として
 * 決め打ちし、中央（段の行 or マトリクス盤面）に配れる残り幅・高さを
 * 逆算できるようにしている。ExportFrame・ExportTierListBoard・
 * ExportMatrixBoard が同じ定数を参照することで、3者の数値が食い違わない。
 */

export const EXPORT_WIDTH = 1200;
export const EXPORT_HEIGHT = 900;

export const EXPORT_PADDING_TOP = 36;
export const EXPORT_PADDING_RIGHT = 40;
export const EXPORT_PADDING_BOTTOM = 26;
export const EXPORT_PADDING_LEFT = 40;

/** ExportFrame内の3ブロック（上部/中央/下部）の縦gap */
export const EXPORT_SECTION_GAP = 22;

/**
 * 上部ブロックの高さ。34pxのロゴ菱形＋タイトル2行スタックのうち高い方
 * （ロゴ行34px+gap2px+タイトル行約19px≈55px）が収まるよう余裕を持たせた値。
 * デザイン仕様に明記の無い決め打ちのため、変更する場合はこの定数だけ直せばよい。
 */
export const EXPORT_HEADER_HEIGHT = 60;

/**
 * 下部ブロックの高さ。Riot指定の免責文（英語約165文字）が1200px幅では
 * 11.5pxで2行に折り返ることを見込んだ値。
 */
export const EXPORT_FOOTER_HEIGHT = 56;

export const EXPORT_MIDDLE_WIDTH = EXPORT_WIDTH - EXPORT_PADDING_LEFT - EXPORT_PADDING_RIGHT;

export const EXPORT_MIDDLE_HEIGHT =
  EXPORT_HEIGHT -
  EXPORT_PADDING_TOP -
  EXPORT_PADDING_BOTTOM -
  EXPORT_HEADER_HEIGHT -
  EXPORT_FOOTER_HEIGHT -
  EXPORT_SECTION_GAP * 2;

/**
 * 書き出しのドメイン表記。デザイン仕様§12の決定により、実在しない
 * `loltiertable.gg`（原本デザインの値）ではなく実際の公開予定ドメインを使う。
 */
export const EXPORT_DOMAIN = 'tier.tukiguti.com';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** タイトル欄が長すぎるときに切り詰める最大文字数（安全策・仕様に明記なし） */
const TITLE_MAX_LENGTH = 50;

/**
 * タイトルの長さを制限する。
 *
 * 当初はCSSの `overflow: hidden` + `text-overflow: ellipsis` で見た目だけを
 * 切り詰めていたが、実機検証でこの組み合わせをflexネスト内の兄弟要素と
 * 併用するとhtml2canvasが同じ行内の句読点(ピリオド等)を描画から欠落させる
 * 不具合を確認した（例: "16.14.1"の「.」が全て消える）。overflowを外すだけでは
 * 長いタイトルがパッチ表記と重なりうるため、文字列そのものをJS側で切り詰める
 * 方式に変更した。
 */
export function truncateTitle(title: string): string {
  if (title.length <= TITLE_MAX_LENGTH) return title;
  return `${title.slice(0, TITLE_MAX_LENGTH)}…`;
}

/** championIds → Champion の解決をO(1)にするための参照マップ */
export function buildChampionMap(champions: Champion[]): Map<string, Champion> {
  return new Map(champions.map((champion) => [champion.id, champion]));
}
