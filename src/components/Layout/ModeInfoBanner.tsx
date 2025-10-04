import React, { useEffect, useState } from 'react';
import type { DiagramType } from '../../types';

interface ModeInfoBannerProps {
  mode: DiagramType;
}

interface ModeInfoContent {
  title: string;
  summary: string;
  steps: string[];
  cta?: string;
}

const COPY = {
  dismiss: '\u6b21\u56de\u304b\u3089\u975e\u8868\u793a',
} as const;

const MODE_CONTENT_MAP: Record<DiagramType, ModeInfoContent> = {
  tierlist: {
    title: '\u30c6\u30a3\u30a2\u30ea\u30b9\u30c8\u30e2\u30fc\u30c9',
    summary: '\u30c1\u30e3\u30f3\u30d4\u30aa\u30f3\u3092\u30c6\u30a3\u30a2\u3054\u3068\u306b\u4e26\u3079\u3066\u3001\u8a55\u4fa1\u3092\u3059\u3070\u3084\u304f\u5171\u6709\u3067\u304d\u307e\u3059\u3002',
    steps: [
      '\u691c\u7d22\u3084\u30d7\u30ea\u30bb\u30c3\u30c8\u3067\u5019\u88dc\u3092\u30b9\u30c6\u30fc\u30b8\u30f3\u30b0\u3078\u8ffd\u52a0',
      '\u5404\u30c6\u30a3\u30a2\u884c\u306b\u30c9\u30e9\u30c3\u30b0\uff06\u30c9\u30ed\u30c3\u30d7\u3057\u3066\u914d\u7f6e',
      '\u30e9\u30d9\u30eb\u3084\u8272\u3092\u6574\u3048\u3066\u51fa\u529b\u30fb\u5171\u6709',
    ],
    cta: '\u30d7\u30ea\u30bb\u30c3\u30c8\u3068\u691c\u7d22\u306f\u4e0b\u90e8\u30d1\u30cd\u30eb\u304b\u3089\u5207\u308a\u66ff\u3048\u3089\u308c\u307e\u3059\u3002',
  },
  matrix: {
    title: '\u30de\u30c8\u30ea\u30af\u30b9\u30e2\u30fc\u30c9',
    summary: '2\u8ef8\u3067\u30de\u30c3\u30d4\u30f3\u30b0\u3057\u3001\u69cb\u6210\u30d0\u30e9\u30f3\u30b9\u3092\u77ac\u6642\u306b\u628a\u63a7\u3067\u304d\u307e\u3059\u3002',
    steps: [
      '\u8ef8\u30e9\u30d9\u30eb\u3092\u7de8\u96c6\u3057\u3066\u6bd4\u8f03\u8996\u70b9\u3092\u8a2d\u5b9a',
      '\u30b9\u30c6\u30fc\u30b8\u30f3\u30b0\u304b\u3089\u30b0\u30ea\u30c3\u30c9\u3078\u30c9\u30e9\u30c3\u30b0',
      '\u4f4d\u7f6e\u3092\u8abf\u6574\u3057\u305f\u3089\u30b9\u30af\u30ea\u30fc\u30f3\u30b7\u30e7\u30c3\u30c8\u3084\u51fa\u529b\u3067\u5171\u6709',
    ],
    cta: '\u4e0a\u90e8\u306e\u300c\u8a2d\u5b9a\u3092\u8868\u793a\u300d\u3067\u8ef8\u540d\u3084\u30ac\u30a4\u30c9\u7dda\u3092\u5909\u66f4\u3067\u304d\u307e\u3059\u3002',
  },
  scatter: {
    title: '\u30be\u30fc\u30f3\u30b9\u30ad\u30e3\u30c3\u30bf\u30fc\u30e2\u30fc\u30c9',
    summary: '4\u8c61\u9650\u306b\u5019\u88dc\u3092\u914d\u7f6e\u3057\u3066\u3001\u5f79\u5272\u5206\u62c5\u3092\u7c21\u5358\u306b\u691c\u8a0e\u3067\u304d\u307e\u3059\u3002',
    steps: [
      '\u30be\u30fc\u30f3\u30e9\u30d9\u30eb\u3092\u30af\u30ea\u30c3\u30af\u3057\u3066\u7528\u9014\u3092\u8a2d\u5b9a',
      '\u30b9\u30c6\u30fc\u30b8\u30f3\u30b0\u304b\u3089\u5404\u30be\u30fc\u30f3\u3078\u30c9\u30e9\u30c3\u30b0',
      '\u914d\u7f6e\u6570\u306f\u753b\u9762\u4e0b\u90e8\u3067\u78ba\u8a8d\u3067\u304d\u307e\u3059',
    ],
  },
};

const buildStorageKey = (mode: DiagramType) => `loltier.modeIntro.${mode}`;

export const ModeInfoBanner: React.FC<ModeInfoBannerProps> = ({ mode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(buildStorageKey(mode));
      setIsVisible(dismissed !== 'dismissed');
    } catch (error) {
      setIsVisible(true);
    }
  }, [mode]);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(buildStorageKey(mode), 'dismissed');
    } catch (error) {
      // noop
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const content = MODE_CONTENT_MAP[mode];

  return (
    <section className="bg-blue-50/80 border border-blue-200 text-blue-900">
      <div className="mx-auto flex max-w-5xl items-start justify-between gap-3 px-3 py-2 text-xs sm:text-sm">
        <div className="flex flex-1 items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold uppercase">
            {mode.charAt(0)}
          </span>
          <div className="flex-1 space-y-1">
            <h2 className="font-semibold tracking-wide text-blue-900">{content.title}</h2>
            <p className="leading-snug text-blue-800">{content.summary}</p>
            <ul className="list-disc space-y-0.5 pl-4 text-blue-800">
              {content.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            {content.cta && (
              <p className="text-[11px] text-blue-700">{content.cta}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-2 shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
        >
          {COPY.dismiss}
        </button>
      </div>
    </section>
  );
};
