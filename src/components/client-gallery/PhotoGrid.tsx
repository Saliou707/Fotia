'use client'

import Image from 'next/image'
import { Heart, Download } from 'lucide-react'
import { getImageUrl } from '@/lib/api'
import type { GalleryImage } from '@/types'
import type { GalleryWithProfile } from './types'

interface PhotoGridProps {
  gallery: GalleryWithProfile
  images: GalleryImage[]
  favorites: Set<string>
  onOpenImage: (index: number) => void
  onToggleFavorite: (imageId: string) => void
  onDownload: (image: GalleryImage) => void
}

export default function PhotoGrid({
  gallery,
  images,
  favorites,
  onOpenImage,
  onToggleFavorite,
  onDownload,
}: PhotoGridProps) {
  return (
    <main className="main-gallery-section">
      {/* Section Header */}
      <div className="section-header" style={{ borderBottom: 'none', justifyContent: 'center', marginBottom: 32, flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <h2 className="section-title" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 28, fontStyle: 'italic', color: '#A09890' }}>
          {gallery.title}
        </h2>
        <p style={{ fontSize: 13, color: '#A09890', fontWeight: 500 }}>{images.length} photo{images.length > 1 ? 's' : ''}</p>
      </div>

      {/* Photos Grid */}
      <div className="photo-grid-premium">
        {images.map((image, idx) => (
          <div
            className="photo-card-premium"
            key={image.id}
            onClick={() => onOpenImage(idx)}
          >
            {/* Image Source optimized via Next.js Image component */}
            <Image
              src={getImageUrl(image.r2_key)}
              alt={image.original_filename}
              className="photo-img"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
              priority={idx < 6}
            />

            {/* Hover actions Overlay */}
            <div className="photo-overlay" onClick={(e) => e.stopPropagation()}>
              {/* Top Favorite Toggle */}
              {gallery.allow_favorites && (
                <button
                  className={`photo-card-heart-btn ${favorites.has(image.id) ? 'active' : ''}`}
                  onClick={() => onToggleFavorite(image.id)}
                >
                  <Heart size={16} fill={favorites.has(image.id) ? 'currentColor' : 'none'} />
                </button>
              )}

              {/* Bottom row actions inside card */}
              <div className="photo-card-meta-bottom" onClick={() => onOpenImage(idx)}>
                <div />
                {gallery.allow_downloads && (
                  <button
                    className="photo-download-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownload(image)
                    }}
                  >
                    <Download size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <div style={{ textAlign: 'center', padding: '120px 24px', color: '#6C665F' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📷</div>
          <h3>Aucune photo importée</h3>
          <p style={{ fontSize: 14, color: '#6C665F', marginTop: 8 }}>Cette galerie est actuellement vide.</p>
        </div>
      )}
    </main>
  )
}
