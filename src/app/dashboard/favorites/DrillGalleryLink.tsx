'use client'

import Link from 'next/link'
import { FolderOpen, ChevronRight } from 'lucide-react'

interface DrillGalleryLinkProps {
  galleryId: string
}

export default function DrillGalleryLink({ galleryId }: DrillGalleryLinkProps) {
  return (
    <Link href={`/dashboard/gallery/${galleryId}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', transition: 'background 0.2s',
      }}
        className="hover:bg-white/[0.05]"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FolderOpen size={15} color="#A09890" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F2EDE4' }}>Ouvrir la galerie complète</div>
            <div style={{ fontSize: 11, color: '#A09890' }}>Voir toutes les photos</div>
          </div>
        </div>
        <ChevronRight size={14} color="#A09890" />
      </div>
    </Link>
  )
}
