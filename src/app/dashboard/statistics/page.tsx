'use client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, Heart, Image as ImageIcon,
  Download, TrendingUp, Camera,
  ChevronDown, Activity, Search, X, Clock
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Gallery {
  id: string
  title: string
  view_count: number
  favorite_count: number
  download_count: number
  photo_count: number
  created_at: string
  cover_image_url?: string
}

interface Totals {
  views: number
  favorites: number
  downloads: number
  photos: number
}

interface RecentEvent {
  gallery_id: string
  created_at: string
  galleries: { title: string } | null
}

interface AnalyticsData {
  galleries: Gallery[]
  totals: Totals
  recentViews: RecentEvent[]
  recentFavorites: RecentEvent[]
}

interface TimelineEvent {
  id: string
  type: 'view' | 'favorite'
  gallery_title: string
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

const PERIODS = [
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
  { label: 'Tout', value: 0 },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function Skeleton({ h = 80, radius = 12 }: { h?: number; radius?: number }) {
  return <div style={{ height: h, borderRadius: radius, background: 'rgba(255,255,255,0.05)', animation: 'statPulse 1.5s ease-in-out infinite' }} />
}

function KpiCard({
  icon: Icon, label, value, accent, sub, loading, delay = 0,
}: {
  icon: React.ElementType; label: string; value: number
  accent: string; sub?: string; loading?: boolean; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay }}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '24px',
        position: 'relative', overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}
      className="kpi-card"
    >
      {/* Background glow plus subtil et large */}
      <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${accent}22 0%, transparent 60%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `linear-gradient(135deg, ${accent}22, ${accent}0A)`,
          border: `1px solid ${accent}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 24px ${accent}1A`
        }}>
          <Icon size={22} color={accent} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#22C55E',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          padding: '4px 10px', borderRadius: 99, letterSpacing: '0.06em',
          display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase'
        }}>
          <Activity size={10} /> Live
        </span>
      </div>

      {loading ? (
        <>
          <Skeleton h={42} radius={8} />
          <div style={{ marginTop: 8 }}><Skeleton h={14} radius={6} /></div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', color: '#FFF', lineHeight: 1, fontFamily: 'var(--font-inter, sans-serif)' }}>
            {fmtNum(value)}
          </div>
          <div style={{ fontSize: 13, color: '#A1A1AA', marginTop: 10, fontWeight: 500 }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: accent, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
        </>
      )}
    </motion.div>
  )
}

