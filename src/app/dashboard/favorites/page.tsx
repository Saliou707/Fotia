'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, stagger } from '@/lib/animations'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { fetchFavorites, type FavoritePhoto, type FavoriteGalleryStat } from '@/lib/api'
import { toast } from '@/components/ui'
import FavoritesHeader from './FavoritesHeader'
import FavoritePhotoCard from './FavoritePhotoCard'
import GalleryFavCard from './GalleryFavCard'
import FavoritesEmptyState from './FavoritesEmptyState'
import VolumetryCard from './VolumetryCard'
import DownloadCard from './DownloadCard'
import DrillGalleryLink from './DrillGalleryLink'

function Skeleton({ h = 140 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<FavoritePhoto[]>([])
  const [galleries, setGalleries] = useState<FavoriteGalleryStat[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)
  const [tab, setTab] = useState(0)
  // null = liste galeries | string = id galerie drillée
  const [drillGallery, setDrillGallery] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    async function load() {
      const data = await fetchFavorites()
      if (!data) { setLoading(false); return }

      setPhotos(data.photos)
      setGalleries(data.galleries)
      const galleryIds = data.galleries.map(g => g.id)

      // Realtime : le canal reste côté client (natif), mais toute lecture de données
      // passe par l'API sécurisée — pas d'accès supabase direct.
      channel = supabase.channel(`realtime_fav_${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'favorites' }, async (payload) => {
          if (!galleryIds.includes(payload.new.gallery_id)) return
          const fresh = await fetchFavorites()
          if (fresh) { setPhotos(fresh.photos); setGalleries(fresh.galleries) }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'favorites' }, (payload) => {
          setPhotos(prev => prev.filter(p => p.id !== payload.old.id))
          setGalleries(prev => prev.map(g => g.id === payload.old.gallery_id ? { ...g, favorite_count: Math.max(0, g.favorite_count - 1) } : g))
          setSelected(prev => { const next = new Set(prev); next.delete(payload.old.id as string); return next })
        })
        .subscribe()

      setLoading(false)
    }

    load()
    return () => { if (channel) supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  // Photos contextuelles selon la vue active
  const contextPhotos = drillGallery ? photos.filter(p => p.gallery_id === drillGallery) : photos
  const allSelected = contextPhotos.length > 0 && contextPhotos.every(p => selected.has(p.id))

  const openDrill = (id: string) => {
    setDrillGallery(id)
    setSelected(new Set())
    setDone(false)
  }
  const closeDrill = () => {
    setDrillGallery(null)
    setSelected(new Set())
    setDone(false)
  }

  const handleDownload = async () => {
    const targets = selected.size > 0
      ? contextPhotos.filter(p => selected.has(p.id))
      : contextPhotos
    if (targets.length === 0) return
    setDownloading(true)
    try {
      const res = await fetch('/api/favorites/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoriteIds: targets.map(t => t.id) })
      })
      const data = await res.json()
      if (data.download_url) {
        const a = document.createElement('a')
        a.href = data.download_url
        const gTitle = drillGallery
          ? (galleries.find(g => g.id === drillGallery)?.title ?? 'galerie').toLowerCase().replace(/\s+/g, '-')
          : 'tous-favoris'
        a.download = `favoris-${gTitle}.zip`
        document.body.appendChild(a); a.click(); a.remove()
        setDone(true)
        setTimeout(() => setDone(false), 3000)
      } else {
        throw new Error(data.error || 'Erreur inconnue')
      }
    } catch {
      toast.error('Téléchargement impossible', 'Erreur lors de la création du ZIP. Réessayez.')
    } finally {
      setDownloading(false)
    }
  }

  const totalFavs = photos.length
  const maxFav = Math.max(...galleries.map(g => g.favorite_count), 1)
  const galleriesWithFavs = galleries.filter(g => g.favorite_count > 0)
  const drillData = galleries.find(g => g.id === drillGallery)

  return (
    <div className="page-layout" style={{ minHeight: 'calc(100vh - 58px)' }}>

      {/* ── MAIN ── */}
      <div className="page-main">
        <motion.div initial="hidden" animate="show" variants={stagger}>

          <FavoritesHeader
            drillGallery={drillGallery}
            drillTitle={drillData?.title}
            contextCount={contextPhotos.length}
            tab={tab}
            onTab={setTab}
            onCloseDrill={closeDrill}
            allSelected={allSelected}
            onToggleAll={() => allSelected ? setSelected(new Set()) : setSelected(new Set(contextPhotos.map(p => p.id)))}
          />

          {/* ── CONTENU ── */}
          {loading ? (
            <div className="favorites-masonry" style={{ columns: '5 160px', gap: 12 }}>
              {Array.from({ length: 15 }).map((_, i) => <div key={i} style={{ marginBottom: 12, breakInside: 'avoid' }}><Skeleton h={i % 3 === 0 ? 180 : 130} /></div>)}
            </div>
          ) : photos.length === 0 ? (
            <motion.div variants={fadeUp}>
              <FavoritesEmptyState
                title="Aucun favori enregistré"
                text="Vos clients n'ont pas encore sélectionné de photos dans vos galeries actives."
              />
            </motion.div>

          ) : drillGallery ? (
            /* ══ VUE DRILL : photos d'une galerie ══ */
            <AnimatePresence mode="wait">
              <motion.div
                key={drillGallery}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {contextPhotos.length === 0 ? (
                  <FavoritesEmptyState text="Aucun favori dans cette galerie." iconSize={40} />
                ) : (
                  <div className="favorites-masonry" style={{ columns: '5 160px', gap: 12 }}>
                    {contextPhotos.map(photo => (
                      <div key={photo.id} style={{ marginBottom: 12, position: 'relative', breakInside: 'avoid' }}>
                        <FavoritePhotoCard
                          photo={photo}
                          selected={selected.has(photo.id)}
                          drill
                          onToggle={() => toggle(photo.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          ) : tab === 0 ? (
            /* ══ ONGLET 0 : Flux global ══ */
            <motion.div variants={stagger} className="favorites-masonry" style={{ columns: '5 160px', gap: 12 }}>
              <AnimatePresence>
                {photos.map(photo => (
                  <motion.div key={photo.id} variants={fadeUp} style={{ marginBottom: 12, breakInside: 'avoid' }}>
                    <FavoritePhotoCard
                      photo={photo}
                      selected={selected.has(photo.id)}
                      onToggle={() => toggle(photo.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

          ) : (
            /* ══ ONGLET 1 : Par galerie ══ */
            <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {galleriesWithFavs.map(g => (
                <GalleryFavCard key={g.id} gallery={g} maxFav={maxFav} onOpen={() => openDrill(g.id)} />
              ))}
              {galleriesWithFavs.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center', color: '#A09890', fontSize: 14 }}>
                  Aucun favori par galerie.
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <VolumetryCard
          loading={loading}
          label={drillGallery ? 'Galerie sélectionnée' : 'Volumétrie'}
          count={drillGallery ? contextPhotos.length : totalFavs}
          sublabel={drillGallery ? `Favoris — ${drillData?.title}` : 'Photos sélectionnées au total'}
          stats={!drillGallery ? [
            { label: 'Galeries actives', value: galleries.length },
            { label: 'Avec favoris', value: galleriesWithFavs.length },
          ] : undefined}
          selectedCount={drillGallery ? selected.size : 0}
        />

        <DownloadCard
          empty={drillGallery ? contextPhotos.length === 0 : photos.length === 0}
          done={done}
          downloading={downloading}
          selectedCount={selected.size}
          mode={drillGallery ? 'drill' : 'global'}
          contextCount={contextPhotos.length}
          drillTitle={drillData?.title}
          totalFavs={totalFavs}
          onDownload={handleDownload}
          onClearSelection={() => setSelected(new Set())}
        />

        {/* Lien galerie quand en mode drill */}
        {drillGallery && <DrillGalleryLink galleryId={drillGallery} />}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .page-layout { display: grid; grid-template-columns: 1fr 280px; }
        .page-main { padding: 32px; border-right: 1px solid rgba(255,255,255,0.06); }
        .page-sidebar { padding: 32px 24px; position: sticky; top: 58px; max-height: calc(100vh - 58px); overflow-y: auto; }
        .gallery-card:hover { border-color: rgba(255,255,255,0.14) !important; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
        @media (max-width: 1024px) {
          .page-layout { grid-template-columns: 1fr !important; }
          .page-main { padding: 24px 16px !important; border-right: none !important; }
          .page-sidebar { padding: 24px 16px !important; position: relative !important; top: 0 !important; max-height: none !important; overflow-y: visible !important; border-top: 1px solid rgba(255,255,255,0.06); }
        }
        @media (max-width: 640px) {
          .favorites-tabs { overflow-x: auto !important; width: 100% !important; }
          .favorites-tabs > button { flex-shrink: 0 !important; }
          .favorites-masonry { columns: 2 !important; gap: 8px !important; }
          .favorites-masonry > div { margin-bottom: 8px !important; }
          .favorites-masonry .fav-photo-card { border-radius: 8px !important; }
          .favorites-header { flex-direction: column !important; align-items: flex-start !important; }
          .favorites-drill-controls { width: 100% !important; }
          .favorites-drill-controls button { flex: 1 !important; }
        }
        @media (max-width: 480px) {
          .favorites-masonry { columns: 2 !important; gap: 6px !important; }
          .favorites-masonry > div { margin-bottom: 6px !important; }
          .favorites-masonry .fav-photo-card { border-radius: 6px !important; }
        }
      `}</style>
    </div>
  )
}
