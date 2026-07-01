'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Modal, StatCard, CopyButton, toast } from '@/components/ui'
import { formatBytes, formatCount, isValidImageFile, buildWhatsAppUrl } from '@/lib/utils'
import type { Gallery, GalleryImage, UploadFile } from '@/types'
import { nanoid } from 'nanoid'
import { 
  ArrowLeft, Share2, Eye, Heart, Download, UploadCloud, 
  Trash2, ImageIcon, HelpCircle, Check, Loader2, Sparkles
} from 'lucide-react'

interface Props {
  gallery: Gallery
  initialImages: GalleryImage[]
  userId: string
}

const MAX_FREE_PHOTOS = 100

export default function GalleryManageClient({ gallery, initialImages, userId }: Props) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [uploads, setUploads] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stats, setStats] = useState({
    views: gallery.view_count ?? 0,
    favorites: gallery.favorite_count ?? 0,
    downloads: gallery.download_count ?? 0
  })

  // ── TEMPS RÉEL (REALTIME) ──
  useEffect(() => {
    let channel: any = null;
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      channel = supabase.channel(`realtime_gallery_${gallery.id}_${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'favorites', filter: `gallery_id=eq.${gallery.id}` }, () => {
           setStats(s => ({ ...s, favorites: s.favorites + 1 }));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'favorites', filter: `gallery_id=eq.${gallery.id}` }, () => {
           setStats(s => ({ ...s, favorites: Math.max(0, s.favorites - 1) }));
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'downloads', filter: `gallery_id=eq.${gallery.id}` }, () => {
           setStats(s => ({ ...s, downloads: s.downloads + 1 }));
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery_views', filter: `gallery_id=eq.${gallery.id}` }, () => {
           setStats(s => ({ ...s, views: s.views + 1 }));
        })
        .subscribe();
    });
    
    return () => {
       if (channel) {
         import('@/lib/supabase/client').then(({ createClient }) => createClient().removeChannel(channel));
       }
    }
  }, [gallery.id])

  const galleryUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/g/${gallery.slug}`
    : `https://fotia.app/g/${gallery.slug}`

  const waUrl = buildWhatsAppUrl(galleryUrl)

  // ---- Upload pipeline ----
  const processFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(isValidImageFile)
    if (validFiles.length === 0) {
      toast.error('Fichiers invalides', 'Seuls les formats JPG, PNG, WebP et HEIC sont acceptés.')
      return
    }

    const newUploads: UploadFile[] = validFiles.map((file) => ({
      id: nanoid(),
      file,
      preview_url: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }))

    setUploads((prev) => [...prev, ...newUploads])

    for (const upload of newUploads) {
      await uploadFile(upload)
    }
  }, [gallery.id])

  const uploadFile = async (upload: UploadFile) => {
    setUploads((prev) =>
      prev.map((u) => u.id === upload.id ? { ...u, status: 'uploading', progress: 10 } : u)
    )

    try {
      // Step 1: Get presigned upload URL from our API
      const initRes = await fetch('/api/upload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: upload.file.name,
          content_type: upload.file.type,
          file_size_bytes: upload.file.size,
          gallery_id: gallery.id,
        }),
      })

      if (!initRes.ok) {
        const err = await initRes.json()
        throw new Error(err.error ?? 'Initialisation du téléversement échouée')
      }

      const { image_id, upload_url } = await initRes.json()

      setUploads((prev) =>
        prev.map((u) => u.id === upload.id ? { ...u, progress: 30 } : u)
      )

      // Step 2: Upload directly to R2
      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': upload.file.type },
        body: upload.file,
      })

      if (!uploadRes.ok) throw new Error('Téléversement vers R2 échoué')

      setUploads((prev) =>
        prev.map((u) => u.id === upload.id ? { ...u, progress: 75, status: 'processing' } : u)
      )

      // Step 3: Confirm upload + trigger thumbnail generation
      const confirmRes = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id, gallery_id: gallery.id }),
      })

      if (!confirmRes.ok) throw new Error('Confirmation du traitement échouée')
      const confirmedImage: GalleryImage = await confirmRes.json()

      setUploads((prev) =>
        prev.map((u) => u.id === upload.id ? { ...u, progress: 100, status: 'done', image_id } : u)
      )

      // Add to images list
      setImages((prev) => [...prev, confirmedImage])

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Téléversement échoué'
      setUploads((prev) =>
        prev.map((u) => u.id === upload.id ? { ...u, status: 'error', error: message } : u)
      )
      toast.error('Erreur', message)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [processFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    processFiles(files)
    e.target.value = ''
  }

  const clearDoneUploads = () => {
    setUploads((prev) => prev.filter((u) => u.status !== 'done'))
  }

  const activeUploads = uploads.filter((u) => u.status === 'uploading' || u.status === 'processing')
  const hasUploads = uploads.length > 0

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      
      {/* ── HEADER NAVBAR ── */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          background: 'rgba(8,8,8,0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 25
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            href="/dashboard"
            style={{
              color: '#A09890',
              textDecoration: 'none',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500
            }}
            className="hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Retour
          </Link>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <h1
              style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: 0,
                color: '#F5F0EB'
              }}
            >
              {gallery.title}
            </h1>
            <span style={{ fontSize: 11.5, color: '#8E8E93', fontWeight: 500 }}>
              {images.length} photos importées
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={`/g/${gallery.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              <Eye size={13} style={{ marginRight: 6 }} /> Prévisualiser
            </Button>
          </Link>
          <Button
            id="share-whatsapp-btn"
            size="sm"
            onClick={() => setShowShare(true)}
            style={{ background: '#C8482E', border: 'none', color: '#fff' }}
          >
            <Share2 size={13} style={{ marginRight: 6 }} /> Partager
          </Button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1040, margin: '0 auto' }}>
        
        {/* ── STATS CARDS GRID ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 28,
          }}
          className="dashboard-stats-grid"
        >
          <StatCard label="Photos" value={images.length} icon={<ImageIcon size={14} />} />
          <StatCard label="Vues" value={formatCount(stats.views)} icon={<Eye size={14} />} />
          <StatCard label="Favoris" value={formatCount(stats.favorites)} icon={<Heart size={14} />} />
          <StatCard label="Téléchargements" value={formatCount(stats.downloads)} icon={<Download size={14} />} />
        </div>

        {/* ── DRAG & DROP ZONE (Workspace) ── */}
        <div
          className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
          style={{ 
            marginBottom: 28,
            borderRadius: 20,
            border: isDragging ? '2px dashed #C8482E' : '1px solid rgba(255,255,255,0.06)',
            background: isDragging ? 'rgba(200,72,46,0.05)' : 'rgba(17,17,17,0.3)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          <div style={{ 
            width: 60, height: 60, borderRadius: 16, 
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            color: '#A09890'
          }} className="upload-icon-wrapper">
            <UploadCloud size={24} color="#C8482E" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#F5F0EB' }}>
            {isDragging ? 'Déposez les fichiers ici' : 'Ajouter des photos à la galerie'}
          </div>
          <div style={{ fontSize: 13.5, color: '#8E8E93', marginBottom: 20 }}>
            Glissez-déposez vos images ici ou cliquez pour parcourir · JPG, PNG, WebP
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 10, height: 34, fontWeight: 600 }}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
          >
            Parcourir les fichiers
          </button>
        </div>

        {/* ── UPLOAD PROGRESS LIST ── */}
        <AnimatePresence>
          {hasUploads && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              style={{
                marginBottom: 28,
                background: 'rgba(17,17,17,0.45)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 20,
                padding: '20px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: '#F5F0EB', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {activeUploads.length > 0 ? (
                    <>
                      <Loader2 size={14} className="animate-spin" style={{ color: '#C8482E' }} />
                      <span>Téléversement de {activeUploads.length} photo{activeUploads.length > 1 ? 's' : ''}…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} style={{ color: '#C8482E' }} />
                      <span>Importation terminée avec succès</span>
                    </>
                  )}
                </span>
                {activeUploads.length === 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ height: 28, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                    onClick={clearDoneUploads}
                  >
                    Effacer la liste
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {uploads.map((u) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.015)' }}>
                    <img
                      src={u.preview_url}
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 8,
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: 4,
                          color: u.status === 'error' ? 'var(--error)' : '#F5F0EB',
                        }}
                      >
                        {u.error ?? u.file.name}
                      </div>
                      
                      {/* Premium inline linear progress bar */}
                      {u.status !== 'error' && u.status !== 'done' && (
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginTop: 6 }}>
                          <div style={{ height: '100%', width: `${u.progress}%`, background: 'linear-gradient(90deg, #C8482E 0%, #DF5D43 100%)', borderRadius: 99, transition: 'width 0.2s ease' }} />
                        </div>
                      )}
                      
                      {u.status === 'done' && (
                        <span style={{ fontSize: 11.5, color: '#22C55E', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check size={12} /> Prêt · {formatBytes(u.file.size)}
                        </span>
                      )}
                      {u.status === 'error' && (
                        <span style={{ fontSize: 11.5, color: 'var(--error)', fontWeight: 500 }}>Échec du téléversement</span>
                      )}
                    </div>
                    
                    <span style={{ fontSize: 12, color: '#8E8E93', flexShrink: 0, fontWeight: 600 }}>
                      {u.status === 'uploading' && `${u.progress}%`}
                      {u.status === 'processing' && 'Retouche...'}
                      {u.status === 'done' && '✓'}
                      {u.status === 'error' && '✕'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PHOTO GRID ── */}
        {images.length > 0 ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F5F0EB' }}>Photos de la galerie</h2>
              <span style={{ fontSize: 12.5, color: '#8E8E93', fontWeight: 500 }}>
                {images.length} / {MAX_FREE_PHOTOS} photos (Plan Gratuit)
              </span>
            </div>
            
            <div className="gallery-grid">
              {images.map((image, idx) => (
                <div
                  key={image.id}
                  className="photo-card"
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.05)',
                    aspectRatio: '1',
                    background: '#0D0D0D'
                  }}
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img
                    src={image.thumbnail_url ?? image.url ?? image.r2_key}
                    alt={image.caption ?? `Photo ${idx + 1}`}
                    loading="lazy"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      display: 'block',
                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                  <div className="photo-card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                  <div className="photo-card-actions" style={{ bottom: 12, right: 12 }}>
                    <button
                      className="btn-favorite"
                      style={{ width: 34, height: 34 }}
                      title="Télécharger l'original"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(image.url ?? '#', '_blank')
                      }}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: '#5A5550',
              fontSize: 14.5,
              fontWeight: 500,
              border: '1px dashed rgba(255,255,255,0.06)',
              borderRadius: 16,
              background: 'rgba(17,17,17,0.1)'
            }}
          >
            Aucune photo dans cette galerie — importez vos fichiers ci-dessus.
          </div>
        )}
      </div>

      {/* ── LIGHTBOX VIEWER ── */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
        />
      )}

      {/* ── SHARE MODAL ── */}
      <Modal
        open={showShare}
        onClose={() => setShowShare(false)}
        title="Partager la galerie client"
        description="Envoyez ce lien sécurisé à votre client pour qu'il puisse faire son choix."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Gallery Link field */}
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Lien de la galerie</div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '10px 14px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: '#A09890',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500
                }}
              >
                {galleryUrl}
              </span>
              <CopyButton text={galleryUrl} />
            </div>
          </div>

          {/* WhatsApp Direct button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="whatsapp-share-link"
            style={{ display: 'block', textDecoration: 'none' }}
            onClick={() => {
              // Register sharing stat
              fetch('/api/galleries/' + gallery.id + '/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform: 'whatsapp' }),
              }).catch(() => {})
            }}
          >
            <button
              className="btn btn-lg hover-scale"
              style={{
                width: '100%',
                background: '#25D366',
                color: 'white',
                gap: 10,
                borderRadius: 12,
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(37,211,102,0.2)'
              }}
            >
              <WhatsAppIcon />
              Envoyer sur WhatsApp
            </button>
          </a>

          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 12,
              fontSize: 13,
              color: '#A09890',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 500
            }}
          >
            <span>📊</span>
            <span>
              <strong style={{ color: '#F5F0EB' }}>{formatCount(stats.favorites)} favoris</strong> sélectionnés par le client pour le moment.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── LIGHTBOX COMPONENT ──
function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[]
  index: number
  onClose: () => void
  onNavigate: (i: number) => void
}) {
  const image = images[index]

  return (
    <div
      className="lightbox-backdrop"
      onClick={onClose}
      style={{ background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', zIndex: 150 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#fff',
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 151,
          transition: 'all 0.2s'
        }}
        className="hover:bg-white/[0.08]"
      >
        ✕
      </button>

      {/* Prev Navigation arrow */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(index - 1) }}
          style={{
            position: 'fixed',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 151,
            transition: 'all 0.2s'
          }}
          className="hover:bg-white/[0.08]"
        >
          ‹
        </button>
      )}

      {/* Main Image viewer */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '90vw', 
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <img
          src={image.url ?? image.r2_key}
          alt={image.caption ?? ''}
          style={{
            maxWidth: '90vw',
            maxHeight: '82vh',
            objectFit: 'contain',
            borderRadius: 14,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        />
      </div>

      {/* Next Navigation arrow */}
      {index < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(index + 1) }}
          style={{
            position: 'fixed',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 151,
            transition: 'all 0.2s'
          }}
          className="hover:bg-white/[0.08]"
        >
          ›
        </button>
      )}

      {/* Footer Page Counter */}
      <div
        style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          borderRadius: 99,
          padding: '6px 18px',
          fontSize: 12.5,
          color: '#A09890',
          fontWeight: 600
        }}
      >
        {index + 1} / {images.length}
      </div>
    </div>
  )
}

// ── CUSTOM WHATSAPP ICON ──
function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}
