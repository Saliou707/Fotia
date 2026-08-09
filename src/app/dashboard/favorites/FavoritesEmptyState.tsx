'use client'

import { Heart } from 'lucide-react'

interface FavoritesEmptyStateProps {
  title?: string
  text: string
  iconSize?: number
}

export default function FavoritesEmptyState({ title, text, iconSize = 48 }: FavoritesEmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
      <Heart size={iconSize} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
      {title && <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{title}</h3>}
      <p style={{ fontSize: 14, color: '#A09890', maxWidth: 360, margin: '0 auto' }}>
        {text}
      </p>
    </div>
  )
}
