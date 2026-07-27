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
 * 既定値: X = 操作難易度（簡単→難しい）、Y = 現環境の強さ（下が弱い・上が強い）
 */
export interface MatrixAxisLabels {
  xAxisLabel: string;
  yAxisLabel: string;
  xLeftLabel: string;
  xRightLabel: string;
  yTopLabel: string;
  yBottomLabel: string;
}
