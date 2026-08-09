'use client'
/* eslint-disable @next/next/no-img-element -- image plein écran servie par le CDN R2 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { Heart, Download, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '@/lib/api'
import type { GalleryImage } from '@/types'

interface LightboxProps {
  images: GalleryImage[]
  index: number
  favorites: Set<string>
  allowFavorite: boolean
  allowDownload: boolean
  onClose: () => void
  onNavigate: (i: number) => void
  onFavorite: (id: string) => void
  onDownload: (image: GalleryImage) => void
}

// ── Fullscreen Swipeable Lightbox ──
export default function Lightbox({
  images,
  index,
  favorites,
  allowFavorite,
  allowDownload,
  onClose,
  onNavigate,
  onFavorite,
  onDownload,
}: LightboxProps) {
  const image = images[index]
  const isFav = favorites.has(image.id)

  // Touch swipe state
  const dragX = useRef(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const isHorizontalSwipe = useRef<boolean | null>(null)
  const [offsetX, setOffsetX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  // Lock body scroll when lightbox is open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1)
      if (e.key === 'ArrowRight' && index < images.length - 1) onNavigate(index + 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [index, images.length, onClose, onNavigate])

  // Reset offset when index changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset volontaire de l'offset de swipe
    setOffsetX(0)
    setIsSwiping(false)
  }, [index])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true
    isHorizontalSwipe.current = null
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    dragX.current = 0
    setIsSwiping(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = currentX - startX.current
    const diffY = currentY - startY.current

    // Determine swipe direction on first significant move
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY)
      }
      return
    }

    if (!isHorizontalSwipe.current) return

    e.preventDefault()
    dragX.current = diffX

    // Apply resistance at edges
    let adjustedX = diffX
    if ((index === 0 && diffX > 0) || (index === images.length - 1 && diffX < 0)) {
      adjustedX = diffX * 0.3 // rubber-band effect
    }
    setOffsetX(adjustedX)
  }, [index, images.length])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false

    const threshold = 60

    if (dragX.current < -threshold && index < images.length - 1) {
      onNavigate(index + 1)
    } else if (dragX.current > threshold && index > 0) {
      onNavigate(index - 1)
    } else {
      // Snap back
      setOffsetX(0)
      setIsSwiping(false)
    }
  }, [index, images.length, onNavigate])

  return (
    <div className="lightbox-fullscreen">
      {/* Top bar */}
      <div className="lightbox-topbar">
        <span className="lightbox-counter">
          {index + 1} / {images.length}
        </span>
        <div className="lightbox-topbar-actions">
          {allowFavorite && (
            <button
              className={`lightbox-icon-btn ${isFav ? 'fav-active' : ''}`}
              onClick={() => onFavorite(image.id)}
            >
              <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          )}
          {allowDownload && (
            <button
              className="lightbox-icon-btn"
              onClick={() => onDownload(image)}
            >
              <Download size={16} />
            </button>
          )}
          <button className="lightbox-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Image area with swipe */}
      <div
        className="lightbox-image-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop nav buttons */}
        {index > 0 && (
          <button
            className="lightbox-desktop-nav prev"
            onClick={() => onNavigate(index - 1)}
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {index < images.length - 1 && (
          <button
            className="lightbox-desktop-nav next"
            onClick={() => onNavigate(index + 1)}
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Swipeable image container */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={image.id}
            className="lightbox-slide-container"
            initial={{ opacity: 0.5, x: offsetX > 0 ? -80 : 80 }}
            animate={{ opacity: 1, x: offsetX, scale: isSwiping ? 0.97 : 1 }}
            exit={{ opacity: 0, x: offsetX > 0 ? 200 : -200 }}
            transition={isSwiping ? { type: 'tween', duration: 0 } : { type: 'spring', stiffness: 350, damping: 35 }}
          >
            <img
              src={getImageUrl(image.r2_key)}
              alt={image.original_filename}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
