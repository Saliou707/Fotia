'use client'
/* eslint-disable @next/next/no-img-element -- aperçus blob: non optimisables */
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { UpFile } from './types'

interface FilePreviewGridProps {
  files: UpFile[]
  onClear: () => void
}

export default function FilePreviewGrid({ files, onClear }: FilePreviewGridProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{files.length} photo{files.length > 1 ? 's' : ''}</span>
        <button onClick={onClear} style={{ fontSize: 13, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Tout effacer</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
        {files.map(f => (
          <div key={f.id} title={f.error} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1' }}>
            <img src={f.preview} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {/* Overlay statut */}
            {f.status === 'terminé' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} color="#22C55E" />
              </div>
            )}
            {f.status === 'upload' && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <div style={{ height: 3, background: 'rgba(0,0,0,0.4)' }}>
                  <div style={{ height: '100%', width: `${f.progress}%`, background: '#C8482E', transition: 'width 0.2s' }} />
                </div>
              </div>
            )}
            {f.status === 'erreur' && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} color="#EF4444" />
                </div>
                {f.error && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.75)', color: '#FECACA',
                    fontSize: 9.5, lineHeight: 1.3, padding: '4px 6px',
                    textAlign: 'left', maxHeight: '55%', overflow: 'hidden',
                  }}>
                    {f.error}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
