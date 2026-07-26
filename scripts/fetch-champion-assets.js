#!/usr/bin/env node
/**
 * チャンピオン情報とアイコンを Riot Games の Data Dragon から取得する。
 *
 * 取得物はリポジトリに含めない（.gitignore 済み）。npm の predev / prebuild フックから
 * 自動実行されるため、開発者もCloudflare Pagesのビルドも個別実行を意識しなくてよい。
 *
 * 取得するパッチは champion-assets.config.json の固定値に従う。最新を自動追従しないのは、
 * 勝手に新チャンピオンが増えるとレーンプリセットとの整合が崩れ、同じコミットでもビルド結果が
 * 日によって変わってしまうため。更新は設定ファイルを書き換えてコミットする運用。
 *
 * 使い方:
 *   node scripts/fetch-champion-assets.js           取得（揃っているものは飛ばす）
 *   node scripts/fetch-champion-assets.js --force   全件を取り直す
 */

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(ROOT, 'champion-assets.config.json');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const ICON_DIR = path.join(ROOT, 'public', 'champions');
const CHAMPIONS_PATH = path.join(DATA_DIR, 'champions.json');
const MANIFEST_PATH = path.join(DATA_DIR, 'manifest.json');

/** Data Dragon に一度に投げる本数。172枚を一斉に叩かないための上限 */
const CONCURRENCY = 8;
/** 1ファイルあたりの試行回数 */
const ATTEMPTS = 3;
/** 進捗を出す間隔（件数） */
const PROGRESS_STEP = 40;

const force = process.argv.includes('--force');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

/** ファイルが存在し、中身が空でないか */
async function hasContent(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

/** 失敗しても数回粘ってから諦める取得 */
async function fetchBuffer(url) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) await sleep(300 * attempt);
    }
  }
  throw lastError;
}

/** items を CONCURRENCY 本のワーカーで流す。失敗は投げずに集めて返す */
async function runPool(items, worker) {
  const failures = [];
  let cursor = 0;
  let done = 0;

  const runOne = async () => {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      try {
        await worker(item);
      } catch (error) {
        failures.push({ item, message: error.message });
      }
      done += 1;
      if (done % PROGRESS_STEP === 0 || done === items.length) {
        console.log(`  ${done}/${items.length} 件`);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, runOne));
  return failures;
}

async function main() {
  const started = Date.now();

  let config;
  try {
    config = await readJson(CONFIG_PATH);
  } catch (error) {
    console.error(`設定ファイルを読めません: ${CONFIG_PATH}`);
    console.error(error.message);
    process.exit(1);
  }

  const { version, locale } = config;
  if (!version || !locale) {
    console.error('champion-assets.config.json に version と locale の両方が必要です。');
    process.exit(1);
  }

  const base = `https://ddragon.leagueoflegends.com/cdn/${version}`;

  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(ICON_DIR, { recursive: true });

  // 前回と同じパッチなら champions.json を取り直さない
  const manifest = (await hasContent(MANIFEST_PATH)) ? await readJson(MANIFEST_PATH).catch(() => null) : null;
  const samePatch = !force && manifest?.version === version && manifest?.locale === locale;

  let championsRaw;
  if (samePatch && (await hasContent(CHAMPIONS_PATH))) {
    championsRaw = await readJson(CHAMPIONS_PATH);
  } else {
    console.log(`チャンピオン情報を取得します (パッチ ${version} / ${locale})`);
    try {
      const buffer = await fetchBuffer(`${base}/data/${locale}/champion.json`);
      championsRaw = JSON.parse(buffer.toString('utf8'));
      await writeFile(CHAMPIONS_PATH, buffer);
    } catch (error) {
      console.error(`チャンピオン情報の取得に失敗しました: ${error.message}`);
      console.error(`パッチ ${version} が存在するか確認してください（一覧: https://ddragon.leagueoflegends.com/api/versions.json）`);
      process.exit(1);
    }
  }

  const ids = Object.keys(championsRaw?.data ?? {});
  if (ids.length === 0) {
    console.error('チャンピオン情報を解釈できませんでした（data が空です）。');
    process.exit(1);
  }

  // パッチが変わったときはアイコンも作り直す。同じパッチなら欠けている分だけ取る
  const missing = [];
  for (const id of ids) {
    if (force || !samePatch || !(await hasContent(path.join(ICON_DIR, `${id}.png`)))) {
      missing.push(id);
    }
  }

  if (missing.length === 0) {
    console.log(`素材は取得済みです (パッチ ${version} / ${ids.length}件)`);
    return;
  }

  console.log(`アイコンを取得します (${missing.length}/${ids.length}件・同時${CONCURRENCY}本)`);
  const failures = await runPool(missing, async (id) => {
    const buffer = await fetchBuffer(`${base}/img/champion/${id}.png`);
    if (buffer.length === 0) throw new Error('空のレスポンス');
    await writeFile(path.join(ICON_DIR, `${id}.png`), buffer);
  });

  if (failures.length > 0) {
    console.error(`\n${failures.length}件のアイコンを取得できませんでした:`);
    for (const failure of failures) {
      console.error(`  ${failure.item}: ${failure.message}`);
    }
    console.error('\nネットワークを確認して再実行してください。揃っている分は再取得されません。');
    process.exit(1);
  }

  let totalBytes = 0;
  for (const id of ids) {
    totalBytes += (await stat(path.join(ICON_DIR, `${id}.png`))).size;
  }

  await writeFile(
    MANIFEST_PATH,
    `${JSON.stringify(
      {
        version,
        locale,
        championCount: ids.length,
        fetchedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const megabytes = (totalBytes / 1024 / 1024).toFixed(1);
  console.log(`完了: パッチ ${version} / ${ids.length}件 / アイコン計 ${megabytes}MB / ${seconds}秒`);
}

main().catch((error) => {
  console.error(`想定外のエラーで中断しました: ${error.message}`);
  process.exit(1);
});
