'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, ChevronDown, TrendingUp, Search, X,
  Eye, Heart, Download, Image as ImageIcon
} from 'lucide-react'
import { fmtNum } from './utils'
import type { Gallery } from './types'

type SortKey = 'views' | 'favorites' | 'downloads' | 'photos'

const SORT_OPTIONS: Record<SortKey, { short: string; full: string }> = {
  views: { short: 'Vues', full: 'Vues' },
  favorites: { short: 'Favoris', full: 'Favoris' },
  downloads: { short: 'Téléch.', full: 'Téléchargements' },
  photos: { short: 'Photos', full: 'Photos' },
}

interface StatsFiltersProps {
  galleries: Gallery[]
  galleryFilter: string
  onGalleryFilter: (id: string) => void
  sortBy: SortKey
  onSortBy: (s: SortKey) => void
  searchGallery: string
  onSearch: (s: string) => void
  activeFiltersCount: number
  onReset: () => void
}

export default function StatsFilters({
  galleries, galleryFilter, onGalleryFilter,
  sortBy, onSortBy, searchGallery, onSearch,
  activeFiltersCount, onReset,
}: StatsFiltersProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const galleryLabel = galleryFilter === 'all' ? 'Toutes les galeries' : (galleries.find(g => g.id === galleryFilter)?.title ?? '...')

  return (
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
                  <Search size={14} color="#A09890" />
                  <input type="text" placeholder="Rechercher..." value={searchGallery} onChange={e => onSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: '#F2EDE4', fontSize: 13, flex: 1 }} autoFocus />
                  {searchGallery && <button onClick={() => onSearch('')} style={{ background: 'none', border: 'none', color: '#A09890', cursor: 'pointer', padding: 0 }}><X size={14} /></button>}
                </div>
              </div>
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                <button onClick={() => { onGalleryFilter('all'); setGalleryOpen(false) }}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: galleryFilter === 'all' ? 'rgba(200,72,46,0.1)' : 'transparent', color: galleryFilter === 'all' ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: galleryFilter === 'all' ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  className="dropdown-item"
                >
                  Toutes les galeries {galleryFilter === 'all' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8482E' }} />}
                </button>
                {galleries.filter(g => !searchGallery || g.title.toLowerCase().includes(searchGallery.toLowerCase())).map(g => (
                  <button key={g.id} onClick={() => { onGalleryFilter(g.id); setGalleryOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: galleryFilter === g.id ? 'rgba(200,72,46,0.1)' : 'transparent', color: galleryFilter === g.id ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: galleryFilter === g.id ? 600 : 400, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
                    className="dropdown-item"
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, whiteSpace: 'nowrap' }}>{g.title}</span>
                    <span style={{ fontSize: 11, color: '#A09890', flexShrink: 0 }}>{fmtNum(g.view_count ?? 0)} vues</span>
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
          <TrendingUp size={14} /> Trier : {SORT_OPTIONS[sortBy].short}
          <ChevronDown size={14} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }} />
        </button>
        <AnimatePresence>
          {sortOpen && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              style={{ position: 'absolute', top: 48, left: 0, width: 190, background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', zIndex: 50, overflow: 'hidden', padding: '6px 0' }}
            >
              {(['views', 'favorites', 'downloads', 'photos'] as const).map(s => (
                <button key={s} onClick={() => { onSortBy(s); setSortOpen(false) }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: sortBy === s ? 'rgba(200,72,46,0.1)' : 'transparent', color: sortBy === s ? '#C8482E' : '#F2EDE4', fontSize: 13, fontWeight: sortBy === s ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                  className="dropdown-item"
                >
                  {s === 'views' && <Eye size={14} color="#F59E0B" />}
                  {s === 'favorites' && <Heart size={14} color="#EC4899" fill="#EC4899" />}
                  {s === 'downloads' && <Download size={14} color="#60A5FA" />}
                  {s === 'photos' && <ImageIcon size={14} color="#A09890" />}
                  {SORT_OPTIONS[s].full}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={onReset}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(200,72,46,0.3)', background: 'rgba(200,72,46,0.1)', color: '#C8482E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <X size={14} /> Réinitialiser
        </button>
      )}
    </motion.div>
  )
}
