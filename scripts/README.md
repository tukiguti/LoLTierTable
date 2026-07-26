# scripts

## fetch-champion-assets.js

チャンピオン情報とアイコンを Riot Games の Data Dragon から取得し、`public/` 以下へ書き出します。取得物は**リポジトリに含めません**（`.gitignore` 済み）。

| 書き出し先 | 内容 |
|---|---|
| `public/data/champions.json` | Data Dragon の生形式のチャンピオン情報 |
| `public/data/manifest.json` | 取得したパッチ・ロケール・件数・取得日時 |
| `public/champions/{ChampionId}.png` | チャンピオンアイコン（128×128） |

### 実行

`npm run dev` と `npm run build` の前に自動で走ります（`predev` / `prebuild`）。個別に実行する場合は次のとおり。

```bash
npm run fetch-assets                              # 揃っているものは飛ばす
node scripts/fetch-champion-assets.js --force     # 全件を取り直す
```

同じパッチで全件揃っていれば何もせず終了します。一部が欠けている場合は**欠けている分だけ**取得します。パッチが変わったときはアイコンも作り直します。

### パッチの更新

取得するパッチはリポジトリ直下の `champion-assets.config.json` に固定してあります。

```json
{
  "version": "16.14.1",
  "locale": "ja_JP"
}
```

更新するときは、[versions.json](https://ddragon.leagueoflegends.com/api/versions.json) の先頭にある最新版を確認し、この値を書き換えてコミットしてください。

**最新を自動追従する実装にはしていません。** 勝手に新チャンピオンが増えるとレーンプリセットとの整合が崩れ、同じコミットでもビルド結果が日によって変わってしまうためです。新チャンピオンが追加されたパッチへ上げるときは、あわせて `src/data` のプリセット定義も見直してください。

### 失敗したとき

取得に失敗したチャンピオンを列挙して非ゼロ終了します。揃っている分は保持されるので、ネットワークを直して再実行すれば残りだけを取りに行きます。

Cloudflare Pages のビルド中に失敗した場合はビルドが失敗しますが、直前の成功したデプロイが配信され続けるため公開中のサイトは落ちません。
