import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDiagramStore } from '../store/useDiagramStore';
import { buildShareUrl, buildSharedDiagramFromState, MAX_SHARE_URL_LENGTH } from './shareCodec';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

type ShareStatus =
  | { kind: 'generating' }
  | { kind: 'error' }
  | { kind: 'too-long'; length: number }
  | { kind: 'ready'; url: string; length: number };

async function tryCopyToClipboard(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * URL共有ダイアログ(要求定義§5.4 SHOULD)。
 *
 * 開いたら現在の図から共有URLを作り、自動でクリップボードへコピーを試みる。
 * 失敗時・非対応環境向けに、URLを選択してコピーできる読み取り専用の入力欄を常に出す。
 * 作法はPngExportDialogに揃える(portalでdocument.bodyに出す・Escapeと背景クリックで閉じる)。
 */
export function ShareDialog({ open, onClose }: ShareDialogProps) {
  const [status, setStatus] = useState<ShareStatus>({ kind: 'generating' });
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const urlInputRef = useRef<HTMLInputElement>(null);

  // 開くたびに現在の図からURLを作り直し、自動コピーを試みる
  useEffect(() => {
    if (!open) return;
    setStatus({ kind: 'generating' });
    setCopyState('idle');
    let cancelled = false;

    async function run() {
      const diagram = buildSharedDiagramFromState(useDiagramStore.getState());
      const result = await buildShareUrl(diagram);
      if (cancelled) return;

      if (!result.ok) {
        setStatus({ kind: 'too-long', length: result.length });
        return;
      }
      setStatus({ kind: 'ready', url: result.url, length: result.length });

      const copied = await tryCopyToClipboard(result.url);
      if (cancelled) return;
      setCopyState(copied ? 'copied' : 'failed');
      if (!copied) {
        urlInputRef.current?.focus();
        urlInputRef.current?.select();
      }
    }

    run().catch(() => {
      if (!cancelled) setStatus({ kind: 'error' });
    });

    return () => {
      cancelled = true;
    };
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

  if (!open) return null;

  async function handleCopyClick() {
    if (status.kind !== 'ready') return;
    const copied = await tryCopyToClipboard(status.url);
    setCopyState(copied ? 'copied' : 'failed');
    if (!copied) {
      urlInputRef.current?.focus();
      urlInputRef.current?.select();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="URLで共有"
    >
      {/* 背景クリックで閉じる */}
      <button
        type="button"
        aria-label="ダイアログを閉じる"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: 'oklch(0.10 0.01 265 / .7)' }}
      />

      <div className="relative z-10 flex w-full max-w-[520px] flex-col gap-4 rounded-[var(--radius-app)] border border-[var(--border-main)] bg-[var(--surface-app)] p-5 shadow-[0_30px_80px_-30px_#000] lg:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-bold uppercase tracking-[0.04em] text-[var(--text-primary)] lg:text-[20px]">
            URLで共有
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

        {status.kind === 'generating' && (
          <p className="text-[14px] text-[var(--text-secondary)]">URLを作成しています…</p>
        )}

        {status.kind === 'error' && (
          <p className="text-[14px] text-[var(--danger-text)]">
            URLの作成に失敗しました。もう一度お試しください。
          </p>
        )}

        {status.kind === 'too-long' && (
          <p className="text-[14px] text-[var(--danger-text)]">
            図の内容が多く、共有URLが長くなりすぎるため作成できませんでした（
            {status.length.toLocaleString()}文字 / 上限{MAX_SHARE_URL_LENGTH.toLocaleString()}
            文字）。配置数を減らすか、PNG画像として書き出してください。
          </p>
        )}

        {status.kind === 'ready' && (
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-[var(--text-secondary)]">
                共有URL
              </span>
              <input
                ref={urlInputRef}
                type="text"
                readOnly
                value={status.url}
                onFocus={(event) => event.currentTarget.select()}
                className="rounded-[var(--radius-control)] border border-[var(--border-input-strong)] bg-[var(--surface-input)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--border-input-focus)]"
              />
            </label>
            <p className="text-[12px] text-[var(--text-weak)]">
              {copyState === 'copied' && 'クリップボードにコピーしました'}
              {copyState === 'failed' && 'コピーできませんでした。上の欄を選択してコピーしてください'}
              {copyState === 'idle' && `${status.length.toLocaleString()}文字`}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--border-secondary-btn)] bg-[var(--surface-button-secondary)] px-4 py-[9px] text-[14px] font-semibold text-[var(--text-button)] hover:border-[var(--border-secondary-btn-hover)]"
          >
            閉じる
          </button>
          {status.kind === 'ready' && (
            <button
              type="button"
              onClick={handleCopyClick}
              className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--gold)] bg-[var(--gold)] px-[18px] py-[9px] text-[14px] font-bold text-[var(--gold-ink)] hover:bg-[var(--gold-hover)]"
            >
              {copyState === 'copied' ? 'コピーしました' : 'コピー'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
