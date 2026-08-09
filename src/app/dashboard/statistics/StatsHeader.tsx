'use client'

import { motion } from 'framer-motion'
import { PERIODS } from './utils'

interface StatsHeaderProps {
  activeFiltersCount: number
  periodDays: number
  onPeriod: (days: number) => void
}

export default function StatsHeader({ activeFiltersCount, periodDays, onPeriod }: StatsHeaderProps) {
  return (
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
          <p style={{ fontSize: 15, color: '#A09890', margin: 0 }}>Suivez l&apos;engagement de vos clients en temps réel.</p>
        </div>

        {/* Segmented Control Période */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => onPeriod(p.value)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: periodDays === p.value ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: periodDays === p.value ? '#FFF' : '#A09890',
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
  )
}
