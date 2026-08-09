'use client'

import { useRef, type ChangeEvent } from 'react'
import { Loader2, Camera, Phone, ExternalLink, HardDrive, Zap, Sparkles } from 'lucide-react'
import { Card } from './ui'
import { computeUsage } from './usage'
import type { ProfileForm, BillingData } from './types'

interface HeroCardProps {
  form: ProfileForm
  billing: BillingData
  uploadingAvatar: boolean
  onAvatarUpload: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function HeroCard({ form, billing, uploadingAvatar, onAvatarUpload }: HeroCardProps) {
  const { name, avatarUrl, phone, instagram, website } = form
  const { plan, storageUsedBytes } = billing

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { storageGB, maxStorageGB, storagePercent } = computeUsage(plan, storageUsedBytes)
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <Card className="settings-hero-card" style={{
      marginBottom: 24, padding: 28, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      background: 'linear-gradient(135deg, rgba(200,72,46,0.08) 0%, rgba(17,17,17,0.95) 60%)',
      border: '1px solid rgba(200,72,46,0.18)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      {/* Avatar with camera overlay */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #C8482E, #DF5438)',
          border: '3px solid rgba(200,72,46,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 800, color: '#fff',
          boxShadow: '0 0 0 4px rgba(200,72,46,0.1)',
        }}>
          {!avatarUrl && initials}
        </div>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={onAvatarUpload} style={{ display: 'none' }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAvatar}
          style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 26, height: 26, borderRadius: '50%',
            background: '#C8482E', border: '2px solid #15171A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
            opacity: uploadingAvatar ? 0.6 : 1, transition: 'opacity 0.2s',
          }}
        >
          {uploadingAvatar ? <Loader2 size={11} color="#fff" className="animate-spin" /> : <Camera size={11} color="#fff" />}
        </button>
      </div>

      {/* Name & plan badge */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{name || 'Votre nom'}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            background: plan === 'free' ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))',
            border: plan === 'free' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(251,191,36,0.3)',
            color: plan === 'free' ? '#A09890' : '#E8B33D',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            {plan === 'free' ? <><Zap size={9} />Essentiel</> : <><Sparkles size={9} />Premium Pro</>}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#A09890', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{phone}</span>}
          {instagram && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 11 }}>@</span>{instagram}</span>}
          {website && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={11} />Portfolio</span>}
        </div>
      </div>

      {/* Storage mini bar */}
      <div className="settings-hero-storage" style={{ minWidth: 160, maxWidth: 220, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A09890', marginBottom: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HardDrive size={10} />Stockage</span>
          <span style={{ fontFamily: 'monospace' }}>{storageGB} Go / {maxStorageGB} Go</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${storagePercent}%`,
            background: storagePercent > 85 ? '#EF4444' : 'linear-gradient(90deg, #C8482E, #DF5438)',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
    </Card>
  )
}
