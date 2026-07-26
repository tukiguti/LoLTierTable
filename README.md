# LoLTierTable

League of Legends のチャンピオンでティア表とマトリクス図を作れるWebツールです。左のチャンピオン一覧からドラッグして配置し、作った図はPNG画像として書き出せます。

公開先: tier.tukiguti.com（準備中）

## 2つのモード

- **ティアリスト** — S/A/B/C/D の段にチャンピオンを並べる。段のラベル・色・並び順は変更でき、段の追加と削除もできます
- **マトリクス** — 2軸のグリッド上にチャンピオンを自由配置する。軸のラベルは書き換えられます。既定は「操作難易度 × 現環境の強さ」

## セットアップ

```bash
npm install
npm run dev
```

チャンピオンの情報とアイコンは Riot Games の Data Dragon から**ビルド時に取得**します。`npm run dev` と `npm run build` の前に自動で走るため、個別の実行は不要です。取得したファイルはリポジトリに含めません。

取得するパッチのバージョンは設定ファイルに固定してあります。更新するときはその値を書き換えてコミットしてください。

## コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動（素材が無ければ先に取得） |
| `npm run build` | 本番ビルド（素材を取得してから `dist/` を生成） |
| `npm run preview` | ビルド結果をローカルで確認 |
| `npm run lint` | 静的解析 |

## 技術構成

React + TypeScript + Vite / Zustand / @dnd-kit / Tailwind CSS / html2canvas。ホスティングは Cloudflare Pages です。

## 旧バージョン

2025年に作った初版は別リポジトリに凍結してあります。本リポジトリは要求定義からやり直した作り直し版です。

## Riot Games の素材について

LoLTierTable was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
