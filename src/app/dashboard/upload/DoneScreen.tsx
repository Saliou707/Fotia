'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface DoneScreenProps {
  uploadedCount: number
  hasErrors: boolean
  onAddMore: () => void
  onViewGallery: () => void
}

export default function DoneScreen({ uploadedCount, hasErrors, onAddMore, onViewGallery }: DoneScreenProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      style={{ background: '#111111', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Galerie prête !</h2>
      <p style={{ fontSize: 14, color: '#A09890', marginBottom: 8 }}>
        <strong style={{ color: '#F2EDE4' }}>{uploadedCount} photo{uploadedCount > 1 ? 's' : ''}</strong> importée{uploadedCount > 1 ? 's' : ''} avec succès.
      </p>
      {hasErrors && <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 8 }}>⚠️ Certains fichiers ont échoué — réessayez-les manuellement.</p>}
      <p style={{ fontSize: 14, color: '#555', marginBottom: 32 }}>Vous pouvez maintenant partager votre galerie avec votre client.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onAddMore}
          style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#A09890', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          + Ajouter des photos
        </button>
        <button onClick={onViewGallery}
          style={{ padding: '12px 28px', borderRadius: 10, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(200,72,46,0.4)' }}>
          Voir la galerie & partager <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}
