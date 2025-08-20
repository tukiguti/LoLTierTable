/**
 * Application-wide constants
 */

// Grid and Matrix settings
export const GRID_CONFIG = {
  MIN_SIZE: 5,
  MAX_SIZE: 19,
  DEFAULT_WIDTH: 11,
  DEFAULT_HEIGHT: 11,
  MIN_ZONE_SIZE: 0,
  MAX_ZONE_SIZE: 4, // For scatter mode zones (0-4)
} as const;

// Default tier colors and labels
export const TIER_CONFIG = {
  DEFAULT_COLORS: {
    S: '#ff6b6b',
    A: '#4ecdc4', 
    B: '#45b7d1',
    C: '#f9ca24',
    D: '#f0932b',
    DEFAULT: '#95a5a6',
  },
  DEFAULT_LABELS: ['S', 'A', 'B', 'C', 'D'],
} as const;

// Matrix axis labels
export const MATRIX_LABELS = {
  DEFAULT_X_AXIS: 'X軸',
  DEFAULT_Y_AXIS: 'Y軸',
  DEFAULT_TOP: '上',
  DEFAULT_BOTTOM: '下',
  DEFAULT_LEFT: '左',
  DEFAULT_RIGHT: '右',
  DEFAULT_QUADRANTS: {
    TOP_LEFT: '第2象限',
    TOP_RIGHT: '第1象限',
    BOTTOM_LEFT: '第3象限',
    BOTTOM_RIGHT: '第4象限',
  },
  DEFAULT_ZONES: {
    TOP_LEFT: 'ゾーン2',
    TOP_RIGHT: 'ゾーン1', 
    BOTTOM_LEFT: 'ゾーン3',
    BOTTOM_RIGHT: 'ゾーン4',
  },
} as const;

// Champion icon and display settings
export const CHAMPION_CONFIG = {
  ICON_SIZES: {
    SMALL: 32,
    MEDIUM: 40,
    LARGE: 64,
    EXTRA_LARGE: 96,
  },
  MAX_DISPLAY_COUNT: 56, // Maximum champions shown at once
  GRID_COLUMNS: 8, // Default grid columns for champion display
} as const;

// Layout and UI constants
export const LAYOUT_CONFIG = {
  STORAGE_KEYS: {
    LEFT_PANE_WIDTH: 'leftPaneWidth',
    BOTTOM_PANE_HEIGHT: 'bottomPaneHeight',
    BOTTOM_PANE_HEIGHT_V2: 'bottomPaneHeight_v2',
    MIDDLE_PANE_HEIGHT: 'middlePaneHeight',
    BOTTOM_PANE_HEIGHT_STACK: 'bottomPaneHeight_stack',
    LAYOUT_RESET_FLAG: 'layoutHasBeenReset_v5',
  },
  DEFAULT_HEIGHTS: {
    WORK_AREA: '70%',
    CHAMPION_PANEL: '30%',
    STAGING_AREA: 150, // pixels
    BOTTOM_PANE: 500, // pixels
  },
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 768,
    DESKTOP: 1024,
  },
} as const;

// Animation and transition constants
export const ANIMATION_CONFIG = {
  DURATIONS: {
    SHORT: 150,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN_OUT: 'cubic-bezier(0.42, 0, 0.58, 1)',
  },
} as const;

// API and data constants
export const API_CONFIG = {
  DATA_DRAGON_VERSION: '13.24.1',
  LANGUAGE: 'ja_JP',
  ENDPOINTS: {
    CHAMPIONS: `https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ja_JP/champion.json`,
    CHAMPION_ICON: (championId: string) => 
      `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${championId}.png`,
    LOCAL_CHAMPION_ICON: (championId: string) => 
      `/champions/${championId}.png`,
    LOCAL_DATA_MANIFEST: '/data/manifest.json',
  },
} as const;

// Drag and drop constants (moved from dragHandlers.ts)
export const DRAG_DROP_CONFIG = {
  ID_PREFIXES: {
    STAGING: 'staging-',
    TIER: '__',
    GRID: 'grid-',
    MATRIX: 'matrix-',
    CENTER: 'center-',
    TOP_LEFT: 'topLeft-',
    TOP_RIGHT: 'topRight-',
    BOTTOM_LEFT: 'bottomLeft-',
    BOTTOM_RIGHT: 'bottomRight-',
  },
  DROP_ZONES: {
    TRASH: 'trash',
    TEMP_STAGING: 'temp-staging',
    FREEBOARD_GRID: 'freeboard-grid',
    ZONE_FREEBOARD: 'zone-',
  },
} as const;

// Color themes
export const THEME_CONFIG = {
  ATLASSIAN_COLORS: {
    PRIMARY: '#0052CC',
    SUCCESS: '#00875A', 
    WARNING: '#FF991F',
    DANGER: '#DE350B',
    NEUTRAL: {
      0: '#FFFFFF',
      100: '#F4F5F7',
      200: '#EBECF0',
      300: '#DFE1E6',
      400: '#B3BAC5',
      500: '#8993A4',
      600: '#6B778C',
      700: '#505F79',
      800: '#42526E',
      900: '#253858',
    },
  },
  SPACING: {
    XS: '2px',
    SM: '4px', 
    MD: '8px',
    LG: '16px',
    XL: '24px',
    XXL: '32px',
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  CHAMPION_NOT_FOUND: 'チャンピオンが見つかりません',
  INVALID_COORDINATES: '無効な座標です',
  GRID_SIZE_INVALID: 'グリッドサイズが無効です',
  TIER_NOT_FOUND: 'ティアが見つかりません',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  DATA_LOAD_ERROR: 'データの読み込みに失敗しました',
  STORAGE_ERROR: 'ストレージへの保存に失敗しました',
} as const;