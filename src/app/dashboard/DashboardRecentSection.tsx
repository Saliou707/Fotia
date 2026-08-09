'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Gallery } from '@/lib/api'
import Skeleton from './Skeleton'
import DashboardGalleryCard from './DashboardGalleryCard'

interface DashboardRecentSectionProps {
  loading: boolean
  galleries: Gallery[]
  onOpenCreate: () => void
  onDelete: (id: string) => void
  deletingId?: string | null
}

export default function DashboardRecentSection({ loading, galleries, onOpenCreate, onDelete, deletingId }: DashboardRecentSectionProps) {
  return (
    <div className="dash-galleries" style={{ padding: '0 36px 48px' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#F2EDE4', margin: 0 }}>Galeries récentes</h2>
          {!loading && galleries.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.22)', color: '#C8482E', borderRadius: 99, padding: '2px 9px' }}>
              {galleries.length}
            </span>
          )}
        </div>
        {!loading && galleries.length > 0 && (
          <Link href="/dashboard/galleries" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#A09890', textDecoration: 'none', fontWeight: 600, padding: '6px 12px', borderRadius: 9, transition: 'all 0.2s' }} className="hover:text-[#C8482E] hover:bg-white/[0.04]">
            Voir toutes <ArrowRight size={13} />
          </Link>
        )}
      </motion.div>

      {loading ? (
        <div className="gallery-grid" style={{ display: 'grid', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Skeleton h={160} radius={0} />
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton h={18} radius={6} /><Skeleton h={12} radius={5} w="60%" />
              </div>
            </div>
          ))}
        </div>
      ) : galleries.length === 0 ? (
        /* ── Empty state premium ── */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onOpenCreate}
          style={{ border: '1.5px dashed rgba(255,255,255,0.08)', borderRadius: 24, padding: '80px 24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(14,14,14,0.4)', transition: 'all 0.3s' }}
          className="hover:border-[#C8482E]/40 hover:bg-white/[0.01]"
        >
          <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Sparkles size={28} color="#C8482E" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, color: '#F2EDE4' }}>Créez votre première galerie client</h3>
          <p style={{ fontSize: 14, color: '#A09890', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Glissez-déposez vos créations, partagez sur WhatsApp et recevez les choix de vos clients instantanément.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(200,72,46,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenCreate}
            style={{ padding: '13px 32px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,72,46,0.3)' }}
          >
            Commencer maintenant
          </motion.button>
        </motion.div>
      ) : (
        <div className="gallery-grid" style={{ display: 'grid', gap: 16 }}>
          {galleries.map((g, i) => <DashboardGalleryCard key={g.id} g={g} onDelete={onDelete} index={i} deleting={deletingId === g.id} />)}
        </div>
      )}
    </div>
  )
}
