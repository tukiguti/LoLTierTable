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
    name: 'Fighter',
    description: '',
    icon: '⚔️',
    champions: [],
    tags: ['Fighter'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tanks',
    name: 'Tank',
    description: '',
    icon: '🛡️',
    champions: [],
    tags: ['Tank'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'marksmen',
    name: 'Marksman',
    description: '',
    icon: '🏹',
    champions: [],
    tags: ['Marksman'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mages',
    name: 'Mage',
    description: '',
    icon: '🔮',
    champions: [],
    tags: ['Mage'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'assassins',
    name: 'Assassin',
    description: '',
    icon: '🗡️',
    champions: [],
    tags: ['Assassin'],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'supports',
    name: 'Support',
    description: '',
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
    name: 'TOP',
    description: '',
    icon: '🔝',
    champions: [
      'Ambessa', 'Camille', 'Chogath', 'Darius', 'DrMundo',
      'Fiora', 'Gangplank', 'Garen', 'Gnar', 'Gragas',
      'Gwen', 'Illaoi', 'Jax', 'Jayce', 'Kayle',
      'Kled', 'KSante', 'Malphite', 'Maokai', 'Mordekaiser',
      'Nasus', 'Olaf', 'Ornn', 'Pantheon', 'Poppy',
      'Renekton', 'Riven', 'Rumble', 'Sett', 'Shen',
      'Singed', 'Sion', 'TahmKench', 'Trundle', 'Tryndamere',
      'Udyr', 'Urgot', 'Vayne', 'Volibear', 'Warwick',
      'Yone', 'Yorick'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'jungle',
    name: 'JG',
    description: '',
    icon: '🌲',
    champions: [
      'Amumu', 'Belveth', 'Brand', 'Briar', 'Diana',
      'DrMundo', 'Ekko', 'Elise', 'Evelynn', 'Fiddlesticks',
      'Gragas', 'Graves', 'Gwen', 'Hecarim', 'Ivern',
      'JarvanIV', 'Jax', 'Karthus', 'Kayn', 'Khazix',
      'LeeSin', 'Lillia', 'MasterYi', 'MonkeyKing', 'Naafiri',
      'Nidalee', 'Nocturne', 'Pantheon', 'Rammus', 'RekSai',
      'Rengar', 'Shaco', 'Shyvana', 'Skarner', 'Talon',
      'Trundle', 'Udyr', 'Viego', 'Vi', 'Volibear',
      'Warwick', 'Zac', 'Zed'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mid-lane',
    name: 'MID',
    description: '',
    icon: '🎯',
    champions: [
      'Ahri', 'Anivia', 'Annie', 'AurelionSol', 'Aurora',
      'Azir', 'Brand', 'Cassiopeia', 'Chogath', 'Diana',
      'Ekko', 'Galio', 'Heimerdinger', 'Hwei', 'Irelia',
      'Jayce', 'Kassadin', 'Katarina', 'Leblanc', 'Lissandra',
      'Lux', 'Malzahar', 'Mel', 'Morgana', 'Naafiri',
      'Orianna', 'Qiyana', 'Ryze', 'Swain', 'Sylas',
      'Syndra', 'Taliyah', 'TwistedFate', 'Veigar', 'Velkoz',
      'Vex', 'Viktor', 'Vladimir', 'Xerath', 'Yasuo',
      'Yone', 'Zed', 'Ziggs', 'Zoe'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'adc',
    name: 'ADC',
    description: '',
    icon: '🏹',
    champions: [
      'Aphelios', 'Ashe', 'Caitlyn', 'Corki', 'Draven',
      'Ezreal', 'Jhin', 'Jinx', 'Kaisa', 'Kalista',
      'KogMaw', 'Lucian', 'MissFortune', 'Samira', 'Senna',
      'Sivir', 'Smolder', 'Tristana', 'Twitch', 'Varus',
      'Vayne', 'Xayah', 'Yunara', 'Zeri', 'Ziggs'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'support',
    name: 'SUP',
    description: '',
    icon: '💚',
    champions: [
      'Alistar', 'Ashe', 'Bard', 'Blitzcrank', 'Brand',
      'Braum', 'Elise', 'Heimerdinger', 'Janna', 'Karma',
      'Leona', 'Lulu', 'Maokai', 'Milio', 'Morgana',
      'Nami', 'Nautilus', 'Neeko', 'Poppy', 'Pyke',
      'Rakan', 'Rell', 'Renata', 'Senna', 'Seraphine',
      'Sona', 'Soraka', 'Swain', 'TahmKench', 'Taric',
      'Thresh', 'Velkoz', 'Xerath', 'Yuumi', 'Zilean', 'Zyra'
    ],
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // ここに新しいカスタムプリセットを追加できます
  // 例:
  // {
  //   id: 'my-custom-preset',
  //   name: 'マイプリセット',
  //   description: '自分だけのチャンピオン選択',
  //   icon: '⭐',
  //   champions: ['Ahri', 'Yasuo', 'Jinx'], // 使用したいチャンピオンのIDリスト
  //   isCustom: true,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  // },
];