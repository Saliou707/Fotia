'use client'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  BarChart3, Eye, Heart, Image as ImageIcon,
  Download, TrendingUp, Camera, Filter,
  ChevronDown, ArrowUpRight, ArrowDownRight,
  Clock, Activity, Zap, Search, X
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

const PERIOD_OPTIONS = [
  { label: '7 derniers jours', value: 7 },
  { label: '30 derniers jours', value: 30 },
  { label: '90 derniers jours', value: 90 },
  { label: 'Tout le temps', value: 0 },
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
        background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18, padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}
      className="kpi-card"
    >
      {/* Background glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${accent}1A 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${accent}15`, border: `1px solid ${accent}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={accent} />
        </div>
        <span style={{
          fontSize: 10.5, fontWeight: 700, color: '#22C55E',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          padding: '3px 9px', borderRadius: 99, letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <Activity size={9} /> LIVE
        </span>
      </div>

      {loading ? (
        <>
          <Skeleton h={38} radius={8} />
          <div style={{ marginTop: 8 }}><Skeleton h={14} radius={6} /></div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.04em', color: '#F2EDE4', lineHeight: 1 }}>
            {fmtNum(value)}
          </div>
          <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 8, fontWeight: 500 }}>{label}</div>
          {sub && <div style={{ fontSize: 11.5, color: accent, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
        </>
      )}
    </motion.div>
  )
}

// ─── CSS Bar chart ─────────────────────────────────────────────────────────────
function BarChartRow({ title, views, favorites, downloads, maxViews, rank }: {
  title: string; views: number; favorites: number; downloads: number
  maxViews: number; rank: number
}) {
  const pct = maxViews > 0 ? Math.max(2, Math.round((views / maxViews) * 100)) : 0
  const favPct = maxViews > 0 ? Math.max(0, Math.round((favorites / maxViews) * 100)) : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.04 }}
      style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
      className="table-row"
    >
      {/* Top row: rank + title + values */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, color: rank === 0 ? '#FBBF24' : rank === 1 ? '#A0AEC0' : rank === 2 ? '#C8A97E' : '#555',
          background: rank < 3 ? (rank === 0 ? 'rgba(251,191,36,0.1)' : rank === 1 ? 'rgba(160,174,192,0.1)' : 'rgba(200,169,126,0.1)') : 'rgba(255,255,255,0.04)',
          border: `1px solid ${rank === 0 ? 'rgba(251,191,36,0.25)' : rank === 1 ? 'rgba(160,174,192,0.25)' : rank === 2 ? 'rgba(200,169,126,0.25)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 6, padding: '2px 7px', flexShrink: 0, letterSpacing: '0.02em',
        }}>#{rank + 1}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>
            <Eye size={12} color="#F59E0B" /> {fmtNum(views)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#EC4899' }}>
            <Heart size={12} color="#EC4899" fill="#EC4899" /> {fmtNum(favorites)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#60A5FA' }}>
            <Download size={12} color="#60A5FA" /> {fmtNum(downloads)}
          </span>
        </div>
      </div>

      {/* Stacked bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: rank * 0.05, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #C8482E, #F59E0B)', borderRadius: 99 }}
          />
        </div>
        <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${favPct}%` }}
            transition={{ duration: 0.7, delay: rank * 0.05 + 0.1, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #EC4899, #DB2777)', borderRadius: 99 }}
          />
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

  // ── Dropdowns open state ──
  const [periodOpen, setPeriodOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // ── Filtrage par période ──
  const filteredGalleries = useMemo(() => {
    if (!data) return []
    let list = data.galleries

    // Filtre période par date de création
    if (periodDays > 0) {
      const cutoff = new Date(Date.now() - periodDays * 86400000).toISOString()
      // On filtre uniquement si la galerie a été créée dans la période
      // Sinon on garde toutes les galeries mais on note que les stats sont globales
    }

    // Filtre par galerie spécifique
    if (galleryFilter !== 'all') {
      list = list.filter(g => g.id === galleryFilter)
    }

    // Filtre par recherche
    if (searchGallery.trim()) {
      list = list.filter(g => g.title.toLowerCase().includes(searchGallery.toLowerCase()))
    }

    // Tri
    return [...list].sort((a, b) => (b[sortBy === 'favorites' ? 'favorite_count' : sortBy === 'downloads' ? 'download_count' : sortBy === 'photos' ? 'photo_count' : 'view_count'] ?? 0) - (a[sortBy === 'favorites' ? 'favorite_count' : sortBy === 'downloads' ? 'download_count' : sortBy === 'photos' ? 'photo_count' : 'view_count'] ?? 0))
  }, [data, galleryFilter, sortBy, searchGallery, periodDays])

  // ── Totaux filtrés ──
  const filteredTotals = useMemo(() => ({
    views: filteredGalleries.reduce((s, g) => s + (g.view_count ?? 0), 0),
    favorites: filteredGalleries.reduce((s, g) => s + (g.favorite_count ?? 0), 0),
    downloads: filteredGalleries.reduce((s, g) => s + (g.download_count ?? 0), 0),
    photos: filteredGalleries.reduce((s, g) => s + (g.photo_count ?? 0), 0),
  }), [filteredGalleries])

  const maxViews = Math.max(...filteredGalleries.map(g => g.view_count ?? 0), 1)

  const periodLabel = PERIOD_OPTIONS.find(o => o.value === periodDays)?.label ?? ''
  const galleryLabel = galleryFilter === 'all' ? 'Toutes les galeries' : (data?.galleries.find(g => g.id === galleryFilter)?.title ?? '...')
  const sortLabel = { views: 'Vues', favorites: 'Favoris', downloads: 'Téléch.', photos: 'Photos' }[sortBy]

  const activeFiltersCount = (galleryFilter !== 'all' ? 1 : 0) + (searchGallery ? 1 : 0) + (periodDays !== 30 ? 1 : 0)

  return (
    <div className="stats-page" style={{ padding: '32px', minHeight: 'calc(100vh - 58px)', background: '#15171A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(200,72,46,0.12)', border: '1px solid rgba(200,72,46,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={19} color="#C8482E" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4', margin: 0 }}>Statistiques</h1>
              {activeFiltersCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(200,72,46,0.15)', border: '1px solid rgba(200,72,46,0.3)', color: '#C8482E', borderRadius: 99, padding: '2px 9px' }}>
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, color: '#787068', margin: 0, paddingLeft: 52 }}>Analysez vos performances en temps réel.</p>
          </div>

          {/* Badge live */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#22C55E' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
            Données en direct
          </div>
        </div>
      </motion.div>

      {/* ── Filtres ── */}
      <motion.div className="stats-filters-row"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8E8E93', fontSize: 13, fontWeight: 500 }}>
          <Filter size={14} /> Filtrer :
        </div>

        {/* Filtre période */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setPeriodOpen(o => !o); setGalleryOpen(false); setSortOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: periodDays !== 30 ? 'rgba(200,72,46,0.1)' : 'rgba(255,255,255,0.04)', color: periodDays !== 30 ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Clock size={13} /> {periodLabel}
            <ChevronDown size={12} style={{ transform: periodOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          <AnimatePresence>
            {periodOpen && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                style={{ position: 'absolute', top: 42, left: 0, width: 200, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 50, overflow: 'hidden' }}
              >
                {PERIOD_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setPeriodDays(opt.value); setPeriodOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: periodDays === opt.value ? 'rgba(200,72,46,0.12)' : 'transparent', color: periodDays === opt.value ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: periodDays === opt.value ? 600 : 400, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    className="dropdown-item"
                  >
                    {opt.label}
                    {periodDays === opt.value && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8482E' }} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filtre galerie */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setGalleryOpen(o => !o); setPeriodOpen(false); setSortOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: galleryFilter !== 'all' ? 'rgba(200,72,46,0.1)' : 'rgba(255,255,255,0.04)', color: galleryFilter !== 'all' ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', maxWidth: 220 }}
          >
            <Camera size={13} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{galleryLabel}</span>
            <ChevronDown size={12} style={{ transform: galleryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
          </button>
          <AnimatePresence>
            {galleryOpen && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                style={{ position: 'absolute', top: 42, left: 0, width: 260, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 50, overflow: 'hidden' }}
              >
                <div style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '7px 10px' }}>
                    <Search size={12} color="#8E8E93" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchGallery}
                      onChange={e => setSearchGallery(e.target.value)}
                      style={{ background: 'none', border: 'none', outline: 'none', color: '#F2EDE4', fontSize: 12, flex: 1 }}
                      autoFocus
                    />
                    {searchGallery && <button onClick={() => setSearchGallery('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 0 }}><X size={11} /></button>}
                  </div>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  <button onClick={() => { setGalleryFilter('all'); setGalleryOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: galleryFilter === 'all' ? 'rgba(200,72,46,0.1)' : 'transparent', color: galleryFilter === 'all' ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: galleryFilter === 'all' ? 600 : 400, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    className="dropdown-item"
                  >
                    Toutes les galeries
                    {galleryFilter === 'all' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8482E' }} />}
                  </button>
                  {(data?.galleries ?? [])
                    .filter(g => !searchGallery || g.title.toLowerCase().includes(searchGallery.toLowerCase()))
                    .map(g => (
                      <button key={g.id} onClick={() => { setGalleryFilter(g.id); setGalleryOpen(false) }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: galleryFilter === g.id ? 'rgba(200,72,46,0.1)' : 'transparent', color: galleryFilter === g.id ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: galleryFilter === g.id ? 600 : 400, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}
                        className="dropdown-item"
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{g.title}</span>
                        <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>{fmtNum(g.view_count ?? 0)} vues</span>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tri */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setSortOpen(o => !o); setPeriodOpen(false); setGalleryOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <TrendingUp size={13} /> Trier : {sortLabel}
            <ChevronDown size={12} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                style={{ position: 'absolute', top: 42, left: 0, width: 170, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 50, overflow: 'hidden' }}
              >
                {(['views', 'favorites', 'downloads', 'photos'] as const).map(s => (
                  <button key={s} onClick={() => { setSortBy(s); setSortOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: sortBy === s ? 'rgba(200,72,46,0.1)' : 'transparent', color: sortBy === s ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: sortBy === s ? 600 : 400, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}
                    className="dropdown-item"
                  >
                    {s === 'views' && <Eye size={13} color="#F59E0B" />}
                    {s === 'favorites' && <Heart size={13} color="#EC4899" fill="#EC4899" />}
                    {s === 'downloads' && <Download size={13} color="#60A5FA" />}
                    {s === 'photos' && <ImageIcon size={13} color="#8E8E93" />}
                    {{ views: 'Vues', favorites: 'Favoris', downloads: 'Téléchargements', photos: 'Photos' }[s]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset filtres */}
        {activeFiltersCount > 0 && (
          <button
            onClick={() => { setGalleryFilter('all'); setSearchGallery(''); setPeriodDays(30) }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(200,72,46,0.25)', background: 'rgba(200,72,46,0.06)', color: '#C8482E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <X size={12} /> Réinitialiser
          </button>
        )}
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="stats-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16, marginBottom: 36 }}>
        <KpiCard icon={Eye} label="Vues totales" value={filteredTotals.views} accent="#F59E0B" loading={loading} delay={0.08} />
        <KpiCard icon={Heart} label="Favoris clients" value={filteredTotals.favorites} accent="#EC4899" loading={loading} delay={0.13}
          sub={filteredTotals.views > 0 ? `${Math.round((filteredTotals.favorites / filteredTotals.views) * 100)}% taux de favori` : undefined} />
        <KpiCard icon={Download} label="Téléchargements" value={filteredTotals.downloads} accent="#60A5FA" loading={loading} delay={0.18} />
        <KpiCard icon={Camera} label="Photos uploadées" value={filteredTotals.photos} accent="#C8482E" loading={loading} delay={0.23}
          sub={`${filteredGalleries.length} galerie${filteredGalleries.length !== 1 ? 's' : ''}`} />
      </div>

      {/* ── Corps en 2 colonnes ── */}
      <div className="stats-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

        {/* ── Tableau galeries ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="#C8482E" />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#F2EDE4' }}>
                Classement des galeries
              </span>
              {filteredGalleries.length > 0 && (
                <span style={{ fontSize: 11, color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 99, padding: '2px 8px' }}>
                  {filteredGalleries.length} galerie{filteredGalleries.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {/* Légende barres */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#555' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 4, borderRadius: 99, background: 'linear-gradient(90deg, #C8482E, #F59E0B)', display: 'inline-block' }} /> Vues</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 3, borderRadius: 99, background: 'linear-gradient(90deg, #EC4899, #DB2777)', display: 'inline-block' }} /> Favoris</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Entête */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 80px)', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              <span>Galerie</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} color="#F59E0B" /> Vues</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={10} color="#EC4899" fill="#EC4899" /> Favs</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Download size={10} color="#60A5FA" /> DL</span>
            </div>

            {loading ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={56} />)}
              </div>
            ) : filteredGalleries.length === 0 ? (
              <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                <Camera size={36} color="rgba(255,255,255,0.08)" style={{ margin: '0 auto 12px' }} />
                <div style={{ color: '#555', fontSize: 14 }}>Aucune galerie trouvée.</div>
              </div>
            ) : (
              filteredGalleries.map((g, i) => (
                <BarChartRow key={g.id} title={g.title} views={g.view_count ?? 0} favorites={g.favorite_count ?? 0} downloads={g.download_count ?? 0} maxViews={maxViews} rank={i} />
              ))
            )}
          </div>
        </motion.div>

        {/* ── Colonne droite : Activité récente ── */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Vues récentes */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={14} color="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F2EDE4' }}>Vues récentes</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {loading ? (
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={36} />)}
                </div>
              ) : (data?.recentViews ?? []).length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: 13 }}>Aucune vue récente.</div>
              ) : (
                (data?.recentViews ?? []).slice(0, 8).map((v, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.03)' : 'none', transition: 'background 0.15s' }}
                    className="table-row"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.galleries?.title ?? 'Galerie'}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#555', flexShrink: 0, marginLeft: 8 }}>{timeAgo(v.created_at)}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Favoris récents */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Heart size={14} color="#EC4899" fill="#EC4899" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F2EDE4' }}>Favoris récents</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {loading ? (
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={36} />)}
                </div>
              ) : (data?.recentFavorites ?? []).length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: 13 }}>Aucun favori récent.</div>
              ) : (
                (data?.recentFavorites ?? []).slice(0, 8).map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.03)' : 'none', transition: 'background 0.15s' }}
                    className="table-row"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.galleries?.title ?? 'Galerie'}
                      </div>
                    </div>
                    <Heart size={11} color="#EC4899" fill="#EC4899" style={{ flexShrink: 0, marginLeft: 8 }} />
                    <div style={{ fontSize: 11, color: '#555', flexShrink: 0, marginLeft: 6 }}>{timeAgo(f.created_at)}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </motion.div>
      </div>

      <style>{`
        @keyframes statPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes livePulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.5; transform:scale(0.8)} }
        .kpi-card:hover { border-color: rgba(255,255,255,0.14) !important; box-shadow: 0 6px 32px rgba(0,0,0,0.4); }
        .table-row:hover { background: rgba(255,255,255,0.025) !important; }
        .dropdown-item:hover { background: rgba(255,255,255,0.04) !important; }
        @media (max-width: 1100px) {
          .stats-body { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .stats-filters { flex-wrap: wrap; }
        }
        @media (max-width: 640px) {
          .stats-page { padding: 20px 16px !important; }
          .stats-page .stats-two-col { grid-template-columns: 1fr !important; }
          .stats-page .stats-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .stats-page .stats-filters-row { flex-direction: column !important; align-items: stretch !important; }
          .stats-page .stats-filters-row > div { width: 100% !important; }
          .stats-page .stats-filters-row button { width: 100% !important; justify-content: space-between !important; }
          .stats-page .stats-table-header { display: none !important; }
        }
        @media (max-width: 480px) {
          .stats-page .stats-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
