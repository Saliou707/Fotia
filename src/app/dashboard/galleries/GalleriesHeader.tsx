'use client'

import { motion } from 'framer-motion'
import { Camera, Plus } from 'lucide-react'

interface GalleriesHeaderProps {
  loading: boolean
  count: number
  activeCount: number
  onCreate: () => void
}

export default function GalleriesHeader({ loading, count, activeCount, onCreate }: GalleriesHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="galleries-header flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(200,72,46,0.12)', border: '1px solid rgba(200,72,46,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={18} color="#C8482E" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4', margin: 0 }}>Galeries</h1>
          {!loading && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.22)', color: '#C8482E', borderRadius: 99, padding: '2px 9px' }}>
              {count}
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, color: '#A09890', margin: 0, paddingLeft: 52 }}>
          {!loading && `${activeCount} active${activeCount !== 1 ? 's' : ''} · ${count - activeCount} brouillon${count - activeCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      <motion.button
        onClick={onCreate}
        whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(200,72,46,0.4)' }}
        whileTap={{ scale: 0.97 }}
        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 22px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,72,46,0.3)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
        <Plus size={17} strokeWidth={2.5} /> Nouvelle galerie
      </motion.button>
    </motion.div>
  )
}
