'use client'
import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudUpload, X, Check, ArrowRight, Image as ImageIcon, Folder } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateGallery, fmtBytes } from '@/lib/api'

interface UpFile {
  id: string; file: File; name: string; sizeBytes: number
  preview: string; status: 'attente' | 'upload' | 'terminé' | 'erreur'
  progress: number
}

// ─── Étape visuelle ──────────────────────────────────────────────────────────
type Stage = 'idle' | 'uploading' | 'optimizing' | 'done'

function StageIndicator({ stage, uploaded, total }: { stage: Stage; uploaded: number; total: number }) {
  const steps = [
    { key: 'uploading', icon: '📤', label: 'Upload en cours…' },
    { key: 'optimizing', icon: '⚙️', label: 'Optimisation des images…' },
    { key: 'done', icon: '✅', label: 'Galerie prête !' },
  ]
  const currentIdx = stage === 'uploading' ? 0 : stage === 'optimizing' ? 1 : stage === 'done' ? 2 : -1
  const pct = total > 0 ? Math.round((uploaded / total) * 100) : 0

  return (
    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', marginBottom: 24 }}>
      {/* Étapes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 20 }}>
        {steps.map((s, i) => {
          const isActive = i === currentIdx
          const isDone = i < currentIdx
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: isDone ? '#22C55E' : isActive ? '#C8482E' : 'rgba(255,255,255,0.07)', border: `2px solid ${isDone ? '#22C55E' : isActive ? '#C8482E' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all 0.4s', boxShadow: isActive ? '0 0 16px rgba(200,72,46,0.4)' : 'none' }}>
                  {isDone ? <Check size={20} color="#fff" /> : <span>{s.icon}</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? '#C8482E' : isDone ? '#22C55E' : '#555', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 60, height: 2, background: i < currentIdx ? '#22C55E' : 'rgba(255,255,255,0.07)', margin: '0 8px 20px', transition: 'background 0.4s', flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>
      {/* Barre globale */}
      {stage !== 'idle' && (
        <div>
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${stage === 'done' ? 100 : stage === 'optimizing' ? 85 : pct}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: stage === 'done' ? '#22C55E' : 'linear-gradient(90deg,#C8482E,#DF5D43)', borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
            <span style={{ color: '#555' }}>
              {stage === 'uploading' && `${uploaded} / ${total} photo${total > 1 ? 's' : ''}`}
              {stage === 'optimizing' && 'Finalisation de la galerie…'}
              {stage === 'done' && `${total} photo${total > 1 ? 's' : ''} importée${total > 1 ? 's' : ''} avec succès`}
            </span>
            <span style={{ fontWeight: 700, color: stage === 'done' ? '#22C55E' : '#C8482E' }}>
              {stage === 'done' ? '100%' : stage === 'optimizing' ? '85%' : `${pct}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function UploadPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const galleryId = searchParams.get('gallery')

  const [galleryTitle, setGalleryTitle] = useState<string>('')
  const [gallerySlug, setGallerySlug] = useState<string>('')
  const [files, setFiles] = useState<UpFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState<Stage>('idle')
  const [uploaded, setUploaded] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef(false)

  useEffect(() => {
    if (!galleryId) return
    const supabase = createClient()
    supabase.from('galleries').select('title, slug').eq('id', galleryId).single()
      .then(({ data }) => {
        if (data) { setGalleryTitle(data.title); setGallerySlug(data.slug) }
      })
  }, [galleryId])

  const addAndUpload = useCallback(async (newFiles: File[]) => {
    if (!galleryId) return
    const accepted = newFiles.filter(f => f.type.startsWith('image/') || f.type === 'video/mp4')
    if (accepted.length === 0) return

    const mapped: UpFile[] = accepted.map(f => ({
      id: Math.random().toString(36).slice(2), file: f, name: f.name,
      sizeBytes: f.size, preview: URL.createObjectURL(f), status: 'attente', progress: 0,
    }))
    setFiles(prev => [...prev, ...mapped])
    setStage('uploading')
    setUploaded(0)
    abortRef.current = false

    let done = 0
    for (const f of mapped) {
      if (abortRef.current) break
      setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'upload', progress: 5 } : x))
      try {
        // Upload direct via le serveur (évite les problèmes CORS R2)
        const formData = new FormData()
        formData.append('file', f.file)
        formData.append('gallery_id', galleryId)

        // Progression simulée pendant l'upload
        const prog = setInterval(() => {
          setFiles(prev => prev.map(x => x.id === f.id && x.progress < 80 ? { ...x, progress: x.progress + 8 } : x))
        }, 150)

        const res = await fetch('/api/upload/direct', { method: 'POST', body: formData })
        clearInterval(prog)

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`)

        setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'terminé', progress: 100 } : x))
        done++
        setUploaded(done)
      } catch {
        setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'erreur', progress: 0 } : x))
      }
    }

    // Publier automatiquement la galerie après l'upload
    if (done > 0) {
      await updateGallery(galleryId, { status: 'active' })
    }

    // Phase optimisation (simulée, les images sont déjà sur R2)
    setStage('optimizing')
    await new Promise(r => setTimeout(r, 1800))
    setStage('done')
  }, [galleryId])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    addAndUpload(Array.from(e.dataTransfer.files))
  }, [addAndUpload])

  const totalFiles = files.length
  const uploadedCount = files.filter(f => f.status === 'terminé').length
  const hasErrors = files.some(f => f.status === 'erreur')

  return (
    <div style={{ minHeight: 'calc(100vh - 58px)', padding: '28px', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>

        {/* Header */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} style={{ marginBottom: 24 }}>
          {galleryTitle ? (
            <div>
              <div style={{ fontSize: 12, color: '#555', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Galerie</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{galleryTitle}</h1>
              <p style={{ fontSize: 14, color: '#555' }}>Importez vos photos — elles seront optimisées automatiquement.</p>
            </div>
          ) : (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Importer des photos</h1>
              <p style={{ fontSize: 14, color: '#555' }}>Sélectionnez une galerie puis importez vos photos.</p>
            </div>
          )}
        </motion.div>

        {/* Étapes visuelles (affiché dès qu'on commence) */}
        {stage !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StageIndicator stage={stage} uploaded={uploadedCount} total={totalFiles} />
          </motion.div>
        )}

        {/* Écran terminé */}
        {stage === 'done' ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: '#111111', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Galerie prête !</h2>
            <p style={{ fontSize: 14, color: '#A1A1AA', marginBottom: 8 }}>
              <strong style={{ color: '#F7F7F5' }}>{uploadedCount} photo{uploadedCount > 1 ? 's' : ''}</strong> importée{uploadedCount > 1 ? 's' : ''} avec succès.
            </p>
            {hasErrors && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 8 }}>⚠️ Certains fichiers ont échoué — réessayez-les manuellement.</p>}
            <p style={{ fontSize: 14, color: '#555', marginBottom: 32 }}>Vous pouvez maintenant partager votre galerie avec votre client.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => { setFiles([]); setStage('idle'); setUploaded(0) }}
                style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                + Ajouter des photos
              </button>
              <button onClick={() => galleryId && router.push(`/dashboard/gallery/${galleryId}`)}
                style={{ padding: '12px 28px', borderRadius: 10, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(200,72,46,0.4)' }}>
                Voir la galerie & partager <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Zone de dépôt */}
            <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{ border: `2px dashed ${dragging ? '#C8482E' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, padding: '56px 24px', textAlign: 'center', background: dragging ? 'rgba(200,72,46,0.04)' : 'transparent', cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s' }}>
                <input ref={inputRef} type="file" multiple accept="image/*,video/mp4" style={{ display: 'none' }}
                  onChange={e => addAndUpload(Array.from(e.target.files ?? []))} />
                <input ref={folderRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                  // @ts-ignore
                  webkitdirectory="true"
                  onChange={e => addAndUpload(Array.from(e.target.files ?? []))} />
                <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(200,72,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CloudUpload size={28} color="#C8482E" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  {dragging ? 'Déposez vos photos ici' : 'Glissez-déposez vos photos'}
                </h3>
                <p style={{ fontSize: 13, color: '#555', marginBottom: 22 }}>JPG, PNG, WebP, RAW · Plusieurs fichiers ou dossier complet</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                    style={{ padding: '10px 22px', borderRadius: 9, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    <ImageIcon size={14} style={{ marginRight: 6, display: 'inline' }} />
                    Choisir des photos
                  </button>
                  <button onClick={e => { e.stopPropagation(); folderRef.current?.click() }}
                    style={{ padding: '10px 22px', borderRadius: 9, background: 'rgba(255,255,255,0.07)', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    <Folder size={14} style={{ marginRight: 6, display: 'inline' }} />
                    Importer un dossier
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Grille previews */}
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{files.length} photo{files.length > 1 ? 's' : ''}</span>
                  <button onClick={() => { setFiles([]); setStage('idle') }} style={{ fontSize: 13, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Tout effacer</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                  {files.map(f => (
                    <div key={f.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1' }}>
                      <img src={f.preview} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {/* Overlay statut */}
                      {f.status === 'terminé' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={16} color="#22C55E" />
                        </div>
                      )}
                      {f.status === 'upload' && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                          <div style={{ height: 3, background: 'rgba(0,0,0,0.4)' }}>
                            <div style={{ height: '100%', width: `${f.progress}%`, background: '#C8482E', transition: 'width 0.2s' }} />
                          </div>
                        </div>
                      )}
                      {f.status === 'erreur' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={16} color="#ef4444" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div style={{ padding: 28, color: '#555' }}>Chargement…</div>}>
      <UploadPageInner />
    </Suspense>
  )
}
