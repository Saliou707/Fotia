'use client'

import { Heart, Download } from 'lucide-react'
import type { GalleryWithProfile } from './types'

interface StickyActionBarProps {
  gallery: GalleryWithProfile
  favCount: number
  isDownloadingAll: boolean
  onDownloadFavorites: () => void
  onDownloadAllZip: () => Promise<void>
}

export default function StickyActionBar({
  gallery,
  favCount,
  isDownloadingAll,
  onDownloadFavorites,
  onDownloadAllZip,
}: StickyActionBarProps) {
  return (
    <div className="sticky-bar-premium">
      <div className="sticky-bar-info">
        <Heart size={18} color="#C8482E" fill={favCount > 0 ? '#C8482E' : 'none'} />
        <div>
          <div className="sticky-bar-label">
            {favCount} {favCount > 1 ? 'Favoris sélectionnés' : 'Favori sélectionné'}
          </div>
          <div className="sticky-bar-sub">
            {favCount > 0 ? 'Sélection prête pour le téléchargement' : 'Marquez vos images favorites'}
          </div>
        </div>
      </div>
      <div>
        {favCount > 0 ? (
          <button className="sticky-bar-btn" onClick={onDownloadFavorites}>
            <Download size={15} />
            Télécharger la sélection
          </button>
        ) : (
          gallery.allow_downloads && (
            <button
              className="sticky-bar-btn"
              disabled={isDownloadingAll}
              onClick={onDownloadAllZip}
            >
              <Download size={15} />
              {isDownloadingAll ? 'Génération...' : 'Tout télécharger'}
            </button>
          )
        )}
      </div>
    </div>
  )
}
