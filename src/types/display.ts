/**
 * デザインが持つ表示切り替え（デザイン仕様§11）。
 * matrixGridSize は types/matrix.ts 側で持つのでここには含めない。
 */
export interface DisplaySettings {
  /** 初回ヒントの表示。閉じると false になる */
  showHints: boolean;
  /** サイドバー一覧で配置済みチャンピオンを薄く表示するか */
  dimPlaced: boolean;
}
