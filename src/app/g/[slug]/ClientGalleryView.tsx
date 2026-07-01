'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { toast } from '@/components/ui'
import { getClientToken, buildWhatsAppUrl } from '@/lib/utils'
import { getImageUrl } from '@/lib/api'
import type { Gallery, GalleryImage } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Share2, 
  Download, 
  Eye, 
  Calendar, 
  Sparkles, 
  Phone, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  SlidersHorizontal,
  Compass,
  Link2,
  ExternalLink,
  Laptop
} from 'lucide-react'

interface Props {
  gallery: Gallery & {
    profiles: { 
      display_name: string | null; 
      avatar_url: string | null;
      phone: string | null;
      instagram: string | null;
      facebook: string | null;
      tiktok: string | null;
      website: string | null;
      bio: string | null;
    } | null
  }
  images: GalleryImage[]
}

export default function ClientGalleryView({ gallery, images }: Props) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const clientToken = useRef<string>('')

  useEffect(() => {
    clientToken.current = getClientToken()
    // Load previously favorited images for this session
    const saved = localStorage.getItem(`fotia_fav_${gallery.id}`)
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)))
      } catch {}
    }
  }, [gallery.id])

  const toggleFavorite = useCallback(async (imageId: string) => {
    const isFav = favorites.has(imageId)
    const newFavorites = new Set(favorites)

    if (isFav) {
      newFavorites.delete(imageId)
    } else {
      newFavorites.add(imageId)
    }

    setFavorites(newFavorites)
    localStorage.setItem(`fotia_fav_${gallery.id}`, JSON.stringify([...newFavorites]))

    // Sync to backend
    try {
      await fetch(`/api/galleries/${gallery.id}/favorites`, {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: imageId,
          client_token: clientToken.current,
        }),
      })
    } catch {
      // Revert on error
      const reverted = new Set(favorites)
      setFavorites(reverted)
    }
  }, [favorites, gallery.id])

  const handleDownload = async (image: GalleryImage) => {
    if (!gallery.allow_downloads) return
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: image.id, client_token: clientToken.current }),
      })
      const { download_url } = await res.json()
      const a = document.createElement('a')
      a.href = download_url
      a.download = image.original_filename ?? 'photo.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {}
  }

  const downloadFavorites = async () => {
    if (favorites.size === 0) return
    const favList = images.filter(img => favorites.has(img.id))
    toast.success("Téléchargement lancé", `Préparation de vos ${favorites.size} favoris...`)
    for (const img of favList) {
      await handleDownload(img)
      await new Promise(r => setTimeout(r, 450)) // Throttle to prevent browser blocking multiple downloads
    }
  }

  const favoriteAll = async () => {
    const allIds = images.map(img => img.id)
    const newFavorites = new Set(allIds)
    setFavorites(newFavorites)
    localStorage.setItem(`fotia_fav_${gallery.id}`, JSON.stringify([...newFavorites]))
    toast.success("Ajout en cours…", `${images.length} photos en cours d'ajout aux favoris.`)

    // Sync to backend via bulk endpoint
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/favorites/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_ids: allIds,
          client_token: clientToken.current,
        }),
      })
      if (res.ok) {
        toast.success("Tout est dans vos favoris !", `${images.length} photos ont été ajoutées.`)
      } else {
        toast.error("Erreur", "Impossible de synchroniser les favoris.")
      }
    } catch {
      toast.error("Erreur réseau", "Vérifiez votre connexion et réessayez.")
    }
  }

  const photographerName = gallery.profiles?.display_name ?? 'Studio Pro'
  const galleryUrl = typeof window !== 'undefined' ? window.location.href : ''
  const waUrl = gallery.profiles?.phone 
    ? `https://wa.me/${gallery.profiles.phone.replace(/[^0-9]/g, '')}` 
    : buildWhatsAppUrl(galleryUrl, photographerName)
  const favCount = favorites.size

  // Hero Background Image
  const heroBgUrl = gallery.cover_image_url 
    ? gallery.cover_image_url 
    : (images.length > 0 ? getImageUrl(images[0].r2_key) : '')

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(galleryUrl)
    setCopied(true)
    toast.success("Lien copié !", "Vous pouvez maintenant le partager.")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="premium-gallery-container">
      {/* Import fonts and write custom styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');
        
        .premium-gallery-container {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #080808;
          color: #F5F0EB;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .hero-banner {
          position: relative;
          height: 75vh;
          min-height: 500px;
          max-height: 800px;
          display: flex;
          align-items: flex-end;
          background-color: #080808;
          background-image: ${heroBgUrl ? `url(${heroBgUrl})` : 'radial-gradient(circle at top right, #1a1a1a, #080808)'};
          background-size: cover;
          background-position: center;
          padding: 60px 4% 80px;
          box-sizing: border-box;
        }

        .hero-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(8, 8, 8, 0.3) 0%, rgba(8, 8, 8, 0.1) 40%, rgba(8, 8, 8, 0.75) 75%, #080808 100%);
          z-index: 1;
        }

        .hero-banner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.2);
          z-index: 0;
        }

        .hero-nav {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4%;
          z-index: 10;
        }

        .hero-logo-box {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .hero-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hero-nav-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #F5F0EB;
          border-radius: 99px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .hero-nav-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 800px;
          margin-bottom: 10px;
        }

        .photographer-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 6px 14px 6px 6px;
          border-radius: 99px;
          margin-bottom: 24px;
        }

        .photographer-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${gallery.profiles?.avatar_url ? `url(${gallery.profiles.avatar_url}) center/cover` : 'linear-gradient(135deg, #C8482E, #A93821)'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #FFF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .photographer-meta {
          text-align: left;
        }

        .photographer-meta-name {
          font-size: 13px;
          font-weight: 700;
          color: #F5F0EB;
          line-height: 1.2;
        }

        .photographer-meta-role {
          font-size: 10px;
          color: #A09890;
          font-weight: 500;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 5.5vw, 60px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #FFFFFF;
          margin: 0 0 16px;
          line-height: 1.1;
          text-shadow: 0 2px 20px rgba(0,0,0,0.4);
        }

        .hero-title span {
          color: #C8482E;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 400;
          margin-left: 8px;
        }

        .hero-desc {
          font-size: clamp(14px, 1.8vw, 16.5px);
          color: #D4D4D8;
          line-height: 1.6;
          margin: 0 0 28px;
          font-weight: 400;
          max-width: 620px;
          text-shadow: 0 1px 10px rgba(0,0,0,0.3);
        }

        .hero-badges-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .hero-badge-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #A09890;
          font-weight: 500;
        }

        .hero-actions-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hero-primary-btn {
          background: #C8482E;
          color: #FFF;
          border: none;
          font-weight: 700;
          font-size: 14px;
          border-radius: 99px;
          padding: 13px 26px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(255, 107, 53, 0.35);
          transition: all 0.25s ease;
        }

        .hero-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255, 107, 53, 0.5);
          background: #FF7B4B;
        }

        .hero-secondary-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #FFF;
          font-weight: 700;
          font-size: 14px;
          border-radius: 99px;
          padding: 13px 26px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.25s ease;
        }

        .hero-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.24);
          transform: translateY(-2px);
        }

        /* Main Content Grid */
        .main-gallery-section {
          padding: 60px 4% 140px;
          max-width: 1440px;
          margin: 0 auto;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 20px;
        }

        .section-title {
          font-size: 22px;
          font-weight: 800;
          color: #FFF;
          letter-spacing: -0.02em;
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-pill {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          color: #A09890;
          padding: 8px 18px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .control-pill:hover {
          background: rgba(255,255,255,0.06);
          color: #FFF;
          border-color: rgba(255,255,255,0.12);
        }

        /* Image Grid Styles */
        .photo-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 24px;
        }

        .photo-card-premium {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          aspect-ratio: 3/2;
          cursor: pointer;
          background: rgba(255,255,255,0.01);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .photo-card-premium:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .photo-card-premium:hover .photo-img {
          transform: scale(1.05);
        }

        .photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.1) 50%, rgba(8,8,8,0.4) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
          box-sizing: border-box;
          z-index: 1;
        }

        .photo-card-premium:hover .photo-overlay {
          opacity: 1;
        }

        .photo-card-heart-btn {
          align-self: flex-end;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(8, 8, 8, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.12);
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .photo-card-heart-btn:hover {
          background: #C8482E;
          border-color: #C8482E;
          transform: scale(1.1);
        }

        .photo-card-heart-btn.active {
          background: #C8482E;
          border-color: #C8482E;
          color: #FFF;
        }

        .photo-card-meta-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .photo-name {
          font-size: 13px;
          font-weight: 500;
          color: #FFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70%;
        }

        .photo-download-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: none;
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .photo-download-btn:hover {
          background: #FFF;
          color: #080808;
          transform: scale(1.1);
        }

        .photo-heart-indicator {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #C8482E;
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(200,72,46,0.35);
          z-index: 2;
        }

        /* Sticky bottom action bar styling */
        .sticky-bar-premium {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 580px;
          background: rgba(17, 17, 17, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          border-radius: 100px;
          padding: 10px 12px 10px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          z-index: 50;
        }

        .sticky-bar-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sticky-bar-label {
          font-size: 14px;
          font-weight: 700;
          color: #FFF;
        }

        .sticky-bar-sub {
          font-size: 11px;
          color: #A09890;
          margin-top: 1px;
        }

        .sticky-bar-btn {
          background: #C8482E;
          color: #FFF;
          border: none;
          font-weight: 700;
          font-size: 13px;
          border-radius: 99px;
          padding: 12px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(200,72,46,0.3);
          transition: all 0.2s;
        }

        .sticky-bar-btn:hover {
          background: #FF7B4B;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,72,46,0.4);
        }

        @media (max-width: 640px) {
          .main-gallery-section {
            padding: 40px 0 140px !important;
          }
          .photo-grid-premium {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .photo-card-premium {
            border-radius: 0 !important;
            aspect-ratio: 4/5 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .photo-overlay {
            opacity: 1 !important;
            background: linear-gradient(to top, rgba(8,8,8,0.75) 0%, transparent 40%) !important;
            padding: 20px !important;
          }
          .photo-name {
            font-size: 14px !important;
            max-width: 60% !important;
            font-weight: 600 !important;
          }
          .photo-card-heart-btn {
            width: 48px !important;
            height: 48px !important;
          }
          .photo-card-heart-btn svg {
            width: 22px !important;
            height: 22px !important;
          }
          .photo-download-btn {
            width: 48px !important;
            height: 48px !important;
          }
          .photo-download-btn svg {
            width: 22px !important;
            height: 22px !important;
          }

          /* Hero banner mobile height override */
          .hero-banner {
            height: 55vh !important;
            min-height: 420px !important;
            padding: 40px 4% 30px !important;
          }
          .hero-title {
            font-size: 32px !important;
            margin-bottom: 8px !important;
          }
          .hero-desc {
            font-size: 14px !important;
            margin-bottom: 24px !important;
            line-height: 1.5 !important;
          }
          .hero-badges-row {
            margin-bottom: 22px !important;
            gap: 16px !important;
          }

          /* Bottom sticky controls for mobile devices */
          .sticky-bar-premium {
            bottom: 16px !important;
            width: 94% !important;
            padding: 8px 8px 8px 16px !important;
            border-radius: 99px !important;
          }
          .sticky-bar-info {
            gap: 8px !important;
          }
          .sticky-bar-label {
            font-size: 12.5px !important;
          }
          .sticky-bar-sub {
            display: none !important;
          }
          .sticky-bar-btn {
            padding: 10px 16px !important;
            font-size: 12px !important;
          }
        }

        @media (max-width: 768px) {
          .lightbox-nav-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* ---- HERO BANNER ---- */}
      <section className="hero-banner">
        {/* Absolute Navigation inside Hero */}
        <div className="hero-nav">
          <div className="hero-logo-box" onClick={() => window.location.href = '/'}>
            <img src="/logo.png" alt="Fotia Logo" width={80} style={{ objectFit: 'contain', filter: 'brightness(1.05)' }} />
          </div>
          <div className="hero-nav-actions">
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
              <span>{images.length} photos</span>
            </div>
            <div className="hero-badge-item">
              <Eye size={15} color="#C8482E" />
              <span>{gallery.view_count || 0} vues</span>
            </div>
          </div>

          {/* Actions in Hero */}
          <div className="hero-actions-row">
            {gallery.allow_favorites && images.length > 0 && (
              <button className="hero-primary-btn" onClick={favoriteAll}>
                <Heart size={16} fill="currentColor" />
                Tout ajouter aux favoris
              </button>
            )}
            <button className="hero-secondary-btn" onClick={() => setIsShareModalOpen(true)}>
              <Share2 size={16} />
              Partager la galerie
            </button>
          </div>
        </div>
      </section>

      {/* ---- MAIN GALLERY SECTION ---- */}
      <main className="main-gallery-section">
        {/* Section Header */}
        <div className="section-header" style={{ borderBottom: 'none', justifyContent: 'center', marginBottom: 32 }}>
          <h2 className="section-title" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 28, fontStyle: 'italic', color: '#A09890' }}>
            La Collection
          </h2>
        </div>

        {/* Photos Grid */}
        <div className="photo-grid-premium">
          {images.map((image, idx) => (
            <div 
              className="photo-card-premium" 
              key={image.id}
              onClick={() => setLightboxIndex(idx)}
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
              
              {/* Absolute heart badge when already favorited */}
              {favorites.has(image.id) && (
                <div className="photo-heart-indicator">
                  <Heart size={14} fill="currentColor" />
                </div>
              )}

              {/* Hover actions Overlay */}
              <div className="photo-overlay" onClick={(e) => e.stopPropagation()}>
                {/* Top Favorite Toggle */}
                {gallery.allow_favorites && (
                  <button 
                    className={`photo-card-heart-btn ${favorites.has(image.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(image.id)}
                  >
                    <Heart size={16} fill={favorites.has(image.id) ? 'currentColor' : 'none'} />
                  </button>
                )}

                {/* Bottom row actions inside card */}
                <div className="photo-card-meta-bottom" onClick={() => setLightboxIndex(idx)}>
                  <div className="photo-name">{image.original_filename.split('.')[0]}</div>
                  {gallery.allow_downloads && (
                    <button 
                      className="photo-download-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
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
          <div style={{ textAlign: 'center', padding: '120px 24px', color: '#52525B' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📷</div>
            <h3>Aucune photo importée</h3>
            <p style={{ fontSize: 14, color: '#3F3F46', marginTop: 8 }}>Cette galerie est actuellement vide.</p>
          </div>
        )}
      </main>

      {/* ---- PHOTOGRAPHER MINI PROFILE ON PAGE ---- */}
      {gallery.profiles && (
        <section style={{ maxWidth: 800, margin: '60px auto 140px', padding: '0 24px' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            paddingTop: 60,
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: 'italic', color: '#A09890', marginBottom: 32 }}>
              Photographié par
            </h2>
            <div style={{ 
              width: 90, height: 90, borderRadius: '50%', 
              background: gallery.profiles.avatar_url ? `url(${gallery.profiles.avatar_url}) center/cover` : 'linear-gradient(135deg, #C8482E, #A93821)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 32, fontWeight: 700, color: '#FFF', marginBottom: 24, 
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.05)'
            }}>
              {!gallery.profiles.avatar_url && (gallery.profiles.display_name ? gallery.profiles.display_name.charAt(0).toUpperCase() : 'P')}
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 800, color: '#FFF', marginBottom: 12, letterSpacing: '-0.02em' }}>{photographerName}</h3>
            <p style={{ color: '#A09890', fontSize: 15, maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
              {gallery.profiles.bio || "Photographe professionnel. Revivez vos plus beaux moments en images."}
            </p>
            
            {/* Social & Contact Links (Minimalist style) */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {gallery.profiles.phone && (
                <a 
                  href={`https://wa.me/${gallery.profiles.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ padding: '12px 24px', background: '#FFF', borderRadius: 99, fontSize: 14, color: '#080808', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(255,255,255,0.1)' }}
                  className="hover:scale-105"
                >
                  <Phone size={15} /> WhatsApp
                </a>
              )}
              {gallery.profiles.instagram && (
                <a 
                  href={`https://instagram.com/${gallery.profiles.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, fontSize: 14, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                  className="hover:bg-white/[0.1] hover:scale-105"
                >
                  Instagram
                </a>
              )}
              {gallery.profiles.facebook && (
                <a 
                  href={gallery.profiles.facebook.startsWith('http') ? gallery.profiles.facebook : `https://${gallery.profiles.facebook}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, fontSize: 14, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                  className="hover:bg-white/[0.1] hover:scale-105"
                >
                  Facebook
                </a>
              )}
              {gallery.profiles.tiktok && (
                <a 
                  href={`https://tiktok.com/@${gallery.profiles.tiktok.replace('@', '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, fontSize: 14, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                  className="hover:bg-white/[0.1] hover:scale-105"
                >
                  TikTok
                </a>
              )}
              {gallery.profiles.website && (
                <a 
                  href={gallery.profiles.website.startsWith('http') ? gallery.profiles.website : `https://${gallery.profiles.website}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, fontSize: 14, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                  className="hover:bg-white/[0.1] hover:scale-105"
                >
                  <ExternalLink size={15} /> Site Web
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---- FIXED FLOATING BOTTOM BAR ---- */}
      {(favCount > 0 || gallery.allow_downloads) && images.length > 0 && (
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
              <button className="sticky-bar-btn" onClick={downloadFavorites}>
                <Download size={15} />
                Télécharger la sélection
              </button>
            ) : (
              gallery.allow_downloads && (
                <button 
                  className="sticky-bar-btn" 
                  disabled={isDownloadingAll}
                  onClick={async () => {
                    setIsDownloadingAll(true)
                    try {
                      const res = await fetch(`/api/galleries/${gallery.id}/download-zip`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ client_token: clientToken.current }),
                      })
                      if (res.ok) {
                        const { download_url } = await res.json()
                        window.open(download_url, '_blank')
                        toast.success("Téléchargement lancé", "La préparation de votre fichier ZIP a commencé.")
                      } else {
                        toast.error("Erreur", "Impossible de générer l'archive.")
                      }
                    } catch {
                      toast.error("Erreur", "Une erreur réseau est survenue.")
                    } finally {
                      setIsDownloadingAll(false)
                    }
                  }}
                >
                  <Download size={15} />
                  {isDownloadingAll ? 'Génération...' : 'Tout télécharger'}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* ---- LIGHTBOX VIEWER ---- */}
      {lightboxIndex !== null && (
        <ClientLightbox
          images={images}
          index={lightboxIndex}
          favorites={favorites}
          allowFavorite={gallery.allow_favorites}
          allowDownload={gallery.allow_downloads}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onFavorite={toggleFavorite}
          onDownload={handleDownload}
        />
      )}

      {/* ---- SHARE MODAL ---- */}
      {isShareModalOpen && (
        <div className="share-modal-backdrop" onClick={() => setIsShareModalOpen(false)}>
          <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-title">Partager la galerie</div>
            <div className="share-modal-desc">Partagez ce moment d&apos;exception avec vos proches.</div>
            
            <div className="share-options-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, margin: '20px 0' }}>
              <a 
                href={waUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="share-option-btn share-whatsapp"
                style={{ 
                  textDecoration: 'none', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', gap: 8, padding: '16px', borderRadius: '16px',
                  background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)',
                  color: '#25D366', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 20 }}>💬</span>
                <span>WhatsApp</span>
              </a>
              <button 
                className="share-option-btn" 
                onClick={handleCopyLink}
                style={{ 
                  display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', gap: 8, padding: '16px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  color: '#FFF', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                }}
              >
                <Link2 size={20} color="#C8482E" />
                <span>{copied ? 'Copié !' : 'Copier le lien'}</span>
              </button>
            </div>

            {/* Photographer details in share modal */}
            {gallery.profiles && (
              <div style={{ 
                borderTop: '1px solid rgba(255,255,255,0.06)', 
                paddingTop: 18, 
                marginTop: 20, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                textAlign: 'left'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#8E8E93' }}>Photographe</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>{photographerName}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {gallery.profiles.phone && (
                    <a 
                      href={`https://wa.me/${gallery.profiles.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 99, fontSize: 12, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Phone size={12} /> Contact
                    </a>
                  )}
                </div>
              </div>
            )}
            
            <button 
              className="control-pill" 
              onClick={() => setIsShareModalOpen(false)}
              style={{ margin: '24px auto 0', width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 12 }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Client Lightbox Component ──
function ClientLightbox({
  images,
  index,
  favorites,
  allowFavorite,
  allowDownload,
  onClose,
  onNavigate,
  onFavorite,
  onDownload,
}: {
  images: GalleryImage[]
  index: number
  favorites: Set<string>
  allowFavorite: boolean
  allowDownload: boolean
  onClose: () => void
  onNavigate: (i: number) => void
  onFavorite: (id: string) => void
  onDownload: (image: GalleryImage) => void
}) {
  const image = images[index]
  const isFav = favorites.has(image.id)
  const touchStartX = useRef(0)

  return (
    <div
      className="lightbox-backdrop"
      onClick={onClose}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        const delta = touchStartX.current - e.changedTouches[0].clientX
        if (delta > 50 && index < images.length - 1) onNavigate(index + 1)
        if (delta < -50 && index > 0) onNavigate(index - 1)
      }}
      style={{ background: 'rgba(5,5,5,0.98)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', zIndex: 120 }}
    >
      {/* Top bar inside lightbox */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 101,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: 14, color: '#8E8E93', fontWeight: 600 }}>
          {index + 1} / {images.length}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          {allowFavorite && (
            <button
              className={`photo-card-heart-btn ${isFav ? 'active' : ''}`}
              onClick={() => onFavorite(image.id)}
              style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          )}
          {allowDownload && (
            <button
              className="photo-card-heart-btn"
              onClick={() => onDownload(image)}
              style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Download size={15} />
            </button>
          )}
          <button
            className="photo-card-heart-btn"
            onClick={onClose}
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Prev Navigation Button */}
      {index > 0 && (
        <button
          className="lightbox-nav-btn"
          onClick={(e) => { e.stopPropagation(); onNavigate(index - 1) }}
          style={{
            position: 'fixed',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 101,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(18,18,18,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#C8482E'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(18,18,18,0.6)'}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Central Image View */}
      <div onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(image.r2_key)}
          alt={image.original_filename}
          style={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 30px 70px rgba(0,0,0,0.8)' }}
        />
      </div>

      {/* Next Navigation Button */}
      {index < images.length - 1 && (
        <button
          className="lightbox-nav-btn"
          onClick={(e) => { e.stopPropagation(); onNavigate(index + 1) }}
          style={{
            position: 'fixed',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 101,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(18,18,18,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#C8482E'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(18,18,18,0.6)'}
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  )
}
