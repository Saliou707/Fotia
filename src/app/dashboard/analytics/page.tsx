'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Heart, Download, Image, TrendingUp, Loader2 } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { fmtNumber } from '@/lib/api'

interface AnalyticsGallery {
  id: string; title: string; view_count: number
  favorite_count: number; download_count: number
  photo_count: number; created_at: string; cover_image_url: string | null
}
interface Totals { views: number; favorites: number; downloads: number; photos: number }
interface RecentItem { gallery_id: string; created_at: string; galleries: { title: string } | null }

const PERIODS = ['7J', '30J', '90J', '12M']

function Skeleton({ h = 16, w = '100%' }: { h?: number; w?: string | number }) {
  return <div style={{ height: h, width: w, borderRadius: 8, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

function MiniSparkline({ color = '#C8482E' }: { color?: string }) {
  const pts = [20, 35, 28, 50, 42, 60, 48, 72].map((y, x) => `${x * 14},${72 - y}`).join(' ')
  return (
    <svg width="96" height="36" viewBox="0 0 96 72" style={{ opacity: 0.8 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ViewsChart({ galleries }: { galleries: AnalyticsGallery[] }) {
  const maxVal = Math.max(...galleries.map(g => g.view_count), 1)
  const w = 480, h = 140
  if (galleries.length === 0) return <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B4B4B', fontSize: 13 }}>Aucune donnée</div>

  const sorted = [...galleries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const pts = sorted.map((g, i) => `${(i / Math.max(sorted.length - 1, 1)) * w},${h - (g.view_count / maxVal) * h}`).join(' ')
  const fillPts = `0,${h} ${pts} ${w},${h}`

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', height: 140 }}>
        <defs>
          <linearGradient id="vg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8482E" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C8482E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill="url(#vg2)" />
        <polyline points={pts} fill="none" stroke="#C8482E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {sorted.map(g => (
          <span key={g.id} style={{ fontSize: 10, color: '#4B4B4B', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
        ))}
      </div>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l\'instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30J')
  const [loading, setLoading] = useState(true)
  const [galleries, setGalleries] = useState<AnalyticsGallery[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [recentViews, setRecentViews] = useState<RecentItem[]>([])
  const [recentFavs, setRecentFavs] = useState<RecentItem[]>([])

  useEffect(() => {
    let channel: any = null;

    fetch('/api/analytics')
      .then(r => r.json())
      .then(async d => {
        setGalleries(d.galleries ?? [])
        setTotals(d.totals ?? null)
        setRecentViews(d.recentViews ?? [])
        setRecentFavs(d.recentFavorites ?? [])
        setLoading(false)

        // ── TEMPS RÉEL (REALTIME) ──
        const galleryIds = (d.galleries ?? []).map((g: any) => g.id);
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        channel = supabase.channel(`realtime_analytics_page_${Date.now()}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'favorites' }, (payload) => {
             if (galleryIds.includes(payload.new.gallery_id)) {
                setTotals(prev => prev ? { ...prev, favorites: prev.favorites + 1 } : prev);
                setGalleries(prev => prev.map(g => g.id === payload.new.gallery_id ? { ...g, favorite_count: g.favorite_count + 1 } : g));
                
                const gTitle = (d.galleries ?? []).find((g: any) => g.id === payload.new.gallery_id)?.title ?? '–';
                setRecentFavs(prev => [{ gallery_id: payload.new.gallery_id, created_at: payload.new.created_at, galleries: { title: gTitle } }, ...prev]);
             }
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'downloads' }, (payload) => {
             if (galleryIds.includes(payload.new.gallery_id)) {
                setTotals(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : prev);
                setGalleries(prev => prev.map(g => g.id === payload.new.gallery_id ? { ...g, download_count: g.download_count + 1 } : g));
             }
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery_views' }, (payload) => {
             if (galleryIds.includes(payload.new.gallery_id)) {
                setTotals(prev => prev ? { ...prev, views: prev.views + 1 } : prev);
                setGalleries(prev => prev.map(g => g.id === payload.new.gallery_id ? { ...g, view_count: g.view_count + 1 } : g));
                
                const gTitle = (d.galleries ?? []).find((g: any) => g.id === payload.new.gallery_id)?.title ?? '–';
                setRecentViews(prev => [{ gallery_id: payload.new.gallery_id, created_at: payload.new.created_at, galleries: { title: gTitle } }, ...prev]);
             }
          })
          .subscribe();
      })
      .catch(() => setLoading(false))
      
      return () => {
        if (channel) {
          import('@/lib/supabase/client').then(({ createClient }) => createClient().removeChannel(channel));
        }
      }
  }, [])

  const maxViews = Math.max(...galleries.map(g => g.view_count), 1)

  // Fusionner activité récente
  const activity = [
    ...recentViews.map(v => ({ type: 'view' as const, gallery: v.galleries?.title ?? '–', time: v.created_at })),
    ...recentFavs.map(f => ({ type: 'fav' as const, gallery: f.galleries?.title ?? '–', time: f.created_at })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

  return (
    <div className="page-layout" style={{ minHeight: 'calc(100vh - 58px)' }}>

      {/* ── MAIN ── */}
      <div className="page-main">
        <motion.div initial="hidden" animate="show" variants={stagger}>

          {/* Header */}
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Analytiques</h1>
            <p style={{ fontSize: 14, color: '#6B6B6B' }}>Suivez les performances de vos galeries en temps réel.</p>
          </motion.div>

          {/* Période */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 24 }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: period === p ? '#C8482E' : 'transparent', color: period === p ? '#fff' : '#6B6B6B', transition: 'all 0.15s' }}>{p}</button>
            ))}
          </motion.div>

          {/* Stats cards */}
          <motion.div variants={stagger} className="stats-grid">
            {[
              { label: 'Vues totales', val: totals?.views ?? 0, icon: Eye, color: '#22C55E' },
              { label: 'Photos totales', val: totals?.photos ?? 0, icon: Image, color: '#3B82F6' },
              { label: 'Favoris', val: totals?.favorites ?? 0, icon: Heart, color: '#C8482E' },
              { label: 'Téléchargements', val: totals?.downloads ?? 0, icon: Download, color: '#8B5CF6' },
            ].map(s => (
              <motion.div key={s.label} variants={fadeUp} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <s.icon size={14} color={s.color} />
                  <span style={{ fontSize: 12, color: '#6B6B6B' }}>{s.label}</span>
                </div>
                {loading ? <Skeleton h={28} /> : (
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>{fmtNumber(s.val)}</div>
                )}
                <div style={{ marginTop: 10 }}>
                  <MiniSparkline color={s.color} />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Graphique vues */}
          <motion.div variants={fadeUp} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Vues par galerie</span>
              {loading && <Loader2 size={14} color="#6B6B6B" style={{ animation: 'spin 1s linear infinite' }} />}
            </div>
            {loading ? <Skeleton h={140} /> : <ViewsChart galleries={galleries} />}
          </motion.div>

          {/* Top galeries + Activité récente */}
          <div className="bottom-grid">

            {/* Top galeries */}
            <motion.div variants={fadeUp} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top galeries</div>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={40} />)
              ) : galleries.length === 0 ? (
                <p style={{ fontSize: 13, color: '#4B4B4B', textAlign: 'center', padding: '16px 0' }}>Aucune galerie</p>
              ) : galleries.slice(0, 5).map(g => (
                <Link key={g.id} href={`/dashboard/gallery/${g.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1A1A1A', overflow: 'hidden', flexShrink: 0 }}>
                      {g.cover_image_url && <img src={g.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#F7F7F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{g.title}</div>
                      <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
                        <div style={{ height: '100%', width: `${(g.view_count / maxViews) * 100}%`, background: '#C8482E', borderRadius: 99 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: '#6B6B6B', flexShrink: 0 }}>{fmtNumber(g.view_count)}</span>
                  </div>
                </Link>
              ))}
            </motion.div>

            {/* Activité récente */}
            <motion.div variants={fadeUp} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Activité récente</div>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={40} />)
              ) : activity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <TrendingUp size={24} color="#333" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: '#4B4B4B' }}>Aucune activité pour l'instant.</p>
                  <p style={{ fontSize: 12, color: '#333', marginTop: 4 }}>Partagez vos galeries pour commencer à voir des stats.</p>
                </div>
              ) : activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: a.type === 'view' ? 'rgba(34,197,94,0.15)' : 'rgba(200,72,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {a.type === 'view' ? <Eye size={13} color="#22C55E" /> : <Heart size={13} color="#C8482E" />}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5, color: '#A1A1AA' }}>
                      {a.type === 'view' ? 'Visite sur ' : 'Favori dans '}
                      <strong style={{ color: '#C8482E' }}>{a.gallery}</strong>
                    </p>
                    <span style={{ fontSize: 11, color: '#4B4B4B' }}>{timeAgo(a.time)}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Résumé par galerie */}
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Résumé</div>
          {loading ? (
            <Skeleton h={80} />
          ) : galleries.length === 0 ? (
            <p style={{ fontSize: 13, color: '#4B4B4B', textAlign: 'center' }}>Créez votre première galerie pour voir des statistiques.</p>
          ) : (
            <>
              {[
                { label: 'Galeries actives', val: galleries.length },
                { label: 'Moy. vues / galerie', val: fmtNumber(Math.round((totals?.views ?? 0) / Math.max(galleries.length, 1))) },
                { label: 'Taux de favori', val: totals && totals.views > 0 ? `${((totals.favorites / totals.views) * 100).toFixed(1)}%` : '0%' },
                { label: 'Taux de téléchargement', val: totals && totals.views > 0 ? `${((totals.downloads / totals.views) * 100).toFixed(1)}%` : '0%' },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                  <span style={{ color: '#6B6B6B' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Partage */}
        <div style={{ background: 'linear-gradient(135deg, rgba(200,72,46,0.12), rgba(200,50,10,0.2))', border: '1px solid rgba(200,72,46,0.25)', borderRadius: 14, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <TrendingUp size={16} color="#C8482E" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Boostez vos vues</span>
          </div>
          <p style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 16, lineHeight: 1.6 }}>
            Partagez vos galeries sur WhatsApp pour augmenter votre taux d'engagement.
          </p>
          <Link href="/dashboard/galleries" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: '#C8482E', color: '#fff' }}>
              Partager une galerie
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        
        .page-layout { display: grid; grid-template-columns: 1fr 280px; }
        .page-main { padding: 28px; border-right: 1px solid rgba(255,255,255,0.06); overflow-x: hidden; }
        .page-sidebar { padding: 28px 22px; position: sticky; top: 58px; max-height: calc(100vh - 58px); overflow-y: auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        @media (max-width: 1024px) {
          .page-layout { grid-template-columns: 1fr !important; }
          .page-main { padding: 24px 16px !important; border-right: none !important; }
          .page-sidebar { padding: 24px 16px !important; position: relative !important; top: 0 !important; max-height: none !important; overflow-y: visible !important; border-top: 1px solid rgba(255,255,255,0.06); }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

