'use client'

import { motion } from 'framer-motion'
import { Search, Grid3X3, List, X } from 'lucide-react'

interface GalleryFiltersProps {
  search: string
  onSearch: (v: string) => void
  view: 'grid' | 'list'
  onView: (v: 'grid' | 'list') => void
  resultCount: number
}

export default function GalleryFilters({ search, onSearch, view, onView, resultCount }: GalleryFiltersProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="galleries-filter-wrap flex flex-wrap gap-3 mb-7 items-center">
      {/* Recherche */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '9px 16px', flex: 1, minWidth: '280px', maxWidth: 380, transition: 'border 0.2s' }} className="search-focus-wrapper">
        <Search size={14} color="#555" />
        <input
          value={search} onChange={e => onSearch(e.target.value)}
          placeholder="Rechercher une galerie..."
          style={{ background: 'none', border: 'none', color: '#F2EDE4', fontSize: 13.5, outline: 'none', width: '100%', fontFamily: 'inherit' }}
        />
        {search && (
          <button onClick={() => onSearch('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Toggle vue */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
        {([{ v: 'grid', icon: Grid3X3 }, { v: 'list', icon: List }] as const).map(({ v, icon: Icon }) => (
          <button key={v} onClick={() => onView(v)} style={{ padding: '9px 14px', background: view === v ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', cursor: 'pointer', color: view === v ? '#F2EDE4' : '#555', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
            <Icon size={15} />
          </button>
        ))}
      </div>

      {/* Résultat filtre */}
      {search && (
        <span style={{ fontSize: 12.5, color: '#555', fontWeight: 500 }}>
          {resultCount} résultat{resultCount !== 1 ? 's' : ''} pour «&nbsp;{search}&nbsp;»
        </span>
      )}
    </motion.div>
  )
}
