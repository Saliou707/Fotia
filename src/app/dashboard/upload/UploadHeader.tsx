'use client'

import { motion } from 'framer-motion'

interface UploadHeaderProps {
  galleryTitle: string
}

export default function UploadHeader({ galleryTitle }: UploadHeaderProps) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} style={{ marginBottom: 24 }}>
      {galleryTitle ? (
        <div>
          <div style={{ fontSize: 12, color: '#555', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Galerie</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{galleryTitle}</h1>
          <p style={{ fontSize: 14, color: '#555' }}>Importez vos photos — elles seront optimisées automatiquement.</p>
        </div>
      ) : (
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Importer des photos</h1>
          <p style={{ fontSize: 14, color: '#555' }}>Sélectionnez une galerie puis importez vos photos.</p>
        </div>
      )}
    </motion.div>
  )
}
