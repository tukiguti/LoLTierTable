/**
 * 段の既定パレット色。デザイン仕様§2の5色のいずれかを指す。
 * 自由な色指定は不要（要求定義§5.2）なので、パレット内のidを段が参照する形にする。
 */
export interface TierColor {
  id: string;
  /** 段の地の色（oklch表記） */
  background: string;
  /** 段の文字色（oklch表記） */
  text: string;
}

export interface Tier {
  id: string;
  /** 段のラベル。既定は S/A/B/C/D だが編集可能 */
  label: string;
  /** TierColor.id への参照 */
  colorId: string;
  /** 所属するチャンピオンID。配列の順序がそのまま段内の並び順 */
  championIds: string[];
}