function RankingRow({ title, views, favorites, rank }: {
  title: string; views: number; favorites: number; rank: number
}) {
  const isTop3 = rank < 3;
  const badgeColors = ['#FBBF24', '#94A3B8', '#B45309']; // Or, Argent, Bronze
  const badgeColor = isTop3 ? badgeColors[rank] : '#52525B';
  const badgeBg = isTop3 ? `${badgeColor}1A` : 'rgba(255,255,255,0.04)';
  const badgeBorder = isTop3 ? `${badgeColor}4D` : 'rgba(255,255,255,0.08)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.04 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.2s', gap: 16
      }}
      className="ranking-row"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800
        }}>
          {rank + 1}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </div>
      </div>
      
      <div className="ranking-stats" style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#F2EDE4' }}>{fmtNum(views)}</span>
          <span style={{ fontSize: 10, color: '#8E8E93', display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={9} /> vues</span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} className="ranking-divider" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 46 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#F2EDE4' }}>{fmtNum(favorites)}</span>
          <span style={{ fontSize: 10, color: '#8E8E93', display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={9} /> favs</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StatisticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Filtres ──
  const [periodDays, setPeriodDays] = useState(30)
  const [galleryFilter, setGalleryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'views' | 'favorites' | 'downloads' | 'photos'>('views')
  const [searchGallery, setSearchGallery] = useState('')

  const [galleryOpen, setGalleryOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics')
      const d = await res.json()
      setData(d)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()

    // ── Supabase Realtime : auto-refresh when a new view or favorite is recorded ──
    const channel = supabase
      .channel('stats-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gallery_views' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'favorites' },
        () => loadData()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Filtrage ──
  const filteredGalleries = useMemo(() => {
    if (!data) return []
    let list = data.galleries || []

    if (galleryFilter !== 'all') {
      list = list.filter(g => g.id === galleryFilter)
    }

    if (searchGallery.trim()) {
      list = list.filter(g => g.title.toLowerCase().includes(searchGallery.toLowerCase()))
    }

    return [...list].sort((a, b) => (b[sortBy === 'favorites' ? 'favorite_count' : sortBy === 'downloads' ? 'download_count' : sortBy === 'photos' ? 'photo_count' : 'view_count'] ?? 0) - (a[sortBy === 'favorites' ? 'favorite_count' : sortBy === 'downloads' ? 'download_count' : sortBy === 'photos' ? 'photo_count' : 'view_count'] ?? 0))
  }, [data, galleryFilter, sortBy, searchGallery])

  const filteredTotals = useMemo(() => ({
    views: filteredGalleries.reduce((s, g) => s + (g.view_count ?? 0), 0),
    favorites: filteredGalleries.reduce((s, g) => s + (g.favorite_count ?? 0), 0),
    downloads: filteredGalleries.reduce((s, g) => s + (g.download_count ?? 0), 0),
    photos: filteredGalleries.reduce((s, g) => s + (g.photo_count ?? 0), 0),
  }), [filteredGalleries])

  // ── Timeline Events ──
  const timelineEvents = useMemo(() => {
    if (!data) return []
    const events: TimelineEvent[] = [
      ...(data.recentViews || []).map((v, i) => ({ id: `v-${i}-${v.created_at}`, type: 'view' as const, gallery_title: v.galleries?.title || 'Galerie supprimée', created_at: v.created_at })),
      ...(data.recentFavorites || []).map((f, i) => ({ id: `f-${i}-${f.created_at}`, type: 'favorite' as const, gallery_title: f.galleries?.title || 'Galerie supprimée', created_at: f.created_at }))
    ]
    events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return events.slice(0, 15) // Garder les 15 plus récents
  }, [data])

  const galleryLabel = galleryFilter === 'all' ? 'Toutes les galeries' : (data?.galleries.find(g => g.id === galleryFilter)?.title ?? '...')
  const sortLabel = { views: 'Vues', favorites: 'Favoris', downloads: 'Téléch.', photos: 'Photos' }[sortBy]

  const activeFiltersCount = (galleryFilter !== 'all' ? 1 : 0) + (searchGallery ? 1 : 0) + (periodDays !== 30 ? 1 : 0)

  return (
    <div className="stats-page" style={{ padding: '36px', minHeight: 'calc(100vh - 58px)', background: '#111111', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
      {/* ── Header & Segmented Control ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 32 }}>
        <div className="stats-header-wrap" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: '#FFF', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              Statistiques
              {activeFiltersCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(200,72,46,0.15)', border: '1px solid rgba(200,72,46,0.3)', color: '#C8482E', borderRadius: 99, padding: '3px 10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Filtré
                </span>
              )}
            </h1>
            <p style={{ fontSize: 15, color: '#A1A1AA', margin: 0 }}>Suivez l&apos;engagement de vos clients en temps réel.</p>
          </div>

          {/* Segmented Control Période */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriodDays(p.value)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: periodDays === p.value ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: periodDays === p.value ? '#FFF' : '#A1A1AA',
                  fontSize: 13, fontWeight: periodDays === p.value ? 600 : 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: periodDays === p.value ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Filtres Secondaires ── */}
      <motion.div className="stats-filters-row"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}
      >
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setGalleryOpen(o => !o); setSortOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: galleryFilter !== 'all' ? 'rgba(200,72,46,0.1)' : 'rgba(255,255,255,0.03)', color: galleryFilter !== 'all' ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', maxWidth: 240, backdropFilter: 'blur(8px)' }}
          >
            <Camera size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{galleryLabel}</span>
            <ChevronDown size={14} style={{ transform: galleryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, opacity: 0.5 }} />
          </button>
          <AnimatePresence>
            {galleryOpen && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                style={{ position: 'absolute', top: 48, left: 0, width: 280, background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', zIndex: 50, overflow: 'hidden' }}
              >
                <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
                    <Search size={14} color="#A1A1AA" />
                    <input type="text" placeholder="Rechercher..." value={searchGallery} onChange={e => setSearchGallery(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: '#F2EDE4', fontSize: 13, flex: 1 }} autoFocus />
                    {searchGallery && <button onClick={() => setSearchGallery('')} style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', padding: 0 }}><X size={14} /></button>}
                  </div>
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  <button onClick={() => { setGalleryFilter('all'); setGalleryOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: galleryFilter === 'all' ? 'rgba(200,72,46,0.1)' : 'transparent', color: galleryFilter === 'all' ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: galleryFilter === 'all' ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    className="dropdown-item"
                  >
                    Toutes les galeries {galleryFilter === 'all' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8482E' }} />}
                  </button>
                  {(data?.galleries ?? []).filter(g => !searchGallery || g.title.toLowerCase().includes(searchGallery.toLowerCase())).map(g => (
                    <button key={g.id} onClick={() => { setGalleryFilter(g.id); setGalleryOpen(false) }}
                      style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: galleryFilter === g.id ? 'rgba(200,72,46,0.1)' : 'transparent', color: galleryFilter === g.id ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: galleryFilter === g.id ? 600 : 400, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
                      className="dropdown-item"
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, whiteSpace: 'nowrap' }}>{g.title}</span>
                      <span style={{ fontSize: 11, color: '#A1A1AA', flexShrink: 0 }}>{fmtNum(g.view_count ?? 0)} vues</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setSortOpen(o => !o); setGalleryOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#F2EDE4', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}
          >
            <TrendingUp size={14} /> Trier : {sortLabel}
            <ChevronDown size={14} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                style={{ position: 'absolute', top: 48, left: 0, width: 190, background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', zIndex: 50, overflow: 'hidden', padding: '6px 0' }}
              >
                {(['views', 'favorites', 'downloads', 'photos'] as const).map(s => (
                  <button key={s} onClick={() => { setSortBy(s); setSortOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: sortBy === s ? 'rgba(200,72,46,0.1)' : 'transparent', color: sortBy === s ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: sortBy === s ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                    className="dropdown-item"
                  >
                    {s === 'views' && <Eye size={14} color="#F59E0B" />}
                    {s === 'favorites' && <Heart size={14} color="#EC4899" fill="#EC4899" />}
                    {s === 'downloads' && <Download size={14} color="#60A5FA" />}
                    {s === 'photos' && <ImageIcon size={14} color="#A1A1AA" />}
                    {{ views: 'Vues', favorites: 'Favoris', downloads: 'Téléchargements', photos: 'Photos' }[s]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={() => { setGalleryFilter('all'); setSearchGallery(''); setPeriodDays(30) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(200,72,46,0.3)', background: 'rgba(200,72,46,0.1)', color: '#C8482E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <X size={14} /> Réinitialiser
          </button>
        )}
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="stats-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        <KpiCard icon={Eye} label="Vues totales" value={filteredTotals.views} accent="#F59E0B" loading={loading} delay={0.08} />
        <KpiCard icon={Heart} label="Coups de cœur" value={filteredTotals.favorites} accent="#EC4899" loading={loading} delay={0.13} sub={filteredTotals.views > 0 ? `${Math.round((filteredTotals.favorites / filteredTotals.views) * 100)}% de conversion` : undefined} />
        <KpiCard icon={Download} label="Téléchargements" value={filteredTotals.downloads} accent="#3B82F6" loading={loading} delay={0.18} />
        <KpiCard icon={Camera} label="Photos publiées" value={filteredTotals.photos} accent="#C8482E" loading={loading} delay={0.23} sub={`${filteredGalleries.length} galeries actives`} />
      </div>

      {/* ── Layout 2 colonnes ── */}
      <div className="stats-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        
        {/* Colonne de Gauche : Top Galeries */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(200,72,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#C8482E" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFF', margin: 0 }}>Palmarès des Galeries</h2>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
            {loading ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={64} />)}
              </div>
            ) : filteredGalleries.length === 0 ? (
              <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                <Camera size={42} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
                <div style={{ color: '#A1A1AA', fontSize: 15 }}>Aucune donnée correspondante.</div>
              </div>
            ) : (
              filteredGalleries.slice(0, 10).map((g, i) => (
                <RankingRow key={g.id} title={g.title} views={g.view_count ?? 0} favorites={g.favorite_count ?? 0} rank={i} />
              ))
            )}
          </div>
        </motion.div>

        {/* Colonne de Droite : Flux d'activité Unifié */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#A1A1AA" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFF', margin: 0 }}>Activité en direct</h2>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px', backdropFilter: 'blur(10px)' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={48} />)}
              </div>
            ) : timelineEvents.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#A1A1AA', fontSize: 14 }}>Aucune activité récente.</div>
            ) : (
              <div className="timeline" style={{ display: 'flex', flexDirection: 'column' }}>
                {timelineEvents.map((evt, i) => {
                  const isView = evt.type === 'view';
                  const IconComp = isView ? Eye : Heart;
                  const color = isView ? '#F59E0B' : '#EC4899';
                  
                  return (
                    <motion.div key={evt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i === timelineEvents.length - 1 ? 0 : 24 }}
                    >
                      {/* Ligne verticale */}
                      {i !== timelineEvents.length - 1 && (
                        <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                      )}
                      
                      {/* Icone */}
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}1A`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 2 }}>
                        <IconComp size={14} color={color} fill={isView ? 'none' : color} />
                      </div>
                      
                      {/* Contenu */}
                      <div style={{ paddingTop: 6, flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: '#FFF', fontWeight: 500, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                          {isView ? 'Nouvelle vue sur' : 'Nouveau coup de cœur sur'}
                          <span style={{ color: color, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                            {evt.gallery_title}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {timeAgo(evt.created_at)}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes statPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes livePulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.5; transform:scale(0.8)} }
        
        .kpi-card:hover { border-color: rgba(255,255,255,0.15) !important; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
        .ranking-row:hover { background: rgba(255,255,255,0.03) !important; }
        .dropdown-item:hover { background: rgba(255,255,255,0.05) !important; }
        
        @media (max-width: 1100px) {
          .stats-two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-page { padding: 20px 16px !important; }
          .stats-header-wrap { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
          .stats-header-wrap > div:last-child { width: 100% !important; justify-content: space-between !important; }
          .stats-header-wrap > div:last-child button { flex: 1 !important; text-align: center !important; }
          .stats-filters-row { flex-direction: column !important; align-items: stretch !important; }
          .stats-filters-row > div { width: 100% !important; }
          .stats-filters-row button { width: 100% !important; max-width: none !important; justify-content: space-between !important; }
          .stats-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .kpi-card { padding: 16px !important; }
          .kpi-card > div:first-child { margin-bottom: 12px !important; }
          .kpi-card > div:first-child > div { width: 36px !important; height: 36px !important; border-radius: 10px !important; }
          .kpi-card > div:first-child > div svg { width: 18px !important; height: 18px !important; }
          .kpi-card > div:nth-child(3) { font-size: 32px !important; }
          .ranking-row { padding: 12px 16px !important; flex-wrap: wrap !important; gap: 12px !important; }
          .ranking-row > div:first-child { width: 100% !important; }
          .ranking-stats { width: 100% !important; justify-content: flex-start !important; padding-left: 40px !important; }
          .ranking-divider { display: none !important; }
        }
      `}</style>
    </div>
  )
}
