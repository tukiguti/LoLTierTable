import type {
  AppMode,
  MatrixAxisLabelOffsets,
  MatrixAxisLabels,
  MatrixGridSize,
  MatrixPlacement,
  Tier,
} from '../types';

/**
 * URL共有(要求定義§5.4 SHOULD)のエンコード/デコード。
 *
 * 図の状態をURLの断片(#以降)に埋め込み、サーバーには何も保存しない方式(確定済み)。
 * #以降はサーバーに送られないため、公開構成(要求定義§6.2)側の追加設定は不要。
 * npmの新しい依存は追加せず、圧縮はブラウザ標準の CompressionStream を使う。
 *
 * 断片の形式: `d=<version>.<encoding><base64url>`
 * - version: 数字。このURL形式のバージョン(ストアのSTORAGE_VERSIONとは別採番。
 *   保存形式とURL形式は別々の理由で変わりうるため分けている)
 * - encoding: 'c' = CompressionStream('deflate-raw')で圧縮 / 'r' = 無圧縮
 *   (非対応ブラウザ向けフォールバック。読み込み側はどちらの断片にも対応する)
 * - base64url: 圧縮後 or 生のUTF-8 JSONバイト列をbase64url化したもの
 */

/**
 * 共有URLの形式バージョン。1→2でmatrixAxisLabelOffsets(軸ラベルの位置ずれ)を追加した。
 * 既に発行済みのバージョン1リンクを壊さないよう、デコード側はSUPPORTED_SHARE_FORMAT_VERSIONS
 * に載っている旧バージョンのタグも受け付ける(オフセットが無ければ0として補う)。
 */
export const SHARE_FORMAT_VERSION = 2;
const SUPPORTED_SHARE_FORMAT_VERSIONS = ['1', '2'];
export const SHARE_HASH_KEY = 'd';
/** これを超える場合は共有せず理由を伝える(要求。目安として8000文字) */
export const MAX_SHARE_URL_LENGTH = 8000;

/** 軸ラベル位置ずれの既定値(全て0)。バージョン1のリンクや壊れたデータの補完に使う */
function createZeroAxisLabelOffsets(): MatrixAxisLabelOffsets {
  const zero = { dx: 0, dy: 0 };
  return {
    xAxisLabel: { ...zero },
    yAxisLabel: { ...zero },
    xLeftLabel: { ...zero },
    xRightLabel: { ...zero },
    yTopLabel: { ...zero },
    yBottomLabel: { ...zero },
  };
}

/**
 * 共有する図の中身。検索語・ロール選択・表示設定は含めない(作業内容ではないため)。
 * id(段・配置ごとの一意識別子)は共有しない。並び順だけで十分でありURLを短くできる。
 * デコード側(toStoreDiagram)で新規に採番する。
 *
 * matrixAxisLabelOffsetsはoptional: バージョン1で発行された既存の共有URLには含まれないため。
 * 常に付けて出力する(buildSharedDiagramFromState参照)のは新規に作る側だけの話。
 */
export interface SharedDiagram {
  mode: AppMode;
  tiers: Array<{ label: string; colorId: string; championIds: string[] }>;
  unclassifiedChampionIds: string[];
  matrixPlacements: Array<{ championId: string; x: number; y: number }>;
  matrixAxisLabels: MatrixAxisLabels;
  matrixAxisLabelOffsets?: MatrixAxisLabelOffsets;
  matrixGridSize: MatrixGridSize;
}

/** ストアの loadDiagram にそのまま渡せる形(id付き) */
export interface StoreDiagram {
  mode: AppMode;
  tiers: Tier[];
  unclassifiedChampionIds: string[];
  matrixPlacements: MatrixPlacement[];
  matrixAxisLabels: MatrixAxisLabels;
  matrixAxisLabelOffsets: MatrixAxisLabelOffsets;
  matrixGridSize: MatrixGridSize;
}

// ----- base64url -----

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Bytes {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ----- 圧縮(ブラウザ標準API。非対応時はnullを返し、呼び出し側が無圧縮にフォールバックする) -----

/**
 * TypeScript 6 以降 Uint8Array は下地のバッファ型で型付けされる。
 * ストリームに渡す BufferSource は ArrayBuffer 由来である必要があるため、
 * ここで扱うバイト列は常に ArrayBuffer 由来として型を明示する。
 */
type Bytes = Uint8Array<ArrayBuffer>;

function concatUint8Arrays(chunks: Uint8Array[]): Bytes {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(new ArrayBuffer(total));
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function runTransformStream(
  bytes: Bytes,
  stream: CompressionStream | DecompressionStream,
): Promise<Bytes> {
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];

  const writeDone = writer.write(bytes).then(() => writer.close());
  const readDone = (async () => {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      if (value) chunks.push(value);
    }
  })();

  await Promise.all([writeDone, readDone]);
  return concatUint8Arrays(chunks);
}

