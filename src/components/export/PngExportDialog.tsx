import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import { useDiagramStore } from '../../store/useDiagramStore';
import { useChampionRoster } from '../../hooks/useChampionRoster';
import { ExportFrame } from './ExportFrame';
import { ExportTierListBoard } from './ExportTierListBoard';
import { ExportMatrixBoard } from './ExportMatrixBoard';
import { EXPORT_HEIGHT, EXPORT_WIDTH } from './exportMetrics';
import { applyGlobalTokenOverrides, ignoreAppRootElement, resolveColor } from './exportColors';

interface PngExportDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * PNG書き出しダイアログ（要求定義§5.4 MUST・デザイン仕様§10）。
 *
 * タイトルはこのコンポーネントのローカルstateだけで持つ（ストアには保存しない。
 * ストアは別担当が並行で変更中のため競合を避ける指示による）。ダイアログを閉じると
 * アンマウントされ、次に開いたときは初期値に戻る。
 *
 * 撮影対象は「画面に見せない実体」を position:fixed で画面外に置いた
 * ExportFrame（captureRef）で、html2canvasはこちらだけを撮る。ダイアログ内に
 * 表示するプレビューは見た目だけの別インスタンス（CSS transformで縮小）で、
 * 撮影対象そのものにtransformを掛けるとhtml2canvasの出力サイズが狂うリスクを
 * 避けるため、あえて2つ描画を分けている。
 */
export function PngExportDialog({ open, onClose }: PngExportDialogProps) {
  const mode = useDiagramStore((state) => state.mode);
  const tiers = useDiagramStore((state) => state.tiers);
  const matrixPlacements = useDiagramStore((state) => state.matrixPlacements);
  const matrixAxisLabels = useDiagramStore((state) => state.matrixAxisLabels);
  const matrixAxisLabelOffsets = useDiagramStore((state) => state.matrixAxisLabelOffsets);
  const matrixGridSize = useDiagramStore((state) => state.matrixGridSize);
  const { champions, version: patchVersion } = useChampionRoster();

  const [title, setTitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(0.3);

  const captureRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // パッチ番号が分かっている前提の初期タイトルを一度だけ入れる（ユーザーが既に
  // 何か入力していれば上書きしない）。モードによって図の呼び名が変わるので、
  // マトリクスの画像に「ティア表」と入ってしまわないよう出し分ける。
  useEffect(() => {
    if (!open) return;
    setTitle((current) => {
      if (current !== '' || !patchVersion) return current;
      return `Patch ${patchVersion} ${mode === 'matrix' ? '環境マトリクス' : '環境ティア表'}`;
    });
  }, [open, patchVersion, mode]);

  // 開いたらタイトル欄にフォーカス
  useEffect(() => {
    if (!open) return;
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [open]);

  // Escapeで閉じる
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // プレビューはダイアログ幅に応じて縮小率を変える(モバイル幅でもはみ出さないように)
  useEffect(() => {
    if (!open) return;
    const el = previewContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setPreviewScale(width / EXPORT_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    if (!captureRef.current || isExporting) return;
    setIsExporting(true);
    setExportError(null);
    // html2canvasはoklch()を解釈できず、撮影対象の祖先要素(document.body直下の
    // ラッパー等)もクローンしてスタイルを解析するため、撮影の直前だけ
    // デザイントークンを一時的にhtml2canvas互換の値へ差し替える。
    const restoreTokens = applyGlobalTokenOverrides();
    try {
      // 撮影前に書体の読み込みを待つ(待たないと崩れた書体で撮られる)
      await document.fonts.ready;
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
        ignoreElements: ignoreAppRootElement,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = mode === 'matrix' ? 'loltiertable-matrix.png' : 'loltiertable-tierlist.png';
      link.click();
      onClose();
    } catch (error) {
      console.error('PNG書き出しに失敗しました', error);
      setExportError('画像の書き出しに失敗しました。もう一度お試しください。');
    } finally {
      restoreTokens();
      setIsExporting(false);
    }
  }

  const boardNode =
    mode === 'matrix' ? (
      <ExportMatrixBoard
        placements={matrixPlacements}
        axisLabels={matrixAxisLabels}
        axisLabelOffsets={matrixAxisLabelOffsets}
        gridSize={matrixGridSize}
        champions={champions}
      />
    ) : (
      <ExportTierListBoard tiers={tiers} champions={champions} />
    );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="PNG書き出し">
      {/* 背景クリックで閉じる */}
      <button
        type="button"
        aria-label="ダイアログを閉じる"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: resolveColor('oklch(0.10 0.01 265 / .7)') }}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[720px] flex-col gap-4 overflow-y-auto rounded-[var(--radius-app)] border border-[var(--border-main)] bg-[var(--surface-app)] p-5 shadow-[0_30px_80px_-30px_#000] lg:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-bold uppercase tracking-[0.04em] text-[var(--text-primary)] lg:text-[20px]">
            PNG書き出し
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="cursor-pointer text-[20px] leading-none text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            ×
          </button>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-[var(--text-secondary)]">タイトル</span>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例: Patch 16.14 ソロキュー環境ティア表 / by @summoner"
            className="rounded-[var(--radius-control)] border border-[var(--border-input-strong)] bg-[var(--surface-input)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--border-input-focus)]"
          />
        </label>

        {/* プレビュー(見た目のみ。実際の撮影対象は下の画面外要素) */}
        <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-weak)] bg-black/20 p-3">
          <div ref={previewContainerRef} style={{ width: '100%', aspectRatio: `${EXPORT_WIDTH} / ${EXPORT_HEIGHT}`, overflow: 'hidden' }}>
            <div style={{ width: EXPORT_WIDTH, height: EXPORT_HEIGHT, transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
              <ExportFrame title={title} patchVersion={patchVersion}>
                {boardNode}
              </ExportFrame>
            </div>
          </div>
        </div>

        {exportError && <p className="text-[13px] text-[var(--danger-text)]">{exportError}</p>}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--border-secondary-btn)] bg-[var(--surface-button-secondary)] px-4 py-[9px] text-[14px] font-semibold text-[var(--text-button)] hover:border-[var(--border-secondary-btn-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isExporting}
            className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--gold)] bg-[var(--gold)] px-[18px] py-[9px] text-[14px] font-bold text-[var(--gold-ink)] hover:bg-[var(--gold-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? '書き出し中…' : 'PNGを保存'}
          </button>
        </div>
      </div>

      {/* 撮影用の実体。画面には見せず、画面外に配置する(display:noneはhtml2canvasが撮れないため使わない) */}
      <div style={{ position: 'fixed', left: -99999, top: 0 }} aria-hidden="true">
        <ExportFrame ref={captureRef} title={title} patchVersion={patchVersion}>
          {boardNode}
        </ExportFrame>
      </div>
    </div>,
    document.body,
  );
}
