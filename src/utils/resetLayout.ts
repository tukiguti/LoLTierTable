// レイアウトのローカルストレージをリセットするユーティリティ

export const resetLayoutStorage = () => {
  // リサイザーの設定をクリア
  localStorage.removeItem('leftPaneWidth');
  localStorage.removeItem('bottomPaneHeight');
  localStorage.removeItem('bottomPaneHeight_v2'); // 2ペインレイアウト用
  localStorage.removeItem('middlePaneHeight'); // 3段レイアウト用（一時設置エリア）
  localStorage.removeItem('bottomPaneHeight_stack'); // 3段レイアウト用（チャンピオン選択）
  
};

// 開発用：ページロード時に一度だけリセット（初回のみ）
export const resetLayoutOnce = () => {
  const hasReset = localStorage.getItem('layoutHasBeenReset_v5');
  if (!hasReset) {
    resetLayoutStorage();
    localStorage.setItem('layoutHasBeenReset_v5', 'true');
    // 古いフラグを削除
    localStorage.removeItem('layoutHasBeenReset');
    localStorage.removeItem('layoutHasBeenReset_v2');
    localStorage.removeItem('layoutHasBeenReset_v3');
    localStorage.removeItem('layoutHasBeenReset_v4');
  }
};