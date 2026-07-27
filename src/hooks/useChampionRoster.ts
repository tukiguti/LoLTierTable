import { useEffect, useState } from 'react';
import { loadChampionRoster } from '../services/championData';
import type { Champion } from '../types';

interface RosterState {
  champions: Champion[];
  version?: string;
  error?: string;
  loading: boolean;
}

/**
 * チャンピオン一覧はビルド時取得の静的JSONなので、アプリの生存期間中に変わらない。
 * 画面ごとに取り直さないよう、モジュールスコープに1回だけ読み込んだ結果を持つ。
 */
let cache: { champions: Champion[]; version: string } | undefined;
let inflight: Promise<{ champions: Champion[]; version: string }> | undefined;

function load() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = loadChampionRoster().then((result) => {
      cache = result;
      return result;
    });
  }
  return inflight;
}

/** チャンピオン一覧を読み込む。複数のコンポーネントから呼んでも取得は1回だけ */
export function useChampionRoster(): RosterState {
  const [state, setState] = useState<RosterState>(() =>
    cache ? { champions: cache.champions, version: cache.version, loading: false } : { champions: [], loading: true },
  );

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    load()
      .then((result) => {
        if (cancelled) return;
        setState({ champions: result.champions, version: result.version, loading: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          champions: [],
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
