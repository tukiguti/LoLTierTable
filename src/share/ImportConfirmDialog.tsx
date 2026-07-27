import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImportConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 共有URLを開いたときの上書き確認ダイアログ。
 *
 * 保存済みの図が空でない状態で共有リンクを開いたときだけ表示する(要求: 黙って
 * 上書きすると訪問者の作業内容を失わせるため)。作法はPngExportDialogに揃える
 * (portalでdocument.bodyに出す・Escapeと背景クリックで閉じる。閉じる=キャンセル扱い)。
 */
export function ImportConfirmDialog({ onConfirm, onCancel }: ImportConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="共有された図を開く"
    >
      {/* 背景クリックで閉じる(キャンセル扱い) */}
      <button
        type="button"
        aria-label="ダイアログを閉じる"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
        style={{ background: 'oklch(0.10 0.01 265 / .7)' }}
      />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col gap-4 rounded-[var(--radius-app)] border border-[var(--border-main)] bg-[var(--surface-app)] p-5 shadow-[0_30px_80px_-30px_#000]">
        <h2 className="font-display text-[18px] font-bold uppercase tracking-[0.04em] text-[var(--text-primary)]">
          共有された図を開きますか
        </h2>
        <p className="text-[14px] text-[var(--text-secondary)]">
          現在の作業内容は失われます。続けますか？
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--border-secondary-btn)] bg-[var(--surface-button-secondary)] px-4 py-[9px] text-[14px] font-semibold text-[var(--text-button)] hover:border-[var(--border-secondary-btn-hover)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--gold)] bg-[var(--gold)] px-[18px] py-[9px] text-[14px] font-bold text-[var(--gold-ink)] hover:bg-[var(--gold-hover)]"
          >
            開く
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
