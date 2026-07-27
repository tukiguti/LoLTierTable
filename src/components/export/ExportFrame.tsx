import { forwardRef, useMemo, type CSSProperties, type ReactNode } from 'react';
import { DISCLAIMER } from '../layout/AppFooter';
import {
  EXPORT_DOMAIN,
  EXPORT_FOOTER_HEIGHT,
  EXPORT_HEADER_HEIGHT,
  EXPORT_HEIGHT,
  EXPORT_PADDING_BOTTOM,
  EXPORT_PADDING_LEFT,
  EXPORT_PADDING_RIGHT,
  EXPORT_PADDING_TOP,
  EXPORT_SECTION_GAP,
  EXPORT_WIDTH,
  truncateTitle,
} from './exportMetrics';
import { buildExportTokenOverrides, resolveColor } from './exportColors';

interface ExportFrameProps {
  /** ユーザーが入力する編集可能なタイトル（デザイン仕様§10）。ストアには保存しない */
  title: string;
  patchVersion?: string;
  /** 中央に差し込む盤面（ティアリストの段 or マトリクス）。上下はモード共通 */
  children: ReactNode;
}

/**
 * PNG書き出しの共通フレーム（デザイン仕様§10）。1200×900固定・screen用のUIとは
 * 別に組んだ書き出し専用レイアウト。html2canvasの撮影対象になるので、
 * 画面をそのまま撮るのではなく、この専用DOMを撮影する。
 *
 * ティアリスト・マトリクスの両モードで上部（ロゴ・タイトル・パッチ・ドメイン）と
 * 下部（LOLTIERTABLE表記＋免責文）は共通。中央だけをmodeに応じて呼び出し側が
 * 差し替える（children）。
 */
export const ExportFrame = forwardRef<HTMLDivElement, ExportFrameProps>(function ExportFrame(
  { title, patchVersion, children },
  ref,
) {
  // html2canvasはoklch()を解釈できないため、このサブツリーの内側だけ`var(--xxx)`の
  // 解決先をhtml2canvas互換の値へ上書きする（tokens.css自体は変更しない）。
  // カスケードにより子孫のChampionIconが参照するトークンにも及ぶ。
  const tokenOverrides = useMemo(() => buildExportTokenOverrides(), []);

  return (
    <div
      ref={ref}
      style={{
        ...(tokenOverrides as CSSProperties),
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
        boxSizing: 'border-box',
        background: 'var(--surface-export-bg)',
        border: '1px solid var(--border-main)',
        borderRadius: 6,
        overflow: 'hidden',
        padding: `${EXPORT_PADDING_TOP}px ${EXPORT_PADDING_RIGHT}px ${EXPORT_PADDING_BOTTOM}px ${EXPORT_PADDING_LEFT}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: EXPORT_SECTION_GAP,
        color: 'var(--text-primary)',
        fontFamily: '"Barlow", "Noto Sans JP", sans-serif',
      }}
    >
      {/* 上部: ロゴ＋タイトル（左） / パッチ・ドメイン（右） */}
      <div
        style={{
          height: EXPORT_HEADER_HEIGHT,
          flex: 'none',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            flex: 'none',
            transform: 'rotate(45deg)',
            borderRadius: 4,
            background: 'linear-gradient(135deg, var(--gold-gradient-start), var(--gold-gradient-end))',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div
            className="font-display"
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: '0.06em',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: 'var(--text-logo)',
              whiteSpace: 'nowrap',
            }}
          >
            LoL<span style={{ color: 'var(--gold)' }}>TierTable</span>
          </div>
          <div
            style={{
              fontSize: 15,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {truncateTitle(title)}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div
            className="font-mono-ui"
            style={{
              padding: '4px 10px',
              border: '1px solid var(--border-tile-placed)',
              borderRadius: 3,
              fontSize: 12,
              color: 'var(--gold-text-soft)',
              whiteSpace: 'nowrap',
            }}
          >
            PATCH {patchVersion ?? '—'}
          </div>
          <div className="font-mono-ui" style={{ fontSize: 11, color: resolveColor('oklch(0.52 0.01 265)') }}>
            {EXPORT_DOMAIN}
          </div>
        </div>
      </div>

      {/* 中央: モードごとの盤面 */}
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>

      {/* 下部: LOLTIERTABLE表記＋Riot免責文（要求定義§5.6） */}
      <div
        style={{
          height: EXPORT_FOOTER_HEIGHT,
          flex: 'none',
          borderTop: '1px solid var(--border-weak)',
          paddingTop: 14,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <div
          className="font-display"
          style={{
            flex: 'none',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--gold-text-weak)',
            whiteSpace: 'nowrap',
          }}
        >
          LOLTIERTABLE
        </div>
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--text-weaker)' }}>{DISCLAIMER}</div>
      </div>
    </div>
  );
});
