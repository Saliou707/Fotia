'use client'

import { motion } from 'framer-motion'
import { Search, Camera } from 'lucide-react'

interface GalleryEmptyStateProps {
  search: string
  onCreate: () => void
}

export default function GalleryEmptyState({ search, onCreate }: GalleryEmptyStateProps) {
  const searching = !!search
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(14,14,14,0.4)', border: '1.5px dashed rgba(255,255,255,0.07)', borderRadius: 24 }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        {searching ? <Search size={26} color="#C8482E" /> : <Camera size={26} color="#C8482E" />}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F2EDE4', marginBottom: 8 }}>
        {searching ? 'Aucun résultat' : 'Aucune galerie'}
      </h3>
      <p style={{ fontSize: 14, color: '#A09890', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
        {searching ? `Aucune galerie ne correspond à "${search}"` : 'Créez votre première galerie pour commencer à livrer vos photos.'}
      </p>
      {!searching && (
        <button onClick={onCreate} style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,72,46,0.3)' }}>
          Créer une galerie
        </button>
      )}
    </motion.div>
  )
}
