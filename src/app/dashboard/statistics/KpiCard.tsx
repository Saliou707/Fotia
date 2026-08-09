'use client'

import { motion } from 'framer-motion'
import type { ElementType } from 'react'
import { Activity } from 'lucide-react'
import Skeleton from './Skeleton'
import { fmtNum } from './utils'

interface KpiCardProps {
  icon: ElementType
  label: string
  value: number
  accent: string
  sub?: string
  loading?: boolean
  delay?: number
}

export default function KpiCard({ icon: Icon, label, value, accent, sub, loading, delay = 0 }: KpiCardProps) {
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
          <div style={{ fontSize: 13, color: '#A09890', marginTop: 10, fontWeight: 500 }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: accent, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
        </>
      )}
    </motion.div>
  )
}