async function compress(bytes: Bytes): Promise<Bytes | null> {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    return await runTransformStream(bytes, new CompressionStream('deflate-raw'));
  } catch {
    return null;
  }
}

async function decompress(bytes: Bytes): Promise<Bytes | null> {
  if (typeof DecompressionStream === 'undefined') return null;
  try {
    return await runTransformStream(bytes, new DecompressionStream('deflate-raw'));
  } catch {
    return null;
  }
}

// ----- エンコード -----

export type BuildShareUrlResult =
  | { ok: true; url: string; length: number; compressed: boolean }
  | { ok: false; reason: 'too-long'; length: number };

/** 図の状態から共有用の完全なURLを作る。クリップボード操作はしない(呼び出し側の責務) */
export async function buildShareUrl(diagram: SharedDiagram): Promise<BuildShareUrlResult> {
  const json = JSON.stringify(diagram);
  // TextEncoder は ArrayBufferLike 由来の型を返すため、ストリームに渡せる形に写す
  const utf8: Bytes = new Uint8Array(new TextEncoder().encode(json));
  const compressedBytes = await compress(utf8);
  const encoding: 'c' | 'r' = compressedBytes ? 'c' : 'r';
  const payload = compressedBytes ?? utf8;
  const base64 = toBase64Url(payload);
  const fragment = `${SHARE_HASH_KEY}=${SHARE_FORMAT_VERSION}.${encoding}${base64}`;
  const url = `${window.location.origin}${window.location.pathname}#${fragment}`;

  if (url.length > MAX_SHARE_URL_LENGTH) {
    return { ok: false, reason: 'too-long', length: url.length };
  }
  return { ok: true, url, length: url.length, compressed: encoding === 'c' };
}

// ----- デコード -----

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isValidTier(value: unknown): value is SharedDiagram['tiers'][number] {
  if (!value || typeof value !== 'object') return false;
  const tier = value as Record<string, unknown>;
  return (
    typeof tier.label === 'string' &&
    typeof tier.colorId === 'string' &&
    isStringArray(tier.championIds)
  );
}

function isValidPlacement(value: unknown): value is SharedDiagram['matrixPlacements'][number] {
  if (!value || typeof value !== 'object') return false;
  const placement = value as Record<string, unknown>;
  return (
    typeof placement.championId === 'string' &&
    typeof placement.x === 'number' &&
    Number.isFinite(placement.x) &&
    typeof placement.y === 'number' &&
    Number.isFinite(placement.y)
  );
}

function isValidAxisLabels(value: unknown): value is MatrixAxisLabels {
  if (!value || typeof value !== 'object') return false;
  const labels = value as Record<string, unknown>;
  return (
    typeof labels.xAxisLabel === 'string' &&
    typeof labels.yAxisLabel === 'string' &&
    typeof labels.xLeftLabel === 'string' &&
    typeof labels.xRightLabel === 'string' &&
    typeof labels.yTopLabel === 'string' &&
    typeof labels.yBottomLabel === 'string'
  );
}

const AXIS_LABEL_OFFSET_KEYS = [
  'xAxisLabel',
  'yAxisLabel',
  'xLeftLabel',
  'xRightLabel',
  'yTopLabel',
  'yBottomLabel',
] as const;

function isValidAxisLabelOffset(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const offset = value as Record<string, unknown>;
  return (
    typeof offset.dx === 'number' &&
    Number.isFinite(offset.dx) &&
    typeof offset.dy === 'number' &&
    Number.isFinite(offset.dy)
  );
}

/** バージョン1のリンクには存在しないフィールドなので、undefinedは有効として扱う(呼び出し側が0で補う) */
function isValidAxisLabelOffsets(value: unknown): value is MatrixAxisLabelOffsets {
  if (!value || typeof value !== 'object') return false;
  const offsets = value as Record<string, unknown>;
  return AXIS_LABEL_OFFSET_KEYS.every((key) => isValidAxisLabelOffset(offsets[key]));
}

