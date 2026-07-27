/**
 * html2canvas 1.4.1 は CSS Color 4 の `oklch()` を解釈できず、そのまま撮影すると
 * "Attempting to parse an unsupported color function oklch" で失敗する（実機検証で確認）。
 * このアプリのデザイントークン（src/styles/tokens.css）は全て oklch 表記であり、
 * トークン側は仕様上変更できない（編集禁止）ため、書き出しサブツリーだけ
 * html2canvasが解釈できる表現（rgba()）に変換して使う。
 *
 * 変換は1×1canvasにfillRectで塗ってgetImageDataで生ピクセルを読み戻す方式。
 * 当初はcanvasのfillStyleを代入してから読み戻す方式を試したが、実機検証で
 * このChromeバージョン(149)はfillStyleのgetterがoklch()をそのまま保持して
 * 返す（rgbへ正規化しない）ことが判明し、html2canvas側で失敗し続けた。
 * getImageDataはcanvasの実際のラスタライズ結果（既定でsRGB・8bit/chの生の
 * ピクセル値）を読むため、fillStyleの文字列表現に依存せず必ずrgbaへ変換できる。
 */

const resolvedCache = new Map<string, string>();
let sharedCtx: CanvasRenderingContext2D | null | undefined;

function getCtx(): CanvasRenderingContext2D | null {
  if (sharedCtx === undefined) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    sharedCtx = canvas.getContext('2d', { willReadFrequently: true });
  }
  return sharedCtx;
}

/** 任意のCSS色文字列(oklch()等)をhtml2canvas互換のrgba()文字列に変換する */
export function resolveColor(color: string): string {
  const cached = resolvedCache.get(color);
  if (cached) return cached;
  const ctx = getCtx();
  if (!ctx) return color;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  const resolved = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  resolvedCache.set(color, resolved);
  return resolved;
}

/** :root で定義された生のトークン値（未解決のoklch文字列）を読む */
function readTokenRaw(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function resolveToken(name: string): string {
  return resolveColor(readTokenRaw(name));
}

/**
 * :root で定義されている全カスタムプロパティ名のうち、値が oklch() で始まる
 * （＝色トークンである）ものだけを実際のスタイルシートから動的に検出する。
 *
 * 当初は使うトークン名を手で列挙していたが、html2canvasは撮影対象の要素だけでなく
 * `element.ownerDocument.documentElement`（文書全体）を丸ごとクローンして
 * スタイルを解析するため、画面に今映っている実アプリのUI（ヘッダー・サイドバー・
 * 段の行など）も含めて「その瞬間ページ上にあるoklch色を使う全要素」を解決できて
 * いないと失敗する（実機検証で確認）。手動列挙では列挙漏れが起きるため、
 * tokens.cssの`:root`規則をCSSOM経由でそのまま読み、動的に全件を対象にする。
 */
function discoverRootColorTokenNames(): string[] {
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | undefined;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // クロスオリジンのスタイルシートは読めないためスキップ
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
        for (let i = 0; i < rule.style.length; i++) {
          const propName = rule.style[i];
          if (propName.startsWith('--')) names.add(propName);
        }
      }
    }
  }
  return Array.from(names).filter((name) => readTokenRaw(name).startsWith('oklch('));
}

/**
 * デザイントークンをhtml2canvas互換の値へ一括変換した上書き一式を作る。
 * tokens.css自体は変更しない。
 */
export function buildExportTokenOverrides(): Record<string, string> {
  const overrides: Record<string, string> = {};
  for (const name of discoverRootColorTokenNames()) {
    overrides[name] = resolveToken(name);
  }
  return overrides;
}

/**
 * 撮影の直前だけ `document.documentElement.style` へ全色トークンの上書きを一時的に載せ、
 * 撮影後（成功・失敗いずれでも）必ず元に戻す。値は resolveColor() で変換した
 * 同じ色（表現形式が変わるだけ）なので、この一瞬の間だけ画面上の見た目に実質的な
 * 変化は無い。tokens.css自体は一切変更しない。
 *
 * これだけでは画面に今映っている実アプリのUI（編集禁止のtierlist/matrix配下の
 * コンポーネントが `var()` を介さず直接書いているoklchリテラル）までは救えないため、
 * 撮影時は `ignoreElements`（下記）と併用し、そもそも実アプリのDOMをhtml2canvasの
 * クローン対象に含めないようにしている。
 */
export function applyGlobalTokenOverrides(): () => void {
  const root = document.documentElement;
  const overrides = buildExportTokenOverrides();
  const previousValues = new Map<string, string>();
  for (const [name, value] of Object.entries(overrides)) {
    previousValues.set(name, root.style.getPropertyValue(name));
    root.style.setProperty(name, value);
  }
  return function restore() {
    for (const [name, previous] of previousValues) {
      if (previous) {
        root.style.setProperty(name, previous);
      } else {
        root.style.removeProperty(name);
      }
    }
  };
}

/**
 * html2canvasに渡す `ignoreElements` オプション。実アプリのマウント先(`#root`)を
 * クローン対象から除外する。
 *
 * 理由: html2canvasは撮影対象の要素だけでなく文書全体を丸ごとクローンしてスタイルを
 * 解析するため、画面の裏に今も描画されている実アプリ（ティアリストの段のラベル色や
 * 色スウォッチなど。src/components/tierlist/ 配下は編集禁止で、`var()` を介さず
 * oklchリテラルを直接書いている箇所がある）まで解析対象になり、そちらの色が原因で
 * 撮影全体が失敗する（実機検証で確認）。PNGダイアログはReactポータルで
 * `document.body` 直下（`#root` の兄弟要素）に描画しているため、`#root` を丸ごと
 * 無視しても撮影対象のダイアログ自身には影響しない。
 */
export function ignoreAppRootElement(element: Element): boolean {
  return element.id === 'root';
}
