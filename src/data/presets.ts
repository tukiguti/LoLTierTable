import type { ChampionRole, Lane } from '../types';

/**
 * ロール絞り込みの6種（要求定義§5.1 MUST）。
 * Riotのタグ文字列がそのまま表示ラベルとして使えるため、別途ラベル定義は持たない。
 */
export const CHAMPION_ROLES: ChampionRole[] = [
  'Fighter',
  'Tank',
  'Marksman',
  'Mage',
  'Assassin',
  'Support',
];

/**
 * レーンプリセットの5種（要求定義§5.1 MUST）。
 * 表示ラベルは値そのまま（TOP/JG/MID/ADC/SUP）なので別途ラベル定義は持たない。
 */
export const LANES: Lane[] = ['TOP', 'JG', 'MID', 'ADC', 'SUP'];

/**
 * レーン別プリセットのチャンピオンID一覧。
 * LoLTierTable-legacy/src/data/championPresets.ts の SAMPLE_LANE_PRESETS からそのまま流用。
 * name/icon/isCustom/createdAt/updatedAt 等の未使用フィールドは削り、IDリストだけ残した。
 * Ambessa・Mel・Aurora・Yunara等の新チャンピオンも含めて中身は流用元のまま。
 */
export const LANE_PRESETS: Record<Lane, readonly string[]> = {
  TOP: [
    'Aatrox', 'Ambessa', 'Camille', 'Chogath', 'Darius',
    'DrMundo', 'Fiora', 'Gangplank', 'Garen', 'Gnar',
    'Gragas', 'Gwen', 'Heimerdinger', 'Illaoi', 'Irelia',
    'Jax', 'Jayce', 'Kayle', 'Kled', 'KSante',
    'Malphite', 'Maokai', 'Mordekaiser', 'Nasus', 'Olaf',
    'Ornn', 'Pantheon', 'Poppy', 'Quinn', 'Renekton',
    'Riven', 'Rumble', 'Sett', 'Shen', 'Singed',
    'Sion', 'TahmKench', 'Trundle', 'Tryndamere', 'Udyr',
    'Urgot', 'Vayne', 'Vladimir', 'Volibear', 'Warwick',
    'Yone', 'Yorick',
  ],
  JG: [
    'Amumu', 'Belveth', 'Brand', 'Briar', 'Diana',
    'DrMundo', 'Ekko', 'Elise', 'Evelynn', 'Fiddlesticks',
    'Gragas', 'Graves', 'Gwen', 'Hecarim', 'Ivern',
    'JarvanIV', 'Jax', 'Karthus', 'Kayn', 'Khazix',
    'LeeSin', 'Lillia', 'MasterYi', 'MonkeyKing', 'Naafiri',
    'Nautilus', 'Nidalee', 'Nocturne', 'Nunu', 'Pantheon',
    'Qiyana', 'Rammus', 'RekSai', 'Rengar', 'Sejuani',
    'Shaco', 'Shyvana', 'Skarner', 'Sylas', 'Talon',
    'Trundle', 'Udyr', 'Viego', 'Vi', 'Volibear',
    'Warwick', 'XinZhao', 'Zac', 'Zed', 'Zyra',
  ],
  MID: [
    'Ahri', 'Akali', 'Akshan', 'Anivia', 'Annie',
    'AurelionSol', 'Aurora', 'Azir', 'Brand', 'Cassiopeia',
    'Diana', 'Ekko', 'Fizz', 'Galio', 'Heimerdinger',
    'Hwei', 'Irelia', 'Jayce', 'Kassadin', 'Katarina',
    'Leblanc', 'Lissandra', 'Lux', 'Malzahar', 'Mel',
    'Morgana', 'Naafiri', 'Neeko', 'Orianna', 'Pantheon',
    'Qiyana', 'Ryze', 'Swain', 'Sylas', 'Syndra',
    'Taliyah', 'Talon', 'TwistedFate', 'Veigar', 'Velkoz',
    'Vex', 'Viktor', 'Vladimir', 'Xerath', 'Yasuo',
    'Yone', 'Zed', 'Ziggs', 'Zoe',
  ],
  ADC: [
    'Aphelios', 'Ashe', 'Caitlyn', 'Corki', 'Draven',
    'Ezreal', 'Jhin', 'Jinx', 'Kaisa', 'Kalista',
    'KogMaw', 'Lucian', 'MissFortune', 'Nilah', 'Samira',
    'Senna', 'Seraphine', 'Sivir', 'Smolder', 'Swain',
    'Tristana', 'Twitch', 'Varus', 'Vayne', 'Xayah',
    'Yunara', 'Zeri', 'Ziggs',
  ],
  SUP: [
    'Alistar', 'Ashe', 'Bard', 'Blitzcrank', 'Brand',
    'Braum', 'Elise', 'Heimerdinger', 'Janna', 'Karma',
    'Leblanc', 'Leona', 'Lulu', 'Lux', 'Maokai',
    'Milio', 'Morgana', 'Nami', 'Nautilus', 'Neeko',
    'Poppy', 'Pyke', 'Rakan', 'Rell', 'Renata',
    'Senna', 'Seraphine', 'Sona', 'Soraka', 'Swain',
    'TahmKench', 'Taric', 'Thresh', 'Velkoz', 'Xerath',
    'Yuumi', 'Zilean', 'Zyra',
  ],
};
