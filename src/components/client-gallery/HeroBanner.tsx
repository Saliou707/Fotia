'use client'
/* eslint-disable @next/next/no-img-element -- logo local non optimisé (élément statique) */

import { Heart, Share2, Grid, Eye } from 'lucide-react'
import type { GalleryWithProfile } from './types'

interface HeroBannerProps {
  gallery: GalleryWithProfile
  imagesCount: number
  photographerName: string
  favCount: number
  onOpenShare: () => void
  onDownloadFavorites: () => void
  onFavoriteAll: () => void
}

export default function HeroBanner({
  gallery,
  imagesCount,
  photographerName,
  favCount,
  onOpenShare,
  onDownloadFavorites,
  onFavoriteAll,
}: HeroBannerProps) {
  return (
    <section className="hero-banner">
      {/* Absolute Navigation inside Hero */}
      <div className="hero-nav">
        <div className="hero-logo-box" onClick={() => window.location.href = '/'}>
          <div className="hero-logo-glow" />
          <img
            src="/logo.png"
            alt="Fotia"
            width={82}
            style={{ objectFit: 'contain', position: 'relative', filter: 'brightness(1.12) drop-shadow(0 0 10px rgba(223,84,56,0.45))' }}
          />
        </div>
        <div className="hero-nav-actions">
          {gallery.allow_favorites && favCount > 0 && (
            <button className="hero-nav-btn" onClick={onDownloadFavorites}>
              <Heart size={14} fill="currentColor" color="#C8482E" />
              {favCount} favori{favCount > 1 ? 's' : ''}
            </button>
          )}
          <button className="hero-nav-btn" onClick={onOpenShare}>
            <Share2 size={14} /> Partager
          </button>
        </div>
      </div>

      {/* Hero Bottom Overlay Info */}
      <div className="hero-content">
        {/* Photographer Badge */}
        {gallery.profiles && (
          <div className="photographer-badge">
            <div className="photographer-avatar">
              {!gallery.profiles.avatar_url && (gallery.profiles.display_name ? gallery.profiles.display_name.charAt(0).toUpperCase() : 'P')}
            </div>
            <div className="photographer-meta">
              <div className="photographer-meta-name">{photographerName}</div>
              <div className="photographer-meta-role">Photographe</div>
            </div>
          </div>
        )}

        {/* Gallery Title */}
        <h1 className="hero-title">
          {gallery.title}<span>✦</span>
        </h1>

        {/* Description */}
        {gallery.description && (
          <p className="hero-desc">
            {gallery.description}
          </p>
        )}

        {/* Badges Info */}
        <div className="hero-badges-row">
          <div className="hero-badge-item">
            <Grid size={15} color="#C8482E" />
            <span>{imagesCount} photos</span>
          </div>
          <div className="hero-badge-item">
            <Eye size={15} color="#C8482E" />
            <span>{gallery.view_count || 0} vues</span>
          </div>
        </div>

        {/* Actions in Hero */}
        <div className="hero-actions-row">
          {gallery.allow_favorites && imagesCount > 0 && (
            <button className="hero-primary-btn" onClick={onFavoriteAll}>
              <Heart size={16} fill="currentColor" />
              Tout ajouter aux favoris
            </button>
          )}
          <button className="hero-secondary-btn" onClick={onOpenShare}>
            <Share2 size={16} />
            Partager la galerie
          </button>
        </div>
      </div>
    </section>
  )
}
