'use client'
/* eslint-disable @next/next/no-img-element -- images servies directement par le CDN R2 */
import { Check } from 'lucide-react'
import { getImageUrl, type FavoritePhoto } from '@/lib/api'

interface FavoritePhotoCardProps {
  photo: FavoritePhoto
  selected: boolean
  drill?: boolean
  onToggle: () => void
}

export default function FavoritePhotoCard({ photo, selected, drill = false, onToggle }: FavoritePhotoCardProps) {
  return (
    <div
      className="fav-photo-card"
      onClick={onToggle}
      style={{
        position: 'relative', borderRadius: 12, overflow: 'hidden',
        cursor: 'pointer', background: '#111',
        border: selected ? `${drill ? 2.5 : 2}px solid #C8482E` : `${drill ? 2.5 : 2}px solid transparent`,
        transition: 'border 0.15s, box-shadow 0.15s',
        boxShadow: selected && drill ? '0 0 0 3px rgba(200,72,46,0.18)' : 'none',
      }}
    >
      <img src={getImageUrl(photo.r2_key)} alt={photo.original_filename} loading="lazy" style={{ width: '100%', display: 'block' }} />

      {/* Badge sélection */}
      <div style={{
        position: 'absolute', top: drill ? 8 : 10, right: drill ? 8 : 10, width: 22, height: 22, borderRadius: '50%',
        background: selected ? '#C8482E' : drill ? 'rgba(17,17,17,0.7)' : 'rgba(0,0,0,0.5)',
        border: selected ? 'none' : drill ? '1.5px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
      }}>
        {selected && <Check size={12} color="#fff" strokeWidth={3} />}
      </div>

      {/* Filename overlay */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: drill ? '20px 10px 8px' : '12px 10px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          opacity: selected ? 1 : 0, transition: 'opacity 0.18s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => { if (!selected) e.currentTarget.style.opacity = '0' }}
      >
        <div style={{ fontSize: drill ? 10.5 : 11, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.original_filename}</div>
        {!drill && <div style={{ fontSize: 10, color: '#A09890' }}>{photo.gallery_title}</div>}
      </div>
    </div>
  )
}
