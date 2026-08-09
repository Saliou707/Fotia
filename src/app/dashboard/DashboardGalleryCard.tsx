'use client'
/* eslint-disable @next/next/no-img-element -- images servies directement par le CDN R2 */
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, MoreHorizontal, Pencil, Share2, Trash2,
  TrendingUp, Calendar, Image as ImageIcon, Eye, Heart, ChevronRight
} from 'lucide-react'
import { fmtNumber, fmtDate, type Gallery } from '@/lib/api'

interface DashboardGalleryCardProps {
  g: Gallery
  onDelete: (id: string) => void
  index: number
  deleting?: boolean
}

export default function DashboardGalleryCard({ g, onDelete, index, deleting = false }: DashboardGalleryCardProps) {
  const [menu, setMenu] = useState(false)
  const engagementRate = g.view_count > 0 ? Math.round((g.favorite_count / g.view_count) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: deleting ? 0.35 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 18, overflow: 'visible', position: 'relative',
        zIndex: menu ? 20 : 1,
        background: 'rgba(14,14,14,0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
      whileHover={{ y: -4, borderColor: 'rgba(200,72,46,0.25)', boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,72,46,0.1)' }}
    >
      {/* Cover */}
      <div
        onClick={() => window.location.href = `/dashboard/gallery/${g.id}`}
        style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#0A0A0A', borderTopLeftRadius: 17, borderTopRightRadius: 17, cursor: 'pointer' }}
      >
        {g.cover_image_url ? (
          <img
            src={g.cover_image_url} alt={g.title} loading="lazy" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} color="#C8482E" />
            </div>
            <span style={{ fontSize: 12, color: '#4A4A4A', fontWeight: 500 }}>Importer des photos</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)', pointerEvents: 'none' }} />

        {/* Status */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{
            padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            background: g.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
            color: g.status === 'active' ? '#22C55E' : '#A09890',
            border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {g.status === 'active' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'liveDot 2s ease-in-out infinite' }} />}
            {g.status === 'active' ? 'LIVE' : 'BROUILLON'}
          </span>
        </div>

        {/* Engagement badge */}
        {g.view_count > 0 && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 99, padding: '3px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <TrendingUp size={11} color="#22C55E" />
            <span style={{ fontSize: 11, color: '#F2EDE4', fontWeight: 600 }}>{engagementRate}% engagement</span>
          </div>
        )}

        {/* Menu button */}
        <button
          onClick={e => { e.stopPropagation(); setMenu(!menu) }}
          style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 9, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#F2EDE4', transition: 'all 0.2s' }}
          className="hover:bg-white/[0.1]"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 4 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', top: 46, right: 12, zIndex: 30, minWidth: 176, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', overflow: 'hidden', padding: '6px' }}
          >
            <Link href={`/dashboard/gallery/${g.id}`} onClick={() => setMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 9, fontWeight: 500 }} className="hover:bg-white/[0.05]">
              <Pencil size={13} color="#C8482E" /> Gérer
            </Link>
            <Link href={`/galerie/${g.slug}`} target="_blank" onClick={() => setMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 9, fontWeight: 500 }} className="hover:bg-white/[0.05]">
              <Share2 size={13} color="#3B82F6" /> Vue client
            </Link>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <button onClick={() => { onDelete(g.id); setMenu(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#EF4444', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderRadius: 9, fontWeight: 500 }} className="hover:bg-red-500/[0.07]">
              <Trash2 size={13} /> Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ marginBottom: 14 }}>
          <Link href={`/dashboard/gallery/${g.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4, transition: 'color 0.2s' }} className="hover:text-[#C8482E]">
              {g.title}
            </div>
          </Link>
          <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={11} /> {fmtDate(g.created_at)}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#A09890', fontWeight: 500 }}>
            <ImageIcon size={12} color="#555" /> {g.photo_count}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#A09890', fontWeight: 500 }}>
            <Eye size={12} color="#F59E0B" /> {fmtNumber(g.view_count)}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#A09890', fontWeight: 500 }}>
            <Heart size={12} color="#EC4899" /> {fmtNumber(g.favorite_count)}
          </div>
          <Link href={`/dashboard/gallery/${g.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#C8482E', textDecoration: 'none', fontWeight: 700, padding: '5px 10px', borderRadius: 8, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.18)', transition: 'all 0.2s' }} className="hover:bg-[#C8482E]/20">
            Gérer <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
