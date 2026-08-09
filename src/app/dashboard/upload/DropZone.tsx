'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { CloudUpload, Image as ImageIcon, Folder } from 'lucide-react'

interface DropZoneProps {
  onFiles: (files: File[]) => void
}

export default function DropZone({ onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); onFiles(Array.from(e.dataTransfer.files)) }}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? '#C8482E' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, padding: '56px 24px', textAlign: 'center', background: dragging ? 'rgba(200,72,46,0.04)' : 'transparent', cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s' }}>
        {/* Les formats sont validés côté client (isValidImageFile) + côté serveur
            (imageUploadSchema) : seules les images JPG/PNG/WebP/HEIC/AVIF passent. */}
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
          onChange={e => onFiles(Array.from(e.target.files ?? []))} />
        <input ref={folderRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
          // @ts-expect-error - webkitdirectory n'existe pas dans le typage standard HTML
          webkitdirectory="true"
          onChange={e => onFiles(Array.from(e.target.files ?? []))} />
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(200,72,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CloudUpload size={28} color="#C8482E" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {dragging ? 'Déposez vos photos ici' : 'Glissez-déposez vos photos'}
        </h3>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 22 }}>JPG, PNG, WebP, HEIC, AVIF · Plusieurs fichiers ou dossier complet</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
            style={{ padding: '10px 22px', borderRadius: 9, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            <ImageIcon size={14} style={{ marginRight: 6, display: 'inline' }} />
            Choisir des photos
          </button>
          <button onClick={e => { e.stopPropagation(); folderRef.current?.click() }}
            style={{ padding: '10px 22px', borderRadius: 9, background: 'rgba(255,255,255,0.07)', color: '#A09890', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <Folder size={14} style={{ marginRight: 6, display: 'inline' }} />
            Importer un dossier
          </button>
        </div>
      </div>
    </motion.div>
  )
}
