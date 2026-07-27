import { useEffect, useState } from 'react';
import { useDiagramStore } from '../store/useDiagramStore';
import {
  decodeSharedDiagramFromHash,
  hasAnyPlacement,
  SHARE_HASH_KEY,
  toStoreDiagram,
  type SharedDiagram,
} from './shareCodec';

/** URLの断片を消す(履歴は汚さない置き換え)。読み込み後に呼ぶとリロードのたびに確認が出るのを防げる */
function clearShareHash() {
  const url = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, '', url);
}

/**
 * URLの断片(#d=...)を見て、共有データがあれば図を復元するフック(要求定義§5.4 SHOULD)。
 *
 * - 保存済みの図が空(チャンピオンが1体も配置されていない)なら、確認せずそのまま復元する
 * - 空でなければ pendingImport を立てて呼び出し側に確認ダイアログを出させる
 * - 壊れた断片・未知バージョンは decodeSharedDiagramFromHash が null を返すので黙って無視し、
 *   通常起動する(このフックは例外を投げない)
 *
 * 起動時だけでなく hashchange も見る。共有URLを開いているタブのアドレス欄に別の共有URLを
 * 貼った場合、断片だけが変わる遷移になりページは再読み込みされないため、起動時の一度きりの
 * 判定では何も起きずリンクが無視されてしまう。
 */
export function useShareImport() {
  const [pendingImport, setPendingImport] = useState<SharedDiagram | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const hash = window.location.hash;
      if (!hash || !hash.includes(`${SHARE_HASH_KEY}=`)) return;

      const diagram = await decodeSharedDiagramFromHash(hash);
      if (cancelled) return;
      if (!diagram) return; // 壊れている・古い形式 → 黙って無視、通常起動

      if (hasAnyPlacement(useDiagramStore.getState())) {
        setPendingImport(diagram);
        return;
      }
      useDiagramStore.getState().loadDiagram(toStoreDiagram(diagram));
      clearShareHash();
    }

    run();
    window.addEventListener('hashchange', run);
    return () => {
      cancelled = true;
      window.removeEventListener('hashchange', run);
    };
  }, []);

  function confirmImport() {
    if (!pendingImport) return;
    useDiagramStore.getState().loadDiagram(toStoreDiagram(pendingImport));
    clearShareHash();
    setPendingImport(null);
  }

  function cancelImport() {
    clearShareHash();
    setPendingImport(null);
  }

  return { pendingImport, confirmImport, cancelImport };
}
