import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { AppShell } from './components/layout/AppShell'
import { AppHeader } from './components/layout/AppHeader'
import { AppFooter } from './components/layout/AppFooter'
import { SidebarShell } from './components/layout/SidebarShell'
import { MobileSidebarSheet } from './components/layout/MobileSidebarSheet'
import { ChampionIcon } from './components/champion/ChampionIcon'
import { TierListView } from './components/tierlist/TierListView'
import { tierListCollisionDetection } from './components/tierlist/dnd'
import type { ChampionDragData, DropData, TierRowDragData } from './components/tierlist/dnd'
import { useChampionRoster } from './hooks/useChampionRoster'
import { useDiagramStore } from './store/useDiagramStore'
import type { Champion } from './types'

/**
 * Phase 3 の到達点。ティアリスト本体とドラッグ&ドロップ全体を実装した状態。
 * マトリクスモードのメイン領域はPhase 4以降で実装するプレースホルダのまま。
 */
function App() {
  const mode = useDiagramStore((state) => state.mode)
  const setMode = useDiagramStore((state) => state.setMode)

  // チャンピオン情報はビルド時に取得した public/data/champions.json から読む。
  // useChampionRoster が起動時に一度だけ読み込み、以後はモジュールスコープの
  // キャッシュを使い回す（ストアには入れない）。
  const { champions, version: patchVersion, error: loadError } = useChampionRoster()

  // DragOverlay に表示する「今つまんでいるアイコン」。段/未分類のチャンピオンを
  // ドラッグしている間だけ入る（段の行そのものの並べ替え中は表示しない）。
  const [activeChampion, setActiveChampion] = useState<Champion | null>(null)

  const sensors = useSensors(
    // タッチでもマウスでも同じ距離しきい値で判定する（要求定義: スマホでのドラッグ対応）。
    // 8pxの移動があるまで開始しないため、軽いタップ/スクロールとドラッグ開始が競合しない。
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as ChampionDragData | TierRowDragData | undefined
    if (data?.type === 'champion') {
      setActiveChampion(champions.find((c) => c.id === data.championId) ?? null)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveChampion(null)
    const { active, over } = event
    const activeData = active.data.current as ChampionDragData | TierRowDragData | undefined
    if (!activeData) return

    const store = useDiagramStore.getState()

    if (activeData.type === 'tier-row') {
      if (!over) return
      const overData = over.data.current as DropData | undefined
      if (!overData || overData.type !== 'tier-row') return
      const fromIndex = store.tiers.findIndex((tier) => tier.id === activeData.tierId)
      const toIndex = store.tiers.findIndex((tier) => tier.id === overData.tierId)
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
      store.reorderTiers(fromIndex, toIndex)
      return
    }

    // activeData.type === 'champion'
    const { championId, from } = activeData
    const originTierId = from === 'tier' ? activeData.tierId : undefined

    if (!over) {
      // 段の外（段でも未分類でもない場所）へドロップ: 未分類へ戻す（デザイン仕様§12）。
      // 未分類・サイドバー起点はそもそも「置かれていた場所」がないので何もしない。
      if (from === 'tier') store.unplaceChampion(championId)
      return
    }

    const overData = over.data.current as DropData | undefined
    if (!overData) return

    if (overData.type === 'tier') {
      store.placeChampionInTier(championId, overData.tierId)
      return
    }

    if (overData.type === 'unclassified') {
      if (from === 'unclassified') return
      if (from === 'roster') store.addChampionIdsToUnclassified([championId])
      else store.unplaceChampion(championId)
      return
    }

    if (overData.type === 'champion') {
      if (overData.from === 'tier') {
        const tier = store.tiers.find((t) => t.id === overData.tierId)
        if (!tier) return
        const destIndex = tier.championIds.indexOf(overData.championId)
        if (from === 'tier' && originTierId === overData.tierId) {
          const fromIndex = tier.championIds.indexOf(championId)
          if (fromIndex === -1 || fromIndex === destIndex) return
          store.moveChampionWithinTier(overData.tierId, fromIndex, destIndex)
        } else {
          store.placeChampionInTier(championId, overData.tierId, destIndex)
        }
      } else if (overData.from === 'unclassified') {
        if (from === 'unclassified') return
        if (from === 'roster') store.addChampionIdsToUnclassified([championId])
        else store.unplaceChampion(championId)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={tierListCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveChampion(null)}
    >
      <AppShell
        header={<AppHeader mode={mode} onModeChange={setMode} />}
        sidebar={<SidebarShell championCount={champions.length} />}
        mobileSidebar={<MobileSidebarSheet championCount={champions.length} />}
        main={
          loadError ? (
            <main className="flex h-full min-h-0 items-center justify-center overflow-y-auto">
              <p className="font-display text-[20px] uppercase tracking-[0.04em] text-[var(--text-weak)]">
                チャンピオン情報を読み込めません: {loadError}
              </p>
            </main>
          ) : mode === 'tierlist' ? (
            <TierListView champions={champions} />
          ) : (
            <main className="flex h-full min-h-0 items-center justify-center overflow-y-auto">
              <p className="font-display text-[20px] uppercase tracking-[0.04em] text-[var(--text-weak)]">
                ここにマトリクスが入ります
              </p>
            </main>
          )
        }
        footer={<AppFooter patchVersion={patchVersion} />}
      />
      <DragOverlay>
        {activeChampion && (
          <ChampionIcon champion={activeChampion} size={64} borderColor="var(--gold)" />
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default App