/** 壊れたデータを部分的に復元しようとはしない。1箇所でも形が合わなければ全体を無効とする */
function isSharedDiagram(value: unknown): value is SharedDiagram {
  if (!value || typeof value !== 'object') return false;
  const diagram = value as Record<string, unknown>;
  return (
    (diagram.mode === 'tierlist' || diagram.mode === 'matrix') &&
    Array.isArray(diagram.tiers) &&
    diagram.tiers.every(isValidTier) &&
    isStringArray(diagram.unclassifiedChampionIds) &&
    Array.isArray(diagram.matrixPlacements) &&
    diagram.matrixPlacements.every(isValidPlacement) &&
    isValidAxisLabels(diagram.matrixAxisLabels) &&
    (diagram.matrixAxisLabelOffsets === undefined ||
      isValidAxisLabelOffsets(diagram.matrixAxisLabelOffsets)) &&
    (diagram.matrixGridSize === 4 || diagram.matrixGridSize === 6)
  );
}

/**
 * URLの断片(location.hash相当)から共有データを取り出す。
 * 壊れている・未知バージョン・非対応ブラウザ等、読めない場合は全て null を返す
 * (例外を投げない。呼び出し側はnullなら黙って無視し、通常起動する)。
 */
export async function decodeSharedDiagramFromHash(hash: string): Promise<SharedDiagram | null> {
  if (!hash) return null;
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;

  let value: string | null;
  try {
    value = new URLSearchParams(raw).get(SHARE_HASH_KEY);
  } catch {
    return null;
  }
  if (!value) return null;

  const dotIndex = value.indexOf('.');
  if (dotIndex === -1) return null;
  const version = value.slice(0, dotIndex);
  if (!SUPPORTED_SHARE_FORMAT_VERSIONS.includes(version)) return null; // 未知バージョンは黙って無視

  const rest = value.slice(dotIndex + 1);
  const encoding = rest[0];
  const base64 = rest.slice(1);
  if ((encoding !== 'c' && encoding !== 'r') || !base64) return null;

  let bytes: Bytes;
  try {
    bytes = fromBase64Url(base64);
  } catch {
    return null;
  }

  const payload = encoding === 'c' ? await decompress(bytes) : bytes;
  if (!payload) return null;

  try {
    const json = new TextDecoder('utf-8', { fatal: true }).decode(payload);
    const parsed: unknown = JSON.parse(json);
    return isSharedDiagram(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// ----- ストア連携 -----

/** 現在のストア状態から共有用の中身を作る(idや検索語・表示設定は含めない) */
export function buildSharedDiagramFromState(state: StoreDiagram): SharedDiagram {
  return {
    mode: state.mode,
    tiers: state.tiers.map(({ label, colorId, championIds }) => ({
      label,
      colorId,
      championIds,
    })),
    unclassifiedChampionIds: state.unclassifiedChampionIds,
    matrixPlacements: state.matrixPlacements.map(({ championId, x, y }) => ({
      championId,
      x,
      y,
    })),
    matrixAxisLabels: state.matrixAxisLabels,
    matrixAxisLabelOffsets: state.matrixAxisLabelOffsets,
    matrixGridSize: state.matrixGridSize,
  };
}

/** 共有データにidを新規採番し、ストアの loadDiagram にそのまま渡せる形にする。
 * matrixAxisLabelOffsetsが無い(バージョン1で発行されたリンク)場合は全て0として補う。 */
export function toStoreDiagram(diagram: SharedDiagram): StoreDiagram {
  return {
    mode: diagram.mode,
    tiers: diagram.tiers.map((tier) => ({ id: crypto.randomUUID(), ...tier })),
    unclassifiedChampionIds: diagram.unclassifiedChampionIds,
    matrixPlacements: diagram.matrixPlacements.map((placement) => ({
      id: crypto.randomUUID(),
      ...placement,
    })),
    matrixAxisLabels: diagram.matrixAxisLabels,
    matrixAxisLabelOffsets: diagram.matrixAxisLabelOffsets ?? createZeroAxisLabelOffsets(),
    matrixGridSize: diagram.matrixGridSize,
  };
}

/**
 * 保存済みの図にチャンピオンが1体でも配置されているか。
 * 共有リンクを開く前に上書き確認を出すかどうかの判定に使う(空なら確認不要)。
 */
export function hasAnyPlacement(state: {
  tiers: Tier[];
  unclassifiedChampionIds: string[];
  matrixPlacements: MatrixPlacement[];
}): boolean {
  return (
    state.unclassifiedChampionIds.length > 0 ||
    state.matrixPlacements.length > 0 ||
    state.tiers.some((tier) => tier.championIds.length > 0)
  );
}
