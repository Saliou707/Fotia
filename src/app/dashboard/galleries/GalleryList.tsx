'use client'
/* eslint-disable @next/next/no-img-element -- images servies directement par le CDN R2 */
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Heart, Trash2, Image as ImageIcon } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { fmtNumber, fmtDate, type Gallery } from '@/lib/api'

interface GalleryListProps {
  galleries: Gallery[]
  deletingId: string | null
  onDelete: (id: string) => void
}

export default function GalleryList({ galleries, deletingId, onDelete }: GalleryListProps) {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="galleries-list-view"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}
    >
      {/* Entête */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <span>Galerie</span>
        <span style={{ textAlign: 'center' }}>Photos</span>
        <span style={{ textAlign: 'center' }}>Vues</span>
        <span style={{ textAlign: 'center' }}>Favs</span>
        <span style={{ textAlign: 'right' }}>Actions</span>
      </div>
      {galleries.map((g, i) => (
        <motion.div key={g.id} variants={fadeUp}
          style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px', padding: '14px 20px', alignItems: 'center', borderBottom: i < galleries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: deletingId === g.id ? 0.35 : 1, transition: 'all 0.2s', background: 'transparent' }}
          className="list-row"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {g.cover_image_url ? (
              <img src={g.cover_image_url} alt={g.title} loading="lazy" decoding="async" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(200,72,46,0.07)', border: '1px solid rgba(200,72,46,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ImageIcon size={17} color="#C8482E" />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{g.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#555' }}>{fmtDate(g.created_at)}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: g.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', color: g.status === 'active' ? '#22C55E' : '#555', border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                  {g.status === 'active' ? 'LIVE' : 'BROUILLON'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: '#F2EDE4' }}>{g.photo_count}</div>
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13.5, fontWeight: 600, color: '#F59E0B' }}><Eye size={12} /> {fmtNumber(g.view_count)}</div>
          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13.5, fontWeight: 600, color: '#EC4899' }}><Heart size={12} fill="#EC4899" color="#EC4899" /> {fmtNumber(g.favorite_count)}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <Link href={`/dashboard/gallery/${g.id}`} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', color: '#C8482E', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, transition: 'all 0.2s' }} className="hover:bg-[#C8482E]/20">
              Gérer
            </Link>
            <button onClick={() => onDelete(g.id)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} className="hover:bg-red-500/10">
              <Trash2 size={13} />
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
