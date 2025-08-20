// import type { Champion } from '../types/champion';

export interface ChampionPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  champions: string[]; // Champion IDs
  tags?: string[]; // Optional: filter by Riot tags
  isCustom: boolean; // true for user-created, false for default
  createdAt: string;
  updatedAt: string;
}

// デフォルトプリセット（Riotタグベース）
export const DEFAULT_PRESETS: ChampionPreset[] = [
  {
    id: 'fighters',
    name: 'ファイター',
    description: 'Fighter タグのチャンピオン',
    icon: '⚔️',
    champions: [],
    tags: ['Fighter'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tanks',
    name: 'タンク',
    description: 'Tank タグのチャンピオン',
    icon: '🛡️',
    champions: [],
    tags: ['Tank'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'marksmen',
    name: 'マークスマン',
    description: 'Marksman タグのチャンピオン',
    icon: '🏹',
    champions: [],
    tags: ['Marksman'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mages',
    name: 'メイジ',
    description: 'Mage タグのチャンピオン',
    icon: '🔮',
    champions: [],
    tags: ['Mage'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'assassins',
    name: 'アサシン',
    description: 'Assassin タグのチャンピオン',
    icon: '🗡️',
    champions: [],
    tags: ['Assassin'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'supports',
    name: 'サポート',
    description: 'Support タグのチャンピオン',
    icon: '💚',
    champions: [],
    tags: ['Support'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 実際のLoLレーンに基づくサンプルカスタムプリセット
export const SAMPLE_LANE_PRESETS: ChampionPreset[] = [
  {
    id: 'top-lane',
    name: 'トップレーン',
    description: '一般的なトップレーンチャンピオン',
    icon: '🔝',
    champions: [
      'Aatrox', 'Camille', 'Darius', 'Fiora', 'Garen', 
      'Irelia', 'Jax', 'Malphite', 'Ornn', 'Riven',
      'Sett', 'Teemo', 'Urgot', 'Yorick', 'Gnar'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'jungle',
    name: 'ジャングル',
    description: '一般的なジャングルチャンピオン',
    icon: '🌲',
    champions: [
      'Graves', 'Hecarim', 'Karthus', 'Kayn', 'Kindred',
      'LeeSin', 'Lillia', 'Nidalee', 'Rengar', 'Shyvana',
      'Udyr', 'Viego', 'Warwick', 'XinZhao', 'Zac'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mid-lane',
    name: 'ミッドレーン',
    description: '一般的なミッドレーンチャンピオン',
    icon: '🎯',
    champions: [
      'Ahri', 'Akali', 'Annie', 'Azir', 'Cassiopeia',
      'Fizz', 'Katarina', 'LeBlanc', 'Lux', 'Orianna',
      'Syndra', 'Talon', 'Yasuo', 'Yone', 'Zed'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'adc',
    name: 'ADC',
    description: 'ボットレーンADCチャンピオン',
    icon: '🏹',
    champions: [
      'Aphelios', 'Ashe', 'Caitlyn', 'Draven', 'Ezreal',
      'Jhin', 'Jinx', 'Kaisa', 'Kalista', 'Kogmaw',
      'Lucian', 'MissFortune', 'Samira', 'Tristana', 'Vayne'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'support',
    name: 'サポート',
    description: 'ボットレーンサポートチャンピオン',
    icon: '💚',
    champions: [
      'Bard', 'Blitzcrank', 'Braum', 'Leona', 'Lulu',
      'Nami', 'Nautilus', 'Pyke', 'Rakan', 'Senna',
      'Seraphine', 'Soraka', 'Thresh', 'Yuumi', 'Zyra'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];