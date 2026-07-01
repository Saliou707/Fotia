'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Download, Check, Loader2, Image as ImageIcon } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { createClient } from '@/lib/supabase/client'
import { getImageUrl, fmtNumber } from '@/lib/api'

interface FavPhoto {
  id: string
  image_id: string
  gallery_id: string
  created_at: string
  r2_key: string
  original_filename: string
  gallery_title: string
}

interface GalleryStat {
  id: string
  title: string
  favorite_count: number
}

function Skeleton({ h = 140 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 10, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<FavPhoto[]>([])
  const [galleries, setGalleries] = useState<GalleryStat[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)
  const [tab, setTab] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Récupérer toutes les galeries du photographe
      const { data: myGalleries } = await supabase
        .from('galleries')
        .select('id, title, favorite_count')
        .eq('user_id', user.id)
        .order('favorite_count', { ascending: false })

      if (!myGalleries || myGalleries.length === 0) {
        setLoading(false)
        return
      }

      setGalleries(myGalleries)
      const galleryIds = myGalleries.map(g => g.id)

      // Récupérer les favoris avec les infos images
      const { data: favs } = await supabase
        .from('favorites')
        .select('id, image_id, gallery_id, created_at, gallery_images(r2_key, original_filename)')
        .in('gallery_id', galleryIds)
        .order('created_at', { ascending: false })
        .limit(200)

      if (favs) {
        const mapped: FavPhoto[] = favs
          .filter(f => f.gallery_images)
          .map(f => {
            const img = (Array.isArray(f.gallery_images) ? f.gallery_images[0] : f.gallery_images) as { r2_key: string; original_filename: string }
            const galleryTitle = myGalleries.find(g => g.id === f.gallery_id)?.title ?? '–'
            return {
              id: f.id, image_id: f.image_id, gallery_id: f.gallery_id,
              created_at: f.created_at, r2_key: img.r2_key,
              original_filename: img.original_filename, gallery_title: galleryTitle,
            }
          })
        setPhotos(mapped)
      }

      // ── TEMPS RÉEL (REALTIME) ──
      const channel = supabase.channel(`realtime_favorites_page_${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'favorites' }, async (payload) => {
          if (!galleryIds.includes(payload.new.gallery_id)) return;
          
          // Récupérer les infos de l'image liée au favori
          const { data: img } = await supabase.from('gallery_images').select('r2_key, original_filename').eq('id', payload.new.image_id).single();
          if (img) {
            const galleryTitle = myGalleries.find(g => g.id === payload.new.gallery_id)?.title ?? '–';
            const newFav: FavPhoto = {
              id: payload.new.id,
              image_id: payload.new.image_id,
              gallery_id: payload.new.gallery_id,
              created_at: payload.new.created_at,
              r2_key: img.r2_key,
              original_filename: img.original_filename,
              gallery_title: galleryTitle
            };
            setPhotos(prev => [newFav, ...prev]);
            setGalleries(prev => prev.map(g => g.id === payload.new.gallery_id ? { ...g, favorite_count: g.favorite_count + 1 } : g));
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'favorites' }, (payload) => {
          setPhotos(prev => prev.filter(p => p.id !== payload.old.id));
          // Note: On pourrait décrémenter favorite_count ici, mais par sécurité on laisse tel quel ou on force un refetch
        })
        .subscribe();

      setLoading(false)

      return () => {
        supabase.removeChannel(channel);
      }
    }
    
    let cleanup: (() => void) | void;
    load().then(res => { if (res) cleanup = res });
    return () => { if (cleanup) cleanup() }
  }, [])

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleDownload = async () => {
    const targets = photos.filter(p => selected.size === 0 || selected.has(p.id))
    if (targets.length === 0) return
    setDownloading(true)
    // Ouvrir les URLs dans de nouveaux onglets (téléchargement direct R2)
    for (const p of targets.slice(0, 10)) {
      const url = getImageUrl(p.r2_key)
      const a = document.createElement('a')
      a.href = url; a.download = p.original_filename; a.target = '_blank'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      await new Promise(r => setTimeout(r, 300))
    }
    setDownloading(false); setDone(true)
    setTimeout(() => setDone(false), 2500)
  }

  const totalFavs = photos.length
  const totalViews = galleries.reduce((s, g) => s + 0, 0) // placeholder
  const maxFav = Math.max(...galleries.map(g => g.favorite_count), 1)

  const TABS = ['Tous les favoris', 'Par galerie']

  return (
    <div className="page-layout" style={{ minHeight: 'calc(100vh - 58px)' }}>

      {/* ── GAUCHE ── */}
      <div className="page-main">
        <motion.div initial="hidden" animate="show" variants={stagger}>

          {/* Header */}
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Favoris</h1>
              <Heart size={20} color="#C8482E" fill="#C8482E" />
            </div>
            <p style={{ fontSize: 14, color: '#6B6B6B' }}>
              Photos sélectionnées par vos clients dans toutes vos galeries.
            </p>
          </motion.div>

          {/* Tabs + contrôles */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: tab === i ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === i ? '#F7F7F5' : '#6B6B6B', transition: 'all 0.15s' }}>
                  {t}
                  {i === 0 && !loading && <span style={{ marginLeft: 6, fontSize: 11, color: '#C8482E', fontWeight: 600 }}>{totalFavs}</span>}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#6B6B6B' }}>
              {loading ? '–' : `${totalFavs} photo${totalFavs !== 1 ? 's' : ''} favori${totalFavs !== 1 ? 's' : ''}`}
            </span>
          </motion.div>

          {/* Contenu */}
          {loading ? (
            <div style={{ columns: '5 160px', gap: 10 }}>
              {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} h={i % 3 === 0 ? 180 : 130} />)}
            </div>
          ) : photos.length === 0 ? (
            <motion.div variants={fadeUp} style={{ textAlign: 'center', padding: '80px 24px' }}>
              <Heart size={48} color="#333" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aucun favori pour l'instant</h3>
              <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 24, maxWidth: 360, margin: '0 auto' }}>
                Partagez vos galeries avec vos clients. Quand ils sélectionneront leurs photos favorites, elles apparaîtront ici.
              </p>
              <Link href="/dashboard/galleries">
                <button style={{ padding: '10px 24px', borderRadius: 10, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 16 }}>
                  Voir mes galeries
                </button>
              </Link>
            </motion.div>
          ) : tab === 0 ? (
            // Vue: tous les favoris
            <motion.div variants={stagger} style={{ columns: '5 160px', gap: 10 }}>
              {photos.map(photo => (
                <motion.div key={photo.id} variants={fadeUp}
                  style={{ marginBottom: 10, position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', breakInside: 'avoid', border: selected.has(photo.id) ? '2px solid #C8482E' : '2px solid transparent', transition: 'border 0.15s' }}
                  onClick={() => toggle(photo.id)}>
                  <img
                    src={getImageUrl(photo.r2_key)}
                    alt={photo.original_filename}
                    loading="lazy"
                    style={{ width: '100%', display: 'block' }}
                  />
                  {/* Badge cœur */}
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(200,72,46,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={12} color="#fff" fill="#fff" />
                  </div>
                  {/* Sélectionné */}
                  {selected.has(photo.id) && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#C8482E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={13} color="#fff" />
                      </div>
                    </div>
                  )}
                  {/* Info overlay */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    <div style={{ fontSize: 10, color: '#F7F7F5', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.original_filename}</div>
                    <div style={{ fontSize: 10, color: '#A1A1AA' }}>{photo.gallery_title}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // Vue: par galerie
            <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {galleries.filter(g => g.favorite_count > 0).map(g => (
                <motion.div key={g.id} variants={fadeUp} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{g.title}</div>
                    <div style={{ fontSize: 13, color: '#6B6B6B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Heart size={12} color="#C8482E" fill="#C8482E" /> {g.favorite_count} favori{g.favorite_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Link href={`/dashboard/gallery/${g.id}`} style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.3)', color: '#C8482E', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Gérer →
                    </button>
                  </Link>
                </motion.div>
              ))}
              {galleries.filter(g => g.favorite_count > 0).length === 0 && (
                <p style={{ fontSize: 14, color: '#4B4B4B', textAlign: 'center', padding: '40px 0' }}>Aucun favori dans vos galeries</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Aperçu */}
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Aperçu</span>
            <Heart size={16} color="#C8482E" fill="#C8482E" />
          </div>
          {loading ? <Skeleton h={80} /> : (
            <>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4 }}>{fmtNumber(totalFavs)}</div>
              <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 18 }}>Favoris totaux</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{galleries.length}</div>
                  <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Galeries</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{galleries.filter(g => g.favorite_count > 0).length}</div>
                  <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Avec favoris</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Top galeries */}
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top galeries</div>
          {loading ? <Skeleton h={100} /> : galleries.length === 0 ? (
            <p style={{ fontSize: 13, color: '#4B4B4B' }}>Aucune galerie</p>
          ) : galleries.slice(0, 5).map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
                  <div style={{ height: '100%', width: `${(g.favorite_count / maxFav) * 100}%`, background: '#C8482E', borderRadius: 99 }} />
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#A1A1AA', marginLeft: 12, flexShrink: 0 }}>{g.favorite_count}</span>
            </div>
          ))}
        </div>

        {/* Télécharger favoris */}
        <div style={{ background: 'linear-gradient(135deg, rgba(200,72,46,0.15), rgba(200,50,10,0.25))', border: '1px solid rgba(200,72,46,0.3)', borderRadius: 14, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Heart size={16} color="#C8482E" fill="#C8482E" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Télécharger les favoris</span>
          </div>
          <p style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 16, lineHeight: 1.6 }}>
            {selected.size > 0
              ? `${selected.size} photo${selected.size !== 1 ? 's' : ''} sélectionnée${selected.size !== 1 ? 's' : ''}.`
              : `Toutes les photos favorites (${totalFavs}).`}
          </p>
          <button
            onClick={handleDownload}
            disabled={downloading || done || photos.length === 0}
            style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: photos.length === 0 ? 'not-allowed' : 'pointer', background: done ? '#22C55E' : '#C8482E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.3s', opacity: photos.length === 0 ? 0.5 : 1 }}>
            {done ? <><Check size={15} /> Téléchargé !</> : downloading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Préparation...</> : <><Download size={15} /> {selected.size > 0 ? 'Télécharger la sélection' : 'Tout télécharger'}</>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        
        .page-layout { display: grid; grid-template-columns: 1fr 280px; }
        .page-main { padding: 28px; border-right: 1px solid rgba(255,255,255,0.06); }
        .page-sidebar { padding: 28px 22px; position: sticky; top: 58px; max-height: calc(100vh - 58px); overflow-y: auto; }
        
        @media (max-width: 1024px) {
          .page-layout { grid-template-columns: 1fr !important; }
          .page-main { padding: 24px 16px !important; border-right: none !important; }
          .page-sidebar { padding: 24px 16px !important; position: relative !important; top: 0 !important; max-height: none !important; overflow-y: visible !important; border-top: 1px solid rgba(255,255,255,0.06); }
        }
      `}</style>
    </div>
  )
}

