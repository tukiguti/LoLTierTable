export interface Champion {
  id: string;
  name: string;
  title: string;
  iconUrl: string;
  splashUrl: string;
  tags: string[];
}

export interface ChampionData {
  data: Record<string, {
    id: string;
    key: string;
    name: string;
    title: string;
    tags: string[];
    stats: Record<string, number>;
    image: {
      full: string;
      sprite: string;
      group: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };
  }>;
  type: string;
  version: string;
}