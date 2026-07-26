import type { Champion, ChampionRole, DDragonChampionFile } from '../types';

const CHAMPIONS_JSON_PATH = '/data/champions.json';
const DDRAGON_ICON_BASE = 'https://ddragon.leagueoflegends.com/cdn';

/**
 * Data DragonのIDから読みやすい英語名を組み立てるための例外テーブル
 * （デザイン仕様§12末尾: Kaisa→Kai'Sa / Khazix→Kha'Zix / Leblanc→LeBlanc / LeeSin→Lee Sin）。
 */
const EN_NAME_OVERRIDES: Record<string, string> = {
  Kaisa: "Kai'Sa",
  Khazix: "Kha'Zix",
  Leblanc: 'LeBlanc',
  LeeSin: 'Lee Sin',
};

/**
 * チャンピオンIDから整形済みの英語名を作る。例外テーブルになければ、
 * キャメルケースの区切りにスペースを入れるだけの単純な変換にフォールバックする
 * （例: "AurelionSol" → "Aurelion Sol", "JarvanIV" は変換されず "JarvanIV" のまま）。
 */
function toEnglishDisplayName(id: string): string {
  const override = EN_NAME_OVERRIDES[id];
  if (override) return override;
  return id.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

/** ローカルアイコンのパス。public/champions/{id}.png を指す */
export function buildLocalIconUrl(championId: string): string {
  return `/champions/${championId}.png`;
}

/**
 * ローカル画像が404だったときに切り替えるData Dragon CDN上のアイコンURL
 * （要求定義§6.1 SHOULD）。
 */
export function buildFallbackIconUrl(championId: string, version: string): string {
  return `${DDRAGON_ICON_BASE}/${version}/img/champion/${championId}.png`;
}

/**
 * public/data/champions.json（Data Dragon生形式: {type, format, version, data:{ChampionId:{...}}}）を
 * 読み込み、アプリ内のChampion[]に変換する。
 *
 * このJSONはビルド時取得スクリプト（別担当実装中）が生成する前提で、
 * リポジトリには含まれない（.gitignore対象、要求定義§6.1）。
 * 取得に失敗した場合は例外を投げる。呼び出し側でエラー表示等を行うこと。
 */
export async function loadChampionRoster(): Promise<{ champions: Champion[]; version: string }> {
  const response = await fetch(CHAMPIONS_JSON_PATH);
  if (!response.ok) {
    throw new Error(`チャンピオンデータの取得に失敗しました: ${response.status} ${response.statusText}`);
  }

  const raw: DDragonChampionFile = await response.json();
  const version = raw.version;

  const champions: Champion[] = Object.values(raw.data)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      title: entry.title,
      enName: toEnglishDisplayName(entry.id),
      // Data Dragonのtagsは既定6ロールの部分集合であることを前提にする
      roles: entry.tags as ChampionRole[],
      iconUrl: buildLocalIconUrl(entry.id),
      iconFallbackUrl: buildFallbackIconUrl(entry.id, version),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return { champions, version };
}

/**
 * 検索語でチャンピオンを絞り込む。日本語名・英語ID・整形済み英語名のいずれかに
 * 部分一致すればヒットする（要求定義§5.1 MUST: 「アーリ」でも「Ahri」でも出る）。
 */
export function searchChampions(champions: Champion[], query: string): Champion[] {
  const trimmed = query.trim();
  if (!trimmed) return champions;

  const lowered = trimmed.toLowerCase();
  return champions.filter(
    (champion) =>
      champion.name.includes(trimmed) ||
      champion.id.toLowerCase().includes(lowered) ||
      champion.enName.toLowerCase().includes(lowered),
  );
}

/**
 * ロール絞り込み。選択中のロールが1つもなければ全件を返す。
 * 複数選択時はOR条件（選択したロールのいずれかに該当すれば表示）。
 */
export function filterChampionsByRoles(champions: Champion[], roles: ChampionRole[]): Champion[] {
  if (roles.length === 0) return champions;
  return champions.filter((champion) => champion.roles.some((role) => roles.includes(role)));
}
