'use client'
/* eslint-disable react-hooks/set-state-in-effect -- hydratation des favoris locaux + tracking de vue au montage */

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from '@/components/ui'
import { getClientToken, buildWhatsAppUrl } from '@/lib/utils'
import { getImageUrl } from '@/lib/api'
import type { GalleryImage } from '@/types'
import type { GalleryWithProfile } from '@/components/client-gallery/types'
import { galleryStyles } from '@/components/client-gallery/styles'
import HeroBanner from '@/components/client-gallery/HeroBanner'
import PhotoGrid from '@/components/client-gallery/PhotoGrid'
import PhotographerProfile from '@/components/client-gallery/PhotographerProfile'
import StickyActionBar from '@/components/client-gallery/StickyActionBar'
import ShareModal from '@/components/client-gallery/ShareModal'
import Lightbox from '@/components/client-gallery/Lightbox'

interface Props {
  gallery: GalleryWithProfile
  images: GalleryImage[]
  jsonLd?: string
}

export default function ClientGalleryView({ gallery, images, jsonLd }: Props) {
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

    // ── Track gallery view (1 per session via client_token uniqueness) ──
    // We use a session flag to avoid firing again on React strict-mode double mount
    const viewKey = `fotia_viewed_${gallery.id}`
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, '1')
      fetch(`/api/galleries/${gallery.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_token: clientToken.current }),
      }).catch(() => { /* silently ignore – tracking must never break the UX */ })
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

  const downloadAllZip = async () => {
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
      {/* JSON-LD ImageGallery : résultats enrichis Google (rendu SSR, invisible à l'écran) */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}

      {/* Import fonts and write custom styles */}
      <style>{galleryStyles(heroBgUrl, gallery.profiles?.avatar_url ?? null)}</style>

      {/* ---- HERO BANNER ---- */}
      <HeroBanner
        gallery={gallery}
        imagesCount={images.length}
        photographerName={photographerName}
        favCount={favCount}
        onOpenShare={() => setIsShareModalOpen(true)}
        onDownloadFavorites={downloadFavorites}
        onFavoriteAll={favoriteAll}
      />

      {/* ---- MAIN GALLERY SECTION ---- */}
      <PhotoGrid
        gallery={gallery}
        images={images}
        favorites={favorites}
        onOpenImage={setLightboxIndex}
        onToggleFavorite={toggleFavorite}
        onDownload={handleDownload}
      />

      {/* ---- PHOTOGRAPHER MINI PROFILE ON PAGE ---- */}
      <PhotographerProfile gallery={gallery} photographerName={photographerName} />

      {/* ---- FIXED FLOATING BOTTOM BAR ---- */}
      {(favCount > 0 || gallery.allow_downloads) && images.length > 0 && (
        <StickyActionBar
          gallery={gallery}
          favCount={favCount}
          isDownloadingAll={isDownloadingAll}
          onDownloadFavorites={downloadFavorites}
          onDownloadAllZip={downloadAllZip}
        />
      )}

      {/* ---- LIGHTBOX VIEWER ---- */}
      {lightboxIndex !== null && (
        <Lightbox
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
        <ShareModal
          gallery={gallery}
          waUrl={waUrl}
          photographerName={photographerName}
          copied={copied}
          onClose={() => setIsShareModalOpen(false)}
          onCopyLink={handleCopyLink}
        />
      )}
    </div>
  )
}
