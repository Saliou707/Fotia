'use client'
/* eslint-disable @next/next/no-img-element -- images servies directement par le CDN R2 */
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, MoreHorizontal, Eye, Heart, ArrowUpRight,
  Pencil, Share2, Trash2, Zap
} from 'lucide-react'
import { fadeUp } from '@/lib/animations'
import { fmtNumber, fmtDate, type Gallery } from '@/lib/api'

interface GalleryCardProps {
  gallery: Gallery
  menuOpen: boolean
  deleting: boolean
  onToggleMenu: () => void
  onToggleStatus: () => void
  onDelete: () => void
}

export default function GalleryCard({ gallery: g, menuOpen, deleting, onToggleMenu, onToggleStatus, onDelete }: GalleryCardProps) {
  const router = useRouter()

  return (
    <motion.div
      variants={fadeUp}
      style={{ position: 'relative', zIndex: menuOpen ? 20 : 1, opacity: deleting ? 0.35 : 1, transition: 'opacity 0.3s' }}
    >
      <motion.div
        whileHover={{ y: -3, borderColor: 'rgba(200,72,46,0.22)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
        style={{ background: 'rgba(14,14,14,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', transition: 'all 0.25s' }}
      >
        {/* Cover */}
        <div onClick={() => router.push(`/dashboard/gallery/${g.id}`)}
          style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#0A0A0A', cursor: 'pointer' }}
        >
          {g.cover_image_url ? (
            <img src={g.cover_image_url} alt={g.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(200,72,46,0.07)', border: '1px solid rgba(200,72,46,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={19} color="#C8482E" />
              </div>
              <span style={{ fontSize: 12, color: '#3D3D3D', fontWeight: 500 }}>Importer des photos</span>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)', pointerEvents: 'none' }} />

          {/* Status */}
          <div style={{ position: 'absolute', top: 10, left: 12 }}>
            <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 5, background: g.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)', color: g.status === 'active' ? '#22C55E' : '#A09890', border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
              {g.status === 'active' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', animation: 'liveDot 2s ease-in-out infinite', display: 'inline-block' }} />}
              {g.status === 'active' ? 'LIVE' : 'BROUILLON'}
            </span>
          </div>

          {/* Menu */}
          <button onClick={e => { e.stopPropagation(); onToggleMenu() }}
            style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 9, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#F2EDE4', transition: 'all 0.2s' }}
            className="hover:bg-white/[0.1]"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{g.title}</div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>{fmtDate(g.created_at)} · {g.photo_count} photo{g.photo_count !== 1 ? 's' : ''}</div>
          <div style={{ display: 'flex', gap: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#A09890', fontWeight: 500 }}>
              <Eye size={12} color="#F59E0B" /> {fmtNumber(g.view_count)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#A09890', fontWeight: 500 }}>
              <Heart size={12} color="#EC4899" /> {fmtNumber(g.favorite_count)}
            </div>
            <Link href={`/dashboard/gallery/${g.id}`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#C8482E', textDecoration: 'none', fontWeight: 700, padding: '5px 10px', borderRadius: 8, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.18)', transition: 'all 0.2s' }} className="hover:bg-[#C8482E]/20">
              Gérer <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', top: 44, right: 10, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '6px', zIndex: 30, minWidth: 180, boxShadow: '0 16px 48px rgba(0,0,0,0.8)' }}
          >
            <Link href={`/dashboard/gallery/${g.id}`} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 9, fontWeight: 500, transition: 'background 0.15s' }} className="hover:bg-white/[0.05]">
              <Pencil size={13} color="#C8482E" /> Gérer la galerie
            </Link>
            <button onClick={onToggleStatus} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderRadius: 9, fontWeight: 500, transition: 'background 0.15s' }} className="hover:bg-white/[0.05]">
              {g.status === 'active' ? <><Zap size={13} color="#555" /> Mettre en brouillon</> : <><Zap size={13} color="#22C55E" /> Publier</>}
            </button>
            <Link href={`/galerie/${g.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 9, fontWeight: 500, transition: 'background 0.15s' }} className="hover:bg-white/[0.05]">
              <Share2 size={13} color="#3B82F6" /> Vue client
            </Link>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', color: '#EF4444', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderRadius: 9, fontWeight: 500, transition: 'background 0.15s' }} className="hover:bg-red-500/[0.06]">
              <Trash2 size={13} /> Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
