'use client'
import Link from 'next/link'
import Image from 'next/image'
import { X, ArrowRight, Heart } from 'lucide-react'
import { m } from 'framer-motion'
import { HERO_PHOTOS } from '@/lib/hero-photos'

interface DemoModalProps {
  isMobile: boolean
  demoLikes: Record<number, boolean>
  onToggleLike: (i: number) => void
  onClose: () => void
}

export default function DemoModal({ isMobile, demoLikes, onToggleLike, onClose }: DemoModalProps) {
  const likeCount = Object.keys(demoLikes).filter(k => demoLikes[Number(k)]).length

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? 12 : 24,
      }}
      onClick={onClose}
    >
      <m.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#121316', border: '1px solid rgba(223,84,56,0.3)',
          borderRadius: 24, width: '100%', maxWidth: 940, maxHeight: '90vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 90px rgba(0,0,0,0.9), 0 0 40px rgba(200,72,46,0.25)',
        }}
      >
            {/* Header */}
            <div style={{
              padding: '16px 24px', background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>📸</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#F2EDE4' }}>
                    Galerie Démo Client : Mariage de Fatima &amp; Ibrahima
                  </div>
                  <div style={{ fontSize: 12, color: '#A09890' }}>
                    Testez l&apos;expérience exacte qu&apos;auront vos futurs clients
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  href="/signup"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px', borderRadius: 10, background: '#C8482E',
                    color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 13,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  Créer la mienne <ArrowRight size={14} />
                </Link>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    borderRadius: 10, padding: 8, color: '#F2EDE4', cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Banner alert */}
              <div style={{
                padding: '12px 18px', borderRadius: 14, background: 'rgba(223,84,56,0.1)',
                border: '1px solid rgba(223,84,56,0.25)', marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
              }}>
                <div style={{ fontSize: 13, color: '#F2EDE4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={15} color="#C8482E" fill="#C8482E" />
                  <strong>Essayez de cliquer sur le coeur ❤️ pour aimer une photo en direct !</strong>
                </div>
                <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 99, color: '#DF5438', fontWeight: 600 }}>
                  {likeCount} favori(s) sélectionné(s)
                </span>
              </div>

              {/* Grid of sample photos */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: 14,
              }}>
                {HERO_PHOTOS.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative', borderRadius: 14, overflow: 'hidden',
                      aspectRatio: '4/3', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Image src={src} alt={`Demo photo ${i + 1}`} fill sizes="300px" style={{ objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)',
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                      padding: 10,
                    }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                        #IMG_{1040 + i}
                      </span>
                      <button
                        onClick={() => onToggleLike(i)}
                        style={{
                          background: demoLikes[i] ? '#C8482E' : 'rgba(0,0,0,0.6)',
                          border: demoLikes[i] ? 'none' : '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '50%', width: 32, height: 32,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                      >
                        <Heart size={15} color="#fff" fill={demoLikes[i] ? '#fff' : 'transparent'} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div style={{
              padding: '16px 24px', background: 'rgba(255,255,255,0.02)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 14,
            }}>
              <div style={{ fontSize: 13, color: '#A09890' }}>
                Vos clients peuvent télécharger leurs favoris en 1 clic au format ZIP HD.
              </div>
              <Link
                href="/signup"
                onClick={onClose}
                style={{
                  padding: '12px 24px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)',
                  color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14,
                  boxShadow: '0 4px 16px rgba(223,84,56,0.35)',
                }}
              >
                Démarrer gratuitement maintenant →
              </Link>
            </div>
        </m.div>
    </m.div>
  )
}
