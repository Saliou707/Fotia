'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Download, Check, Loader2,
  ArrowLeft, ChevronRight, FolderOpen, CheckSquare, Square, X
} from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { fetchFavorites, getImageUrl, fmtNumber, type FavoritePhoto as FavPhoto, type FavoriteGalleryStat as GalleryStat } from '@/lib/api'

function Skeleton({ h = 140 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<FavPhoto[]>([])
  const [galleries, setGalleries] = useState<GalleryStat[]>([])
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
      alert('Erreur lors de la création du ZIP.')
    } finally {
      setDownloading(false)
    }
  }

  const totalFavs = photos.length
  const maxFav = Math.max(...galleries.map(g => g.favorite_count), 1)
  const galleriesWithFavs = galleries.filter(g => g.favorite_count > 0)
  const drillData = galleries.find(g => g.id === drillGallery)
  const TABS = ['Flux global', 'Par galerie']

  return (
    <div className="page-layout" style={{ minHeight: 'calc(100vh - 58px)' }}>

      {/* ── MAIN ── */}
      <div className="page-main">
        <motion.div initial="hidden" animate="show" variants={stagger}>

          {/* ── HEADER ── */}
          <motion.div variants={fadeUp} className="favorites-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              {/* Breadcrumb si drill */}
              {drillGallery && (
                <button
                  onClick={closeDrill}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8E8E93', fontSize: 12, fontWeight: 500, cursor: 'pointer', marginBottom: 10, padding: '4px 0', letterSpacing: '0.01em' }}
                >
                  <ArrowLeft size={13} /> Toutes les galeries
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
                  {drillGallery ? drillData?.title : 'Favoris'}
                </h1>
                <Heart size={20} color="#C8482E" fill="#C8482E" />
              </div>
              <p style={{ fontSize: 14, color: '#8E8E93', margin: 0 }}>
                {drillGallery
                  ? `${contextPhotos.length} favori${contextPhotos.length !== 1 ? 's' : ''} dans cette galerie`
                  : 'Les photos coups de cœur de vos clients.'}
              </p>
            </div>

            {/* Tabs (masqués si drill) */}                    {!drillGallery && (
              <div className="favorites-tabs" style={{ display: 'inline-flex', gap: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                {TABS.map((t, i) => (
                  <button key={t} onClick={() => setTab(i)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === i ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === i ? '#fff' : '#8E8E93', transition: 'all 0.2s', boxShadow: tab === i ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
                    {t}
                  </button>
                ))}
              </div>
            )}

            {/* Contrôles sélection si drill */}
            {drillGallery && contextPhotos.length > 0 && (
              <button
                className="favorites-drill-controls hover:bg-white/[0.08]"
                onClick={() => allSelected ? setSelected(new Set()) : setSelected(new Set(contextPhotos.map(p => p.id)))}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {allSelected ? <><CheckSquare size={14} /> Tout désélectionner</> : <><Square size={14} /> Tout sélectionner</>}
              </button>
            )}
          </motion.div>

          {/* ── CONTENU ── */}
          {loading ? (
            <div className="favorites-masonry" style={{ columns: '5 160px', gap: 12 }}>
              {Array.from({ length: 15 }).map((_, i) => <div key={i} style={{ marginBottom: 12, breakInside: 'avoid' }}><Skeleton h={i % 3 === 0 ? 180 : 130} /></div>)}
            </div>
          ) : photos.length === 0 ? (
            <motion.div variants={fadeUp} style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Heart size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Aucun favori enregistré</h3>
              <p style={{ fontSize: 14, color: '#8E8E93', maxWidth: 360, margin: '0 auto' }}>
                Vos clients n&apos;ont pas encore sélectionné de photos dans vos galeries actives.
              </p>
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
                  <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Heart size={40} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: '#8E8E93', fontSize: 14 }}>Aucun favori dans cette galerie.</p>
                  </div>
                ) : (
                  <div className="favorites-masonry" style={{ columns: '5 160px', gap: 12 }}>
                    {contextPhotos.map(photo => (
                      <div
                        key={photo.id}
                        style={{
                          marginBottom: 12, position: 'relative', borderRadius: 12, overflow: 'hidden',
                          cursor: 'pointer', breakInside: 'avoid',
                          border: selected.has(photo.id) ? '2.5px solid #C8482E' : '2.5px solid transparent',
                          transition: 'border 0.15s, box-shadow 0.15s', background: '#111',
                          boxShadow: selected.has(photo.id) ? '0 0 0 3px rgba(200,72,46,0.18)' : 'none',
                        }}
                        onClick={() => toggle(photo.id)}
                      >
                        <img src={getImageUrl(photo.r2_key)} alt={photo.original_filename} loading="lazy" style={{ width: '100%', display: 'block' }} />

                        {/* Badge sélection */}
                        <div style={{
                          position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%',
                          background: selected.has(photo.id) ? '#C8482E' : 'rgba(0,0,0,0.52)',
                          border: selected.has(photo.id) ? 'none' : '1.5px solid rgba(255,255,255,0.35)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.18s', backdropFilter: 'blur(4px)',
                        }}>
                          {selected.has(photo.id) && <Check size={12} color="#fff" strokeWidth={3} />}
                        </div>

                        {/* Filename overlay */}
                        <div
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: '20px 10px 8px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                            opacity: selected.has(photo.id) ? 1 : 0, transition: 'opacity 0.18s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => { if (!selected.has(photo.id)) e.currentTarget.style.opacity = '0' }}
                        >
                          <div style={{ fontSize: 10.5, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.original_filename}</div>
                        </div>
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
                  <motion.div
                    key={photo.id} variants={fadeUp}
                    style={{
                      marginBottom: 12, position: 'relative', borderRadius: 12, overflow: 'hidden',
                      cursor: 'pointer', breakInside: 'avoid',
                      border: selected.has(photo.id) ? '2px solid #C8482E' : '2px solid transparent',
                      transition: 'border 0.2s', background: '#111',
                    }}
                    onClick={() => toggle(photo.id)}
                  >
                    <img src={getImageUrl(photo.r2_key)} alt={photo.original_filename} loading="lazy" style={{ width: '100%', display: 'block' }} />

                    <div style={{
                      position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%',
                      background: selected.has(photo.id) ? '#C8482E' : 'rgba(0,0,0,0.5)',
                      border: selected.has(photo.id) ? 'none' : '1px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    }}>
                      {selected.has(photo.id) && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>

                    <div
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '12px 10px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                        opacity: selected.has(photo.id) ? 1 : 0, transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => { if (!selected.has(photo.id)) e.currentTarget.style.opacity = '0' }}
                    >
                      <div style={{ fontSize: 11, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.original_filename}</div>
                      <div style={{ fontSize: 10, color: '#A1A1AA' }}>{photo.gallery_title}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

          ) : (
            /* ══ ONGLET 1 : Par galerie ══ */
            <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {galleriesWithFavs.map(g => (
                <motion.div
                  key={g.id} variants={fadeUp}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    background: 'rgba(14,14,14,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  }}
                  className="gallery-card"
                >
                  {/* Cover image */}
                  <div style={{ height: 140, overflow: 'hidden', background: '#0d0d0d', position: 'relative' }}>
                    {g.cover ? (
                      <img src={getImageUrl(g.cover)} alt={g.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={32} color="rgba(255,255,255,0.07)" fill="rgba(255,255,255,0.07)" />
                      </div>
                    )}
                    {/* Badge favoris */}
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(200,72,46,0.85)', backdropFilter: 'blur(8px)',
                      borderRadius: 99, padding: '4px 12px',
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 700, color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 12px rgba(200,72,46,0.3)'
                    }}>
                      <Heart size={12} color="#fff" fill="#fff" />
                      {g.favorite_count}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 12 }}>
                      {g.title}
                    </div>

                    {/* Barre de progression relative */}
                    <div style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.05)', marginBottom: 16, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(g.favorite_count / maxFav) * 100}%`, background: 'linear-gradient(90deg, rgba(200,72,46,0.4), #C8482E)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => openDrill(g.id)}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 10,
                          background: 'rgba(200,72,46,0.08)',
                          border: '1px solid rgba(200,72,46,0.2)', color: '#DF5438',
                          fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                        className="hover:bg-red-500/20"
                      >
                        <Heart size={12} fill="#DF5438" color="#DF5438" />
                        Voir les favoris
                      </button>
                      <Link href={`/dashboard/gallery/${g.id}`} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                        <button
                          style={{
                            padding: '10px 14px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            color: '#8E8E93', fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          className="hover:bg-white/[0.08] hover:text-white"
                          title="Ouvrir la galerie"
                        >
                          <FolderOpen size={13} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
              {galleriesWithFavs.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center', color: '#8E8E93', fontSize: 14 }}>
                  Aucun favori par galerie.
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Volumétrie */}
        <div style={{ position: 'relative', background: 'rgba(14,14,14,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4' }}>
              {drillGallery ? 'Galerie sélectionnée' : 'Volumétrie'}
            </span>
            <Heart size={16} color="#DF5438" fill="#DF5438" />
          </div>
          {loading ? <Skeleton h={80} /> : (
            <>
              <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1, marginBottom: 8 }}>
                {fmtNumber(drillGallery ? contextPhotos.length : totalFavs)}
              </div>
              <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 20 }}>
                {drillGallery ? `Favoris — ${drillData?.title}` : 'Photos sélectionnées au total'}
              </div>

              {!drillGallery && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{galleries.length}</div>
                    <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>Galeries actives</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{galleriesWithFavs.length}</div>
                    <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>Avec favoris</div>
                  </div>
                </div>
              )}

              {drillGallery && selected.size > 0 && (
                <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: '#C8482E', fontWeight: 600 }}>
                  {selected.size} photo{selected.size !== 1 ? 's' : ''} sélectionnée{selected.size !== 1 ? 's' : ''}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action téléchargement */}
        <div style={{ background: 'linear-gradient(135deg, rgba(200,72,46,0.12) 0%, rgba(200,72,46,0.03) 100%)', border: '1px solid rgba(200,72,46,0.25)', borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,72,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={18} color="#DF5438" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#F2EDE4', letterSpacing: '-0.01em' }}>Exportation</span>
          </div>
          <p style={{ fontSize: 13, color: '#A09890', marginBottom: 24, lineHeight: 1.6, position: 'relative' }}>
            {selected.size > 0
              ? `${selected.size} photo${selected.size !== 1 ? 's' : ''} sélectionnée${selected.size !== 1 ? 's' : ''}.`
              : drillGallery
                ? `Exporter les ${contextPhotos.length} favoris de "${drillData?.title}".`
                : `Téléchargez toutes vos photos favorites (${totalFavs}) dans une archive ZIP.`}
          </p>
          <button
            onClick={handleDownload}
            disabled={downloading || done || (drillGallery ? contextPhotos.length === 0 : photos.length === 0)}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              fontWeight: 700, fontSize: 14, position: 'relative',
              cursor: (drillGallery ? contextPhotos.length === 0 : photos.length === 0) ? 'not-allowed' : 'pointer',
              background: done ? '#22C55E' : 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: done ? 'none' : '0 4px 16px rgba(200,72,46,0.4)',
              opacity: (drillGallery ? contextPhotos.length === 0 : photos.length === 0) ? 0.5 : 1,
            }}
          >
            {done
              ? <><Check size={16} /> Fichier ZIP prêt</>
              : downloading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Création ZIP...</>
                : <><Download size={16} /> {selected.size > 0 ? 'Exporter la sélection' : 'Tout exporter en ZIP'}</>
            }
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              style={{ background: 'none', border: 'none', color: '#8E8E93', fontSize: 12, fontWeight: 500, width: '100%', marginTop: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' }}
              className="hover:underline hover:text-white"
            >
              <X size={12} /> Désélectionner tout
            </button>
          )}
        </div>

        {/* Lien galerie quand en mode drill */}
        {drillGallery && (
          <Link href={`/dashboard/gallery/${drillGallery}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
              className="hover:bg-white/[0.05]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FolderOpen size={15} color="#8E8E93" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F2EDE4' }}>Ouvrir la galerie complète</div>
                  <div style={{ fontSize: 11, color: '#8E8E93' }}>Voir toutes les photos</div>
                </div>
              </div>
              <ChevronRight size={14} color="#8E8E93" />
            </div>
          </Link>
        )}
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
          .favorites-masonry > div { margin-bottom: 8px !important; border-radius: 8px !important; }
          .favorites-header { flex-direction: column !important; align-items: flex-start !important; }
          .favorites-drill-controls { width: 100% !important; }
          .favorites-drill-controls button { flex: 1 !important; }
        }
        @media (max-width: 480px) {
          .favorites-masonry { columns: 2 !important; gap: 6px !important; }
          .favorites-masonry > div { margin-bottom: 6px !important; border-radius: 6px !important; }
        }
      `}</style>
    </div>
  )
}
