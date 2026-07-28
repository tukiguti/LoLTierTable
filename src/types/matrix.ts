/** マトリクスのグリッドサイズ（要求定義§5.3 SHOULD・デザイン仕様§12で4×4/6×6に決定） */
export type MatrixGridSize = 4 | 6;

/**
 * マトリクス盤面上のチャンピオンの配置。
 * x, y は盤面の左上を原点(0,0)としたパーセント座標（0〜100）。
 * x: 0=左端 / 100=右端、y: 0=上端 / 100=下端。
 *
 * id は配置ごとに一意（crypto.randomUUID()、tiers の id と同じ流儀）。
 * 同じチャンピオンを盤面の複数箇所に置けるため、championId だけでは
 * どの駒かを特定できない（ドラッグ中の移動・削除の対象特定に必須）。
 */
export interface MatrixPlacement {
  id: string;
  championId: string;
  x: number;
  y: number;
}

/**
 * 軸ラベル一式。軸名2つ（xAxisLabel/yAxisLabel）と両端4つ（デザイン仕様§7）。
 * 既定値は編集前提の汎用文言（ラベル1/ラベル2、低い/高い）。ユーザーが実際の軸の意味に書き換えて使う。
 */
export interface MatrixAxisLabels {
  xAxisLabel: string;
  yAxisLabel: string;
  xLeftLabel: string;
  xRightLabel: string;
  yTopLabel: string;
  yBottomLabel: string;
}

/**
 * 軸ラベル1個ぶんの、既定位置からのずれ。
 * 盤面（正方形部分）の一辺のピクセルサイズに対する比率で持つ（ピクセル固定だと
 * デスクトップ・モバイル・PNG書き出し(盤面602px固定)で見た目の位置がずれるため）。
 * dx: 正が右方向 / dy: 正が下方向。0がドラッグ前の既定位置と同じ見た目。
 */
export interface MatrixAxisLabelOffset {
  dx: number;
  dy: number;
}

/** MatrixAxisLabels と同じ6キーぶんの位置ずれ */
export type MatrixAxisLabelOffsets = Record<keyof MatrixAxisLabels, MatrixAxisLabelOffset>;
