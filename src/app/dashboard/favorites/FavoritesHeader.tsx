'use client'

import { motion } from 'framer-motion'
import { Heart, ArrowLeft, CheckSquare, Square } from 'lucide-react'
import { fadeUp } from '@/lib/animations'

interface FavoritesHeaderProps {
  drillGallery: string | null
  drillTitle?: string
  contextCount: number
  tab: number
  onTab: (i: number) => void
  onCloseDrill: () => void
  allSelected: boolean
  onToggleAll: () => void
}

const TABS = ['Flux global', 'Par galerie']

export default function FavoritesHeader({ drillGallery, drillTitle, contextCount, tab, onTab, onCloseDrill, allSelected, onToggleAll }: FavoritesHeaderProps) {
  return (
    <motion.div variants={fadeUp} className="favorites-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
      <div>
        {/* Breadcrumb si drill */}
        {drillGallery && (
          <button
            onClick={onCloseDrill}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#A09890', fontSize: 12, fontWeight: 500, cursor: 'pointer', marginBottom: 10, padding: '4px 0', letterSpacing: '0.01em' }}
          >
            <ArrowLeft size={13} /> Toutes les galeries
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
            {drillGallery ? drillTitle : 'Favoris'}
          </h1>
          <Heart size={20} color="#C8482E" fill="#C8482E" />
        </div>
        <p style={{ fontSize: 14, color: '#A09890', margin: 0 }}>
          {drillGallery
            ? `${contextCount} favori${contextCount !== 1 ? 's' : ''} dans cette galerie`
            : 'Les photos coups de cœur de vos clients.'}
        </p>
      </div>

      {/* Tabs (masqués si drill) */}
      {!drillGallery && (
        <div className="favorites-tabs" style={{ display: 'inline-flex', gap: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => onTab(i)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === i ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === i ? '#fff' : '#A09890', transition: 'all 0.2s', boxShadow: tab === i ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Contrôles sélection si drill */}
      {drillGallery && contextCount > 0 && (
        <button
          className="favorites-drill-controls hover:bg-white/[0.08]"
          onClick={onToggleAll}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {allSelected ? <><CheckSquare size={14} /> Tout désélectionner</> : <><Square size={14} /> Tout sélectionner</>}
        </button>
      )}
    </motion.div>
  )
}
