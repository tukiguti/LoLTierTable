/**
 * Riot Data Dragon の生データ形式。
 *
 * public/data/champions.json の実際の構造（{type, format, version, data:{ChampionId:{...}}}）。
 * 使わないフィールド（stats, info, partype, blurb等）も実データには含まれるが、
 * このアプリで使うものだけ型に起こす。余剰フィールドは無視される。
 */
export interface DDragonChampionEntry {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface DDragonChampionFile {
  type: string;
  format: string;
  /** パッチバージョン。例: "15.14.1"。フッターのパッチ表記とアイコンのフォールバックURLに使う */
  version: string;
  data: Record<string, DDragonChampionEntry>;
}
