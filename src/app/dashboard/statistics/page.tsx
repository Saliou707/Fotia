'use client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, Heart, Download, Camera } from 'lucide-react'
import type { AnalyticsData, TimelineEvent } from './types'
import StatsHeader from './StatsHeader'
import StatsFilters from './StatsFilters'
import KpiCard from './KpiCard'
import RankingPanel from './RankingPanel'
import ActivityPanel from './ActivityPanel'

export default function StatisticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Filtres ──
  const [periodDays, setPeriodDays] = useState(30)
  const [galleryFilter, setGalleryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'views' | 'favorites' | 'downloads' | 'photos'>('views')
  const [searchGallery, setSearchGallery] = useState('')

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

  const activeFiltersCount = (galleryFilter !== 'all' ? 1 : 0) + (searchGallery ? 1 : 0) + (periodDays !== 30 ? 1 : 0)

  return (
    <div className="stats-page" style={{ padding: '36px', minHeight: 'calc(100vh - 58px)', background: '#111111', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
      <StatsHeader
        activeFiltersCount={activeFiltersCount}
        periodDays={periodDays}
        onPeriod={setPeriodDays}
      />

      <StatsFilters
        galleries={data?.galleries ?? []}
        galleryFilter={galleryFilter}
        onGalleryFilter={setGalleryFilter}
        sortBy={sortBy}
        onSortBy={setSortBy}
        searchGallery={searchGallery}
        onSearch={setSearchGallery}
        activeFiltersCount={activeFiltersCount}
        onReset={() => { setGalleryFilter('all'); setSearchGallery(''); setPeriodDays(30) }}
      />

      {/* ── KPI Cards ── */}
      <div className="stats-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        <KpiCard icon={Eye} label="Vues totales" value={filteredTotals.views} accent="#F59E0B" loading={loading} delay={0.08} />
        <KpiCard icon={Heart} label="Coups de cœur" value={filteredTotals.favorites} accent="#EC4899" loading={loading} delay={0.13} sub={filteredTotals.views > 0 ? `${Math.round((filteredTotals.favorites / filteredTotals.views) * 100)}% de conversion` : undefined} />
        <KpiCard icon={Download} label="Téléchargements" value={filteredTotals.downloads} accent="#3B82F6" loading={loading} delay={0.18} />
        <KpiCard icon={Camera} label="Photos publiées" value={filteredTotals.photos} accent="#C8482E" loading={loading} delay={0.23} sub={`${filteredGalleries.length} galeries actives`} />
      </div>

      {/* ── Layout 2 colonnes ── */}
      <div className="stats-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        <RankingPanel loading={loading} galleries={filteredGalleries} />
        <ActivityPanel loading={loading} events={timelineEvents} />
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
