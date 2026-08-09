'use client'

import { Link2, Phone } from 'lucide-react'
import type { GalleryWithProfile } from './types'

interface ShareModalProps {
  gallery: GalleryWithProfile
  waUrl: string
  photographerName: string
  copied: boolean
  onClose: () => void
  onCopyLink: () => void
}

export default function ShareModal({
  gallery,
  waUrl,
  photographerName,
  copied,
  onClose,
  onCopyLink,
}: ShareModalProps) {
  const profile = gallery.profiles

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-title">Partager la galerie</div>
        <div className="share-modal-desc">Partagez ce moment d&apos;exception avec vos proches.</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="share-option-btn"
            style={{
              textDecoration: 'none', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 10, padding: '20px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(37,211,102,0.15) 0%, rgba(37,211,102,0.05) 100%)',
              border: '1px solid rgba(37,211,102,0.3)',
              color: '#25D366', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: 24 }}>💬</span>
            <span>WhatsApp</span>
          </a>
          <button
            className="share-option-btn"
            onClick={onCopyLink}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 10, padding: '20px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(200,72,46,0.15) 0%, rgba(200,72,46,0.05) 100%)',
              border: '1px solid rgba(200,72,46,0.3)',
              color: '#FFF', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            <Link2 size={24} color="#C8482E" />
            <span>{copied ? 'Lien copié !' : 'Copier le lien'}</span>
          </button>
        </div>

        {/* Photographer details in share modal */}
        {profile && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, #C8482E, #A4351F)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#FFF'
              }}>
                {!profile.avatar_url && (profile.display_name ? profile.display_name.charAt(0).toUpperCase() : 'P')}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#A09890', marginBottom: 2 }}>Photographe</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F2EDE4' }}>{photographerName}</div>
              </div>
            </div>
            <div>
              {profile.phone && (
                <a
                  href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 99, fontSize: 12, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
                  className="hover:bg-white/[0.15]"
                >
                  <Phone size={12} /> Contact
                </a>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '14px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', color: '#FFF', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}
          className="hover:bg-white/[0.1]"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
