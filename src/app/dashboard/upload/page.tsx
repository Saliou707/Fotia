'use client'
import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fetchGallery, updateGallery } from '@/lib/api'
import { isValidImageFile } from '@/lib/utils'
import type { UpFile, Stage } from './types'
import UploadHeader from './UploadHeader'
import StageIndicator from './StageIndicator'
import DropZone from './DropZone'
import FilePreviewGrid from './FilePreviewGrid'
import DoneScreen from './DoneScreen'

// Taille maximale acceptée par le serveur (imageUploadSchema / route init)
const MAX_FILE_BYTES = 50 * 1024 * 1024 // 50MB

interface ApiErrorBody {
  error?: string
  requiresUpgrade?: boolean
}

/** Lit le message d'erreur JSON d'une réponse API (ou null si non-JSON). */
async function parseError(res: Response): Promise<ApiErrorBody | null> {
  try {
    return (await res.json()) as ApiErrorBody
  } catch {
    return null
  }
}

function UploadPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const galleryId = searchParams.get('gallery')

  const [galleryTitle, setGalleryTitle] = useState<string>('')
  const [files, setFiles] = useState<UpFile[]>([])
  const [stage, setStage] = useState<Stage>('idle')
  const abortRef = useRef(false)

  useEffect(() => {
    if (!galleryId) return
    fetchGallery(galleryId).then(g => {
      if (g) { setGalleryTitle(g.title) }
    })
  }, [galleryId])

  const addAndUpload = useCallback(async (newFiles: File[]) => {
    if (!galleryId) return

    // Validation client : type + taille, avec la raison d'échec pour chaque fichier.
    // Les fichiers invalides sont marqués en erreur immédiatement (aucun appel serveur).
    const mapped: UpFile[] = newFiles.map(f => {
      const invalidReason = !isValidImageFile(f)
        ? `Format non supporté${f.type ? ` (${f.type})` : ''} — JPG, PNG, WebP ou HEIC uniquement`
        : f.size > MAX_FILE_BYTES
          ? 'Taille maximale 50MB dépassée'
          : undefined
      return {
        id: Math.random().toString(36).slice(2), file: f, name: f.name,
        sizeBytes: f.size, preview: URL.createObjectURL(f),
        status: invalidReason ? 'erreur' : 'attente', progress: 0,
        error: invalidReason,
      }
    })

    const valid = mapped.filter(f => f.status !== 'erreur')
    setFiles(prev => [...prev, ...mapped])
    if (valid.length === 0) return

    setStage('uploading')
    abortRef.current = false

    let done = 0
    for (const f of valid) {
      if (abortRef.current) break
      setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'upload', progress: 5 } : x))
      try {
        // Progression simulée pendant l'upload
        const prog = setInterval(() => {
          setFiles(prev => prev.map(x => x.id === f.id && x.progress < 75 ? { ...x, progress: x.progress + 6 } : x))
        }, 150)

        try {
          // Étape 1 — init : valide les limites de plan côté serveur et renvoie une URL présignée R2
          const initRes = await fetch('/api/upload/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: f.file.name,
              content_type: f.file.type,
              file_size_bytes: f.file.size,
              gallery_id: galleryId,
            }),
          })
          if (!initRes.ok) {
            const body = await parseError(initRes)
            throw new Error(body?.error || `Initialisation impossible (${initRes.status})`)
          }
          const { image_id, upload_url } = await initRes.json()

          // Étape 2 — upload direct navigateur → R2 (contourne la limite de corps
          // serveur ~4.5MB : les photos récentes échouaient en 413 côté serveur).
          const putRes = await fetch(upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': f.file.type },
            body: f.file,
          })
          if (!putRes.ok) {
            // Nettoyage best-effort de la ligne pré-enregistrée à l'init
            fetch(`/api/gallery-images/${image_id}`, { method: 'DELETE' }).catch(() => {})
            throw new Error(
              putRes.status === 403
                ? 'URL présignée expirée — réessayez'
                : `Envoi vers le stockage échoué (${putRes.status})`
            )
          }

          // Étape 3 — confirm : miniature + compteurs (photos, stockage)
          const confirmRes = await fetch('/api/upload/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id, gallery_id: galleryId }),
          })
          if (!confirmRes.ok) {
            const body = await parseError(confirmRes)
            throw new Error(body?.error || `Confirmation échouée (${confirmRes.status})`)
          }

          setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'terminé', progress: 100 } : x))
          done++
        } finally {
          clearInterval(prog)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue'
        setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'erreur', progress: 0, error: message } : x))
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

  const totalFiles = files.length
  const uploadedCount = files.filter(f => f.status === 'terminé').length
  const hasErrors = files.some(f => f.status === 'erreur')

  return (
    <div className="upload-page" style={{ minHeight: 'calc(100vh - 58px)', padding: '28px', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>

        <UploadHeader galleryTitle={galleryTitle} />

        {/* Étapes visuelles (affiché dès qu'on commence) */}
        {stage !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StageIndicator stage={stage} uploaded={uploadedCount} total={totalFiles} />
          </motion.div>
        )}

        {/* Écran terminé */}
        {stage === 'done' ? (
          <DoneScreen
            uploadedCount={uploadedCount}
            hasErrors={hasErrors}
            onAddMore={() => { setFiles([]); setStage('idle') }}
            onViewGallery={() => galleryId && router.push(`/dashboard/gallery/${galleryId}`)}
          />
        ) : (
          <>
            {/* Zone de dépôt */}
            <DropZone onFiles={addAndUpload} />

            {/* Grille previews */}
            {files.length > 0 && (
              <FilePreviewGrid files={files} onClear={() => { setFiles([]); setStage('idle') }} />
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
      {uploadPageResponsive}
    </Suspense>
  )
}

// ── Responsive (style JSX injecté avec la page) ──────────────────────────────
const uploadPageResponsive = (
  <style>{`
    @media (max-width: 640px) {
      .upload-page { padding: 16px !important; }
      .upload-page .stage-steps { flex-wrap: wrap !important; }
      .upload-page .stage-steps > div { flex-shrink: 0 !important; }
      .upload-page .step-connector { width: 24px !important; margin: 0 4px 20px !important; }
    }
  `}</style>
)
