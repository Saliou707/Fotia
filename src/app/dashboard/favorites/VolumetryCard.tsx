'use client'

import { Heart } from 'lucide-react'
import { fmtNumber } from '@/lib/api'

interface VolumetryCardProps {
  loading: boolean
  label: string
  count: number
  sublabel: string
  stats?: { label: string; value: number }[]
  selectedCount: number
}

function Skeleton({ h = 80 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

export default function VolumetryCard({ loading, label, count, sublabel, stats, selectedCount }: VolumetryCardProps) {
  return (
    <div style={{ position: 'relative', background: 'rgba(14,14,14,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4' }}>
          {label}
        </span>
        <Heart size={16} color="#DF5438" fill="#DF5438" />
      </div>
      {loading ? <Skeleton h={80} /> : (
        <>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1, marginBottom: 8 }}>
            {fmtNumber(count)}
          </div>
          <div style={{ fontSize: 13, color: '#A09890', marginBottom: 20 }}>
            {sublabel}
          </div>

          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#A09890', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {selectedCount > 0 && (
            <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: '#C8482E', fontWeight: 600 }}>
              {selectedCount} photo{selectedCount !== 1 ? 's' : ''} sélectionnée{selectedCount !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}
    </div>
  )
}
