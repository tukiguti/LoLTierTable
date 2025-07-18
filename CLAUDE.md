# LoL Tier Table - Project Guide

## Overview
League of Legendsのチャンピオンアイコンを使用したマトリクス図とティアリスト作成アプリケーションです。ユーザーはドラッグ&ドロップ操作でチャンピオンを配置し、視覚的なランキングや比較図を作成できます。

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS + CSS Modules
- **Drag & Drop**: @dnd-kit/core
- **Data Source**: Riot Games Data Dragon API
- **Build Tool**: Vite
- **Data Persistence**: LocalStorage + IndexedDB

## Project Structure
```
src/
├── components/         # UIコンポーネント
│   ├── App.tsx
│   ├── ChampionPanel/
│   ├── TierList/
│   ├── Matrix/
│   └── DiagramManager/
├── hooks/             # カスタムフック
├── types/             # TypeScript型定義
├── utils/             # ユーティリティ関数
├── store/             # Zustand状態管理
└── services/          # API通信など
```

## Key Features
1. **ティアリストモード**: チャンピオンをS,A,B,C,Dなどのティアに分類
2. **マトリクスモード**: 2軸でチャンピオンを配置して比較
3. **データ管理**: 図表の保存・読み込み・削除
4. **共有機能**: 画像エクスポートとURLリンク共有
5. **レスポンシブ対応**: デスクトップ・タブレット・モバイル対応

## API Endpoints
```typescript
// チャンピオン一覧
const CHAMPIONS_URL = 'https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ja_JP/champion.json';

// チャンピオンアイコン
const ICON_URL = 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/{championId}.png';

// スプラッシュアート
const SPLASH_URL = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{championId}_0.jpg';
```

## Development Commands
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# テスト実行
npm run test

# リント
npm run lint

# 型チェック
npm run typecheck
```

## Key Interfaces
```typescript
interface Champion {
  id: string;
  name: string;
  title: string;
  iconUrl: string;
  splashUrl: string;
  tags: string[];
}

interface Tier {
  id: string;
  label: string;
  color: string;
  champions: Champion[];
  order: number;
}

interface PlacedChampion {
  champion: Champion;
  x: number;
  y: number;
}

interface SavedDiagram {
  id: string;
  name: string;
  type: 'tierlist' | 'matrix';
  data: TierListData | MatrixData;
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Progress
実装タスクは`.kiro/specs/lol-matrix-tierlist-app/tasks.md`を参照してください。

## Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Visual Regression**: Chromatic (Storybook)

## Error Handling
1. **ネットワークエラー**: Data Dragon API接続失敗時はキャッシュデータを使用
2. **ストレージエラー**: 容量不足時は古いデータの削除を提案
3. **バリデーションエラー**: ユーザーフレンドリーなエラーメッセージ表示

## Performance Considerations
- チャンピオンアイコンの遅延読み込み
- 大量データ表示時の仮想化
- React.memoによる不要な再レンダリング防止
- 検索フィルターのデバウンス処理

## Accessibility
- キーボードナビゲーション対応
- スクリーンリーダー対応（ARIA）
- 色覚サポート
- 適切なフォーカス管理

## Project Status
✅ **Completed Implementation:**
1. React + TypeScript + Vite プロジェクト初期化
2. 基本的なディレクトリ構造とTypeScript型定義
3. Data Dragon API クライアント実装
4. Zustand状態管理セットアップ
5. ChampionPanel コンポーネント（検索・フィルタリング機能付き）
6. @dnd-kit を使用したドラッグ&ドロップ機能
7. TierList コンポーネント（S,A,B,C,Dティア対応）
8. Matrix コンポーネント（2軸グリッド配置）
9. ローカルストレージでのデータ永続化
10. レスポンシブレイアウト

## Current Status
🚀 **プロジェクトは正常に動作しています！**

開発サーバー: `npm run dev` (http://localhost:5173/)
ビルド: `npm run build`

## Next Steps for Enhancement
1. Tailwind CSS の再統合（適切なPostCSS設定で）
2. 画像エクスポート機能（html2canvas使用）
3. 共有リンク機能
4. ユニットテストの追加
5. E2Eテストの実装
6. パフォーマンス最適化
7. アクセシビリティ改善