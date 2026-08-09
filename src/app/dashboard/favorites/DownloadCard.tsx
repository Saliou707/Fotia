'use client'

import { Download, Check, Loader2, X } from 'lucide-react'

interface DownloadCardProps {
  empty: boolean
  done: boolean
  downloading: boolean
  selectedCount: number
  mode: 'drill' | 'global'
  contextCount: number
  drillTitle?: string
  totalFavs: number
  onDownload: () => void
  onClearSelection: () => void
}

export default function DownloadCard({ empty, done, downloading, selectedCount, mode, contextCount, drillTitle, totalFavs, onDownload, onClearSelection }: DownloadCardProps) {
  const description = selectedCount > 0
    ? `${selectedCount} photo${selectedCount !== 1 ? 's' : ''} sélectionnée${selectedCount !== 1 ? 's' : ''}.`
    : mode === 'drill'
      ? `Exporter les ${contextCount} favoris de "${drillTitle}".`
      : `Téléchargez toutes vos photos favorites (${totalFavs}) dans une archive ZIP.`

  const actionLabel = done
    ? <><Check size={16} /> Fichier ZIP prêt</>
    : downloading
      ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Création ZIP...</>
      : <><Download size={16} /> {selectedCount > 0 ? 'Exporter la sélection' : 'Tout exporter en ZIP'}</>

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(200,72,46,0.12) 0%, rgba(200,72,46,0.03) 100%)', border: '1px solid rgba(200,72,46,0.25)', borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,72,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Download size={18} color="#DF5438" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#F2EDE4', letterSpacing: '-0.01em' }}>Exportation</span>
      </div>
      <p style={{ fontSize: 13, color: '#A09890', marginBottom: 24, lineHeight: 1.6, position: 'relative' }}>
        {description}
      </p>
      <button
        onClick={onDownload}
        disabled={downloading || done || empty}
        style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 'none',
          fontWeight: 700, fontSize: 14, position: 'relative',
          cursor: empty ? 'not-allowed' : 'pointer',
          background: done ? '#22C55E' : 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
          boxShadow: done ? 'none' : '0 4px 16px rgba(200,72,46,0.4)',
          opacity: empty ? 0.5 : 1,
        }}
      >
        {actionLabel}
      </button>
      {selectedCount > 0 && (
        <button
          onClick={onClearSelection}
          style={{ background: 'none', border: 'none', color: '#A09890', fontSize: 12, fontWeight: 500, width: '100%', marginTop: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' }}
          className="hover:underline hover:text-white"
        >
          <X size={12} /> Désélectionner tout
        </button>
      )}
    </div>
  )
}
