'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Heart, Download, Image, TrendingUp, Loader2, ArrowUpRight } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { createClient } from '@/lib/supabase/client'
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
  return <div style={{ height: h, width: w, borderRadius: 8, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

function MiniTrend({ color = '#fff' }: { color?: string }) {
  const pts = [20, 35, 28, 50, 42, 60, 48, 72].map((y, x) => `${x * 14},${72 - y}`).join(' ')
  return (
    <svg width="60" height="24" viewBox="0 0 96 72" style={{ opacity: 0.6 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  const supabase = createClient()

  useEffect(() => {
    let channel: any = null;

    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        setGalleries(d.galleries ?? [])
        setTotals(d.totals ?? null)
        setRecentViews(d.recentViews ?? [])
        setRecentFavs(d.recentFavorites ?? [])
        setLoading(false)

        // ── TEMPS RÉEL (REALTIME) ──
        const galleryIds = (d.galleries ?? []).map((g: any) => g.id);
        
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
          supabase.removeChannel(channel);
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
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: '#fff', marginBottom: 4 }}>Analytiques</h1>
              <p style={{ fontSize: 14, color: '#8E8E93' }}>Performances globales de vos galeries</p>
            </div>
            
            {/* Période */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: period === p ? '#fff' : 'transparent', color: period === p ? '#000' : '#8E8E93', transition: 'all 0.2s' }}>{p}</button>
              ))}
            </div>
          </motion.div>

          {/* Stats cards (Minimalist) */}
          <motion.div variants={stagger} className="stats-grid">
            {[
              { label: 'Vues totales', val: totals?.views ?? 0, icon: Eye, color: '#fff' },
              { label: 'Photos publiées', val: totals?.photos ?? 0, icon: Image, color: '#fff' },
              { label: 'Favoris reçus', val: totals?.favorites ?? 0, icon: Heart, color: '#fff' },
              { label: 'Téléchargements', val: totals?.downloads ?? 0, icon: Download, color: '#fff' },
            ].map(s => (
              <motion.div key={s.label} variants={fadeUp} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <s.icon size={15} color="#8E8E93" />
                    <span style={{ fontSize: 13, color: '#8E8E93', fontWeight: 500 }}>{s.label}</span>
                  </div>
                </div>
                {loading ? <Skeleton h={28} w="50%" /> : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 28, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{fmtNumber(s.val)}</div>
                    <MiniTrend color={s.color} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <div className="bottom-grid">
            {/* Top galeries */}
            <motion.div variants={fadeUp} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Performances des galeries</div>
                {loading && <Loader2 size={14} color="#8E8E93" style={{ animation: 'spin 1s linear infinite' }} />}
              </div>
              
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ marginBottom: 16 }}><Skeleton h={48} /></div>)
              ) : galleries.length === 0 ? (
                <p style={{ fontSize: 13, color: '#8E8E93', textAlign: 'center', padding: '16px 0' }}>Aucune galerie active</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {galleries.slice(0, 6).map(g => (
                    <Link key={g.id} href={`/dashboard/gallery/${g.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }} className="group">
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                        {g.cover_image_url && <img src={g.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                          <span style={{ fontSize: 13, color: '#8E8E93', fontWeight: 500 }}>{fmtNumber(g.view_count)} vues</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(g.view_count / maxViews) * 100}%`, background: '#fff', borderRadius: 99 }} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Activité récente */}
            <motion.div variants={fadeUp} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Flux d'activité</div>
              
              <div style={{ position: 'relative' }}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ marginBottom: 16 }}><Skeleton h={40} /></div>)
                ) : activity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <TrendingUp size={24} color="#8E8E93" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 13, color: '#8E8E93' }}>Aucune activité récente.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <AnimatePresence>
                      {activity.map((a, i) => (
                        <motion.div 
                          key={`${a.type}-${a.time}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.type === 'view' ? 'rgba(255,255,255,0.05)' : 'rgba(200,72,46,0.1)', border: a.type === 'view' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {a.type === 'view' ? <Eye size={14} color="#fff" /> : <Heart size={14} color="#C8482E" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, margin: 0, color: '#fff' }}>
                              {a.type === 'view' ? 'Nouvelle visite' : 'Nouveau favori'}
                              <span style={{ color: '#8E8E93' }}> dans </span>
                              <span style={{ fontWeight: 500 }}>{a.gallery}</span>
                            </p>
                          </div>
                          <span style={{ fontSize: 12, color: '#8E8E93', flexShrink: 0 }}>{timeAgo(a.time)}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="page-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Résumé Insights */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Insights</div>
          {loading ? (
            <Skeleton h={80} />
          ) : galleries.length === 0 ? (
            <p style={{ fontSize: 13, color: '#8E8E93' }}>Données insuffisantes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Galeries créées', val: galleries.length },
                { label: 'Moy. vues/galerie', val: fmtNumber(Math.round((totals?.views ?? 0) / Math.max(galleries.length, 1))) },
                { label: 'Taux d\'engagement', val: totals && totals.views > 0 ? `${(((totals.favorites + totals.downloads) / totals.views) * 100).toFixed(1)}%` : '0%' },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8E8E93', fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action card */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', color: '#000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TrendingUp size={16} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Augmentez votre portée</span>
          </div>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 16, lineHeight: 1.5 }}>
            Les galeries partagées sur les réseaux sociaux génèrent 3x plus d'engagement.
          </p>
          <Link href="/dashboard/galleries" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: '#f5f5f5', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Ouvrir une galerie <ArrowUpRight size={14} />
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        
        .page-layout { display: grid; grid-template-columns: 1fr 280px; }
        .page-main { padding: 32px; border-right: 1px solid rgba(255,255,255,0.06); overflow-x: hidden; }
        .page-sidebar { padding: 32px 24px; position: sticky; top: 58px; max-height: calc(100vh - 58px); overflow-y: auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

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
