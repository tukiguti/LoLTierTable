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
import { tierListCollisionDetection, matrixCollisionDetection } from './components/tierlist/dnd'
import type { ChampionDragData, DropData, TierRowDragData } from './components/tierlist/dnd'
import { MatrixView } from './components/matrix/MatrixView'
import { useChampionRoster } from './hooks/useChampionRoster'
import { useDiagramStore } from './store/useDiagramStore'
import type { Champion } from './types'

/**
 * Phase 4 の到達点。ティアリスト・マトリクスの両モードでメイン領域と
 * ドラッグ&ドロップ全体を実装した状態。DndContext/DragOverlay は1つだけで、
 * モードに応じて衝突判定とオーバーレイの見た目を切り替える。
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

    if (mode === 'matrix') {
      if (activeData.type !== 'champion') return
      const { championId, from } = activeData
      const overData = over?.data.current as DropData | undefined

      if (!over || overData?.type !== 'matrix') {
        // 盤面の外（盤面そのものではない場所）へドロップ: 盤面から取り除く（デザイン仕様§12と同じ考え方）。
        // サイドバー起点はそもそも配置されていないので何もしない。
        if (from === 'matrix') store.removeMatrixPlacement(activeData.placementId)
        return
      }

      // 落下位置の計算: activatorEvent（ドラッグ開始時のポインタ座標）+ delta（移動量）で
      // ドロップ時のポインタ座標を求め、盤面のrect（over.rect）に対する割合(0-100)に変換する。
      // over.rectだけでは「盤面のどこ」かが分からず、ポインタ座標だけでは「盤面のどこを基準に」が
      // 分からないため、両方が必要。
      const activatorEvent = event.activatorEvent as PointerEvent
      const rect = over.rect
      const endX = activatorEvent.clientX + event.delta.x
      const endY = activatorEvent.clientY + event.delta.y
      const xPercent = ((endX - rect.left) / rect.width) * 100
      const yPercent = ((endY - rect.top) / rect.height) * 100
      const clampedX = Math.min(100, Math.max(0, xPercent))
      const clampedY = Math.min(100, Math.max(0, yPercent))

      if (from === 'matrix') {
        // 既存の駒を動かす: その配置idだけ座標を更新する（同じチャンピオンの他の配置は動かさない）。
        store.moveMatrixPlacement(activeData.placementId, clampedX, clampedY)
      } else {
        // サイドバーからの新規配置: 既存の配置を上書きせず追加する（同じチャンピオンを何体でも置ける）。
        store.addChampionToMatrix(championId, clampedX, clampedY)
      }
      return
    }

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
      collisionDetection={mode === 'tierlist' ? tierListCollisionDetection : matrixCollisionDetection}
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
            <MatrixView champions={champions} />
          )
        }
        footer={<AppFooter patchVersion={patchVersion} />}
      />
      <DragOverlay>
        {activeChampion &&
          (mode === 'matrix' ? (
            <ChampionIcon
              champion={activeChampion}
              size={52}
              radius={4}
              borderColor="var(--gold)"
              className="scale-[1.12] shadow-[0_6px_18px_-6px_#000]"
            />
          ) : (
            <ChampionIcon champion={activeChampion} size={64} borderColor="var(--gold)" />
          ))}
      </DragOverlay>
    </DndContext>
  )
}

export default App
