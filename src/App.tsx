import { useEffect, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { AppHeader } from './components/layout/AppHeader'
import { AppFooter } from './components/layout/AppFooter'
import { SidebarShell } from './components/layout/SidebarShell'
import { MobileSidebarSheet } from './components/layout/MobileSidebarSheet'
import { loadChampionRoster } from './services/championData'
import { useDiagramStore } from './store/useDiagramStore'
import type { Champion } from './types'

/**
 * Phase 2 の到達点。骨格・デザイントークン・データ層・ストアを繋いだ状態。
 * メイン領域の中身（ティアリストとマトリクス）は Phase 3 以降で実装する。
 */
function App() {
  const mode = useDiagramStore((state) => state.mode)
  const setMode = useDiagramStore((state) => state.setMode)

  // チャンピオン情報はビルド時に取得した public/data/champions.json から読む。
  // 起動時に一度だけ読み、以後はこの一覧を使い回す（ストアには入れない）。
  const [champions, setChampions] = useState<Champion[]>([])
  const [patchVersion, setPatchVersion] = useState<string>()
  const [loadError, setLoadError] = useState<string>()

  useEffect(() => {
    let cancelled = false
    loadChampionRoster()
      .then(({ champions: roster, version }) => {
        if (cancelled) return
        setChampions(roster)
        setPatchVersion(version)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : String(error))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AppShell
      header={<AppHeader mode={mode} onModeChange={setMode} />}
      sidebar={<SidebarShell championCount={champions.length} />}
      mobileSidebar={<MobileSidebarSheet championCount={champions.length} />}
      main={
        <main className="flex h-full min-h-0 items-center justify-center overflow-y-auto">
          <p className="font-display text-[20px] uppercase tracking-[0.04em] text-[var(--text-weak)]">
            {loadError
              ? `チャンピオン情報を読み込めません: ${loadError}`
              : mode === 'tierlist'
                ? 'ここにティアリストが入ります'
                : 'ここにマトリクスが入ります'}
          </p>
        </main>
      }
      footer={<AppFooter patchVersion={patchVersion} />}
    />
  )
}

export default App
