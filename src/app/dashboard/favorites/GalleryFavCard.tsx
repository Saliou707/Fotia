'use client'
/* eslint-disable @next/next/no-img-element -- images servies directement par le CDN R2 */
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, FolderOpen } from 'lucide-react'
import { fadeUp } from '@/lib/animations'
import { getImageUrl, type FavoriteGalleryStat } from '@/lib/api'

interface GalleryFavCardProps {
  gallery: FavoriteGalleryStat
  maxFav: number
  onOpen: () => void
}

export default function GalleryFavCard({ gallery: g, maxFav, onOpen }: GalleryFavCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.99 }}
      style={{
        background: 'rgba(14,14,14,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
      className="gallery-card"
    >
      {/* Cover image */}
      <div style={{ height: 140, overflow: 'hidden', background: '#0d0d0d', position: 'relative' }}>
        {g.cover ? (
          <img src={getImageUrl(g.cover)} alt={g.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={32} color="rgba(255,255,255,0.07)" fill="rgba(255,255,255,0.07)" />
          </div>
        )}
        {/* Badge favoris */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(200,72,46,0.85)', backdropFilter: 'blur(8px)',
          borderRadius: 99, padding: '4px 12px',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 700, color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 12px rgba(200,72,46,0.3)'
        }}>
          <Heart size={12} color="#fff" fill="#fff" />
          {g.favorite_count}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 12 }}>
          {g.title}
        </div>

        {/* Barre de progression relative */}
        <div style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.05)', marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(g.favorite_count / maxFav) * 100}%`, background: 'linear-gradient(90deg, rgba(200,72,46,0.4), #C8482E)', borderRadius: 99, transition: 'width 0.4s ease' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onOpen}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              background: 'rgba(200,72,46,0.08)',
              border: '1px solid rgba(200,72,46,0.2)', color: '#DF5438',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
            className="hover:bg-red-500/20"
          >
            <Heart size={12} fill="#DF5438" color="#DF5438" />
            Voir les favoris
          </button>
          <Link href={`/dashboard/gallery/${g.id}`} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
            <button
              style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#A09890', fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              className="hover:bg-white/[0.08] hover:text-white"
              title="Ouvrir la galerie"
            >
              <FolderOpen size={13} />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
