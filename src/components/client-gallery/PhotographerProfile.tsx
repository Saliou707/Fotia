'use client'

import { Phone, ExternalLink } from 'lucide-react'
import type { GalleryWithProfile } from './types'

interface PhotographerProfileProps {
  gallery: GalleryWithProfile
  photographerName: string
}

export default function PhotographerProfile({ gallery, photographerName }: PhotographerProfileProps) {
  const profile = gallery.profiles
  if (!profile) return null

  return (
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
          background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, #C8482E, #A4351F)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, color: '#FFF', marginBottom: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          border: '2px solid rgba(255,255,255,0.05)'
        }}>
          {!profile.avatar_url && (profile.display_name ? profile.display_name.charAt(0).toUpperCase() : 'P')}
        </div>
        <h3 style={{ fontSize: 28, fontWeight: 800, color: '#FFF', marginBottom: 12, letterSpacing: '-0.02em' }}>{photographerName}</h3>
        <p style={{ color: '#A09890', fontSize: 15, maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
          {profile.bio || "Photographe professionnel. Revivez vos plus beaux moments en images."}
        </p>

        {/* Social & Contact Links (Minimalist style) */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {profile.phone && (
            <a
              href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '12px 24px', background: '#FFF', borderRadius: 99, fontSize: 14, color: '#080808', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(255,255,255,0.1)' }}
              className="hover:scale-105"
            >
              <Phone size={15} /> WhatsApp
            </a>
          )}
          {profile.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, fontSize: 14, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
              className="hover:bg-white/[0.1] hover:scale-105"
            >
              Instagram
            </a>
          )}
          {profile.facebook && (
            <a
              href={profile.facebook.startsWith('http') ? profile.facebook : `https://${profile.facebook}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, fontSize: 14, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
              className="hover:bg-white/[0.1] hover:scale-105"
            >
              Facebook
            </a>
          )}
          {profile.tiktok && (
            <a
              href={`https://tiktok.com/@${profile.tiktok.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, fontSize: 14, color: '#FFF', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
              className="hover:bg-white/[0.1] hover:scale-105"
            >
              TikTok
            </a>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
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
  )
}
