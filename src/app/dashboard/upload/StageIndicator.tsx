'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Stage } from './types'

interface StageIndicatorProps {
  stage: Stage
  uploaded: number
  total: number
}

const STEPS = [
  { key: 'uploading', icon: '📤', label: 'Upload en cours…' },
  { key: 'optimizing', icon: '⚙️', label: 'Optimisation des images…' },
  { key: 'done', icon: '✅', label: 'Galerie prête !' },
]

export default function StageIndicator({ stage, uploaded, total }: StageIndicatorProps) {
  const currentIdx = stage === 'uploading' ? 0 : stage === 'optimizing' ? 1 : stage === 'done' ? 2 : -1
  const pct = total > 0 ? Math.round((uploaded / total) * 100) : 0

  return (
    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', marginBottom: 24 }}>
      {/* Étapes */}
      <div className="stage-steps" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 20 }}>
        {STEPS.map((s, i) => {
          const isActive = i === currentIdx
          const isDone = i < currentIdx
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: isDone ? '#22C55E' : isActive ? '#C8482E' : 'rgba(255,255,255,0.07)', border: `2px solid ${isDone ? '#22C55E' : isActive ? '#C8482E' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all 0.4s', boxShadow: isActive ? '0 0 16px rgba(200,72,46,0.4)' : 'none' }}>
                  {isDone ? <Check size={20} color="#fff" /> : <span>{s.icon}</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? '#C8482E' : isDone ? '#22C55E' : '#555', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="step-connector" style={{ width: 60, height: 2, background: i < currentIdx ? '#22C55E' : 'rgba(255,255,255,0.07)', margin: '0 8px 20px', transition: 'background 0.4s', flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>
      {/* Barre globale */}
      {stage !== 'idle' && (
        <div>
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${stage === 'done' ? 100 : stage === 'optimizing' ? 85 : pct}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: stage === 'done' ? '#22C55E' : 'linear-gradient(90deg,#C8482E,#DF5438)', borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
            <span style={{ color: '#555' }}>
              {stage === 'uploading' && `${uploaded} / ${total} photo${total > 1 ? 's' : ''}`}
              {stage === 'optimizing' && 'Finalisation de la galerie…'}
              {stage === 'done' && `${total} photo${total > 1 ? 's' : ''} importée${total > 1 ? 's' : ''} avec succès`}
            </span>
            <span style={{ fontWeight: 700, color: stage === 'done' ? '#22C55E' : '#C8482E' }}>
              {stage === 'done' ? '100%' : stage === 'optimizing' ? '85%' : `${pct}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
