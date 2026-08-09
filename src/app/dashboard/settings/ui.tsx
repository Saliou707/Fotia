'use client'

import { motion } from 'framer-motion'
import type { ReactNode, CSSProperties, ElementType } from 'react'

// ─── Shared styles ──────────────────────────────────────────────────────────
export const inputStyle: CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)',
  color: '#F2EDE4', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', transition: 'border-color 0.2s',
}

// ─── Sub-components (design uniquement, logique identique) ──────────────────
export function Toggle({ on, onChange }: { on: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-checked={on}
      role="switch"
      style={{
        width: 46, height: 26, borderRadius: 99,
        background: on ? '#C8482E' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.25s', flexShrink: 0,
        boxShadow: on ? '0 0 12px rgba(200,72,46,0.4)' : 'none',
      }}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute', top: 3, left: 0,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}

export function SettingRow({
  label, hint, children, last = false
}: {
  label: string; hint?: string; children: ReactNode; last?: boolean
}) {
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ fontSize: 14, color: '#E5DDD6', fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: '#A09890', marginTop: 2 }}>{hint}</div>}
      </div>
      <div className="settings-row-control" style={{ flex: '0 0 auto', maxWidth: 280, width: '100%' }}>{children}</div>
    </div>
  )
}

export function Card({ children, style = {}, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      background: 'rgba(17,17,17,0.9)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function SectionHeader({ label, icon: Icon }: { label: string; icon: ElementType }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,255,255,0.02)',
    }}>
      <Icon size={14} color="#C8482E" />
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A09890' }}>
        {label}
      </span>
    </div>
  )
}
