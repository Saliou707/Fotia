'use client'
/* eslint-disable @next/next/no-img-element -- images servies directement par le CDN R2 */
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, Copy, Check, X, ChevronLeft, ChevronRight, Plus, Heart, Download, Edit2, Save, Loader2, Link2, Trash2 } from 'lucide-react'
import { ConfirmDialog, toast } from '@/components/ui'
import { fetchGallery, fetchGalleryImages, getImageUrl, updateGallery, fmtNumber, fmtDate, fetchProfile, type Gallery } from '@/lib/api'
import { slugify } from '@/lib/utils'
import { translateAuthError } from '@/lib/auth-errors'

interface GalleryImage { id: string; r2_key: string; original_filename: string; display_order: number }

function Skeleton({ h = 140, radius = 10 }: { h?: number; radius?: number }) {
  return <div style={{ height: h, borderRadius: radius, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

export default function GalleryManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [editingSlug, setEditingSlug] = useState(false)
  const [editSlug, setEditSlug] = useState('')
  const [slugError, setSlugError] = useState('')
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'studio'>('free')
  const isPro = userPlan === 'pro' || userPlan === 'studio'
  const [confirmDelete, setConfirmDelete] = useState<GalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const [data, profile] = await Promise.all([fetchGallery(id), fetchProfile()])
      if (data) {
        setGallery(data); setEditTitle(data.title); setEditSlug(data.slug)
        const imgs = await fetchGalleryImages(data.slug)
        setImages(imgs as GalleryImage[])
      }
      if (profile) {
        setUserPlan((profile.plan as 'free' | 'pro' | 'studio') || 'free')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fotia.co'
  const galleryUrl = gallery ? `${origin}/galerie/${gallery.slug}` : ''
  const whatsappMsg = encodeURIComponent(
    `Bonjour ✨\n\nVos photos sont prêtes.\n\nVoici votre galerie :\n${galleryUrl}`
  )

  const handleCopy = () => {
    navigator.clipboard?.writeText(galleryUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  const handleSaveTitle = async () => {
    if (!gallery || !editTitle.trim()) return
    setSaving(true)
    await updateGallery(gallery.id, { title: editTitle.trim() })
    setGallery(prev => prev ? { ...prev, title: editTitle.trim() } : prev)
    setSaving(false); setEditingTitle(false)
  }

  const handleSaveSlug = async () => {
    if (!gallery || !editSlug.trim()) return
    const cleaned = slugify(editSlug.trim())
    if (!cleaned || cleaned.length < 3) {
      setSlugError('Slug trop court (min. 3 caracteres)')
      return
    }
    if (cleaned === gallery.slug) {
      setEditingSlug(false); setSlugError('')
      return
    }
    setSaving(true); setSlugError('')
    const ok = await updateGallery(gallery.id, { slug: cleaned })
    if (ok) {
      setGallery(prev => prev ? { ...prev, slug: cleaned } : prev)
      setEditingSlug(false)
    } else {
      setSlugError('Ce slug est deja utilise ou invalide.')
    }
    setSaving(false)
  }

  const handleToggleStatus = async () => {
    if (!gallery) return
    setTogglingStatus(true)
    const newStatus = gallery.status === 'active' ? 'draft' : 'active'
    await updateGallery(gallery.id, { status: newStatus })
    setGallery(prev => prev ? { ...prev, status: newStatus } : prev)
    setTogglingStatus(false)
  }

  // ── Suppression d'une photo (réservée au photographe authentifié) ──
  const handleDeleteImage = async () => {
    if (!confirmDelete || deleting) return
    const img = confirmDelete
    setDeleting(true)
    try {
      const res = await fetch(`/api/gallery-images/${img.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || `Suppression impossible (${res.status})`)
      }
      setImages(prev => prev.filter(x => x.id !== img.id))
      setGallery(prev => prev ? { ...prev, photo_count: Math.max(0, prev.photo_count - 1) } : prev)
      toast.success('Photo supprimée', img.original_filename)
    } catch (err) {
      toast.error('Suppression impossible', translateAuthError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.'))
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

  // Les images de secours « legacy » (importées avant gallery_images) ont un id
  // préfixé `img-` et aucune ligne en base : la suppression via l'API est
  // impossible pour elles. NB : on ne teste PAS le format UUID — les ids DB
  // normaux sont des nanoid (init/confirm) OU des UUID (direct).
  const isDbImage = (id: string) => !id.startsWith('img-')

  if (loading) return (
    <div style={{ padding: '28px' }}>
      <Skeleton h={28} />
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} h={180} />)}
      </div>
    </div>
  )

  if (!gallery) return (
    <div style={{ padding: '28px', textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <p style={{ color: '#555' }}>Galerie introuvable.</p>
      <Link href="/dashboard/galleries" style={{ color: '#C8482E', textDecoration: 'none' }}>← Retour aux galeries</Link>
    </div>
  )

  return (
    <div className="manage-container" style={{ minHeight: 'calc(100vh - 58px)', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>

        {/* ── Retour ── */}
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
          <Link href="/dashboard/galleries" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', textDecoration: 'none', marginBottom: 20 }}>
            <ArrowLeft size={14} /> Retour aux galeries
          </Link>
        </motion.div>

        {/* ── En-tête ── */}
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} style={{ marginBottom: 28 }}>
          {/* Titre éditble */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            {editingTitle ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                  style={{ fontSize: 22, fontWeight: 800, background: 'rgba(255,255,255,0.05)', border: '1.5px solid #C8482E', borderRadius: 10, padding: '6px 12px', color: '#F2EDE4', outline: 'none', flex: 1, minWidth: 200 }} />
                <button onClick={handleSaveTitle} disabled={saving} style={{ padding: '7px 14px', borderRadius: 8, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />} OK
                </button>
                <button onClick={() => setEditingTitle(false)} style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#666', border: 'none', cursor: 'pointer', fontSize: 13 }}>✕</button>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>{gallery.title}</h1>
                <button onClick={() => setEditingTitle(true)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: 4 }}><Edit2 size={15} /></button>
              </>
            )}
          </div>
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#555' }}>{fmtDate(gallery.created_at)}</span>
            <span style={{ fontSize: 13, color: '#555' }}>· {gallery.photo_count} photo{gallery.photo_count !== 1 ? 's' : ''}</span>
            <button onClick={handleToggleStatus} disabled={togglingStatus}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: gallery.status === 'active' ? '#22C55E' : '#888', background: gallery.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,100,0.1)', border: `1px solid ${gallery.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(100,100,100,0.2)'}`, borderRadius: 99, padding: '4px 12px', cursor: 'pointer', transition: 'all 0.2s' }}>
              {togglingStatus ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: gallery.status === 'active' ? '#22C55E' : '#888' }} />}
              {gallery.status === 'active' ? 'Publique' : 'Brouillon'}
            </button>
          </div>
        </motion.div>

        {/* ── ACTIONS DE LIVRAISON ── */}
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} style={{ marginBottom: 32 }}>

          {/* ★ ACTION PRINCIPALE : WhatsApp ★ */}
          <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
            <button style={{ width: '100%', padding: '16px 24px', borderRadius: 14, background: '#25D366', color: '#fff', border: 'none', fontWeight: 800, fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 4px 24px rgba(37,211,102,0.35)', transition: 'transform 0.15s, box-shadow 0.15s', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,211,102,0.35)' }}>
              <span style={{ fontSize: 22 }}>📱</span>
              Partager sur WhatsApp
            </button>
          </a>

          {/* ── Lien public éditable (Pro uniquement) ── */}
          {isPro && (
            <div style={{ marginBottom: 12, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: editingSlug ? 10 : 0, flexWrap: 'wrap' }}>
                <Link2 size={14} color="#C8482E" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#555', fontWeight: 500, flexShrink: 0 }}>{origin}/galerie/</span>
                {editingSlug ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200 }}>
                    <input
                      autoFocus
                      value={editSlug}
                      onChange={e => { setEditSlug(e.target.value); setSlugError('') }}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveSlug(); if (e.key === 'Escape') { setEditingSlug(false); setSlugError('') } }}
                      style={{ flex: 1, padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${slugError ? '#EF4444' : '#C8482E'}`, color: '#F2EDE4', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
                    />
                    <button onClick={handleSaveSlug} disabled={saving} style={{ padding: '5px 12px', borderRadius: 7, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {saving ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : 'OK'}
                    </button>
                    <button onClick={() => { setEditingSlug(false); setSlugError(''); setEditSlug(gallery.slug) }} style={{ padding: '5px 8px', borderRadius: 7, background: 'rgba(255,255,255,0.06)', color: '#666', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#F2EDE4', fontFamily: 'monospace', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>{gallery.slug}</span>
                    <button onClick={() => { setEditingSlug(true); setSlugError('') }} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }} title="Modifier le slug">
                      <Edit2 size={12} />
                    </button>
                  </>
                )}
              </div>
              {slugError && (
                <div style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 500, paddingLeft: 22 }}>{slugError}</div>
              )}
            </div>
          )}

          {/* Actions secondaires */}
          <div className="gallery-manage-actions" style={{ display: 'grid', gap: 10 }}>
            <button onClick={handleCopy}
              style={{ padding: '11px 14px', borderRadius: 10, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', color: '#F2EDE4', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.2s' }}>
              {copied ? <><Check size={14} color="#22C55E" /> Copié !</> : <><Copy size={14} /> Copier le lien</>}
            </button>
            <Link href={`/galerie/${gallery.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', color: '#F2EDE4', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <Eye size={14} /> Vue client
              </button>
            </Link>
            <Link href={`/dashboard/upload?gallery=${gallery.id}`} style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', color: '#F2EDE4', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <Plus size={14} /> Ajouter photos
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          className="gallery-manage-stats" style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
          {[
            { icon: Eye, label: 'Vues', val: fmtNumber(gallery.view_count), color: '#3B82F6' },
            { icon: Heart, label: 'Favoris', val: fmtNumber(gallery.favorite_count), color: '#ec4899' },
            { icon: Download, label: 'Téléchargements', val: fmtNumber(gallery.download_count), color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <s.icon size={16} color={s.color} style={{ margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Grille photos ── */}
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Photos ({images.length})</h2>
            {gallery.favorite_count > 0 && (
              <Link href="/dashboard/favorites" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#ec4899', fontWeight: 600 }}>
                <Heart size={13} fill="#ec4899" /> {gallery.favorite_count} favori{gallery.favorite_count !== 1 ? 's' : ''} clients
              </Link>
            )}
          </div>

          {images.length === 0 ? (
            <div style={{ border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aucune photo</h3>
              <p style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>Importez vos premières photos pour cette galerie.</p>
              <Link href={`/dashboard/upload?gallery=${gallery.id}`}>
                <button style={{ padding: '12px 28px', borderRadius: 10, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,72,46,0.4)' }}>
                  + Importer des photos
                </button>
              </Link>
            </div>
          ) : (
            <div className="gallery-manage-photos" style={{ columns: '3 200px', gap: 10 }}>
              {images.map((img, i) => (
                <div key={img.id}
                  className="manage-photo-item"
                  onClick={() => setLightbox(i)}
                  style={{ marginBottom: 10, position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', breakInside: 'avoid' }}>
                  <img src={getImageUrl(img.r2_key)} alt={img.original_filename} loading="lazy" decoding="async"
                    style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                  {isDbImage(img.id) && (
                    <button
                      className="photo-delete-btn"
                      title="Supprimer cette photo"
                      aria-label="Supprimer cette photo"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDelete(img)
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && images.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            <button onClick={() => setLightbox(p => p !== null ? Math.max(0, p - 1) : null)} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={22} /></button>
            <button onClick={() => setLightbox(p => p !== null ? Math.min(images.length - 1, p + 1) : null)} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={22} /></button>
            <motion.img key={lightbox} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              src={getImageUrl(images[lightbox].r2_key)} alt=""
              style={{ maxWidth: '88vw', maxHeight: '88vh', borderRadius: 12, objectFit: 'contain' }} />
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', padding: '8px 18px', borderRadius: 99, fontSize: 13, color: '#A09890' }}>
              {lightbox + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm suppression photo ── */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteImage}
        loading={deleting}
        danger
        title="Supprimer cette photo ?"
        description={`« ${confirmDelete?.original_filename ?? 'Cette photo'} » sera définitivement supprimée de la galerie (stockage libéré). Cette action est irréversible.`}
        confirmLabel="Supprimer"
        icon={<Trash2 size={19} />}
      />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        /* Bouton supprimer : apparaît au survol (toujours visible sur tactile) */
        .manage-photo-item .photo-delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-4px);
          transition: all 0.2s ease;
          z-index: 2;
        }
        .manage-photo-item:hover .photo-delete-btn,
        .manage-photo-item:focus-within .photo-delete-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .photo-delete-btn:hover {
          background: rgba(239,68,68,0.85);
          border-color: transparent;
        }
        @media (hover: none) {
          .photo-delete-btn { opacity: 1; transform: translateY(0); }
        }
        .manage-container { padding: 24px 28px; }
        .gallery-manage-actions { grid-template-columns: repeat(3, 1fr); }
        .gallery-manage-stats { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 640px) {
          .manage-container { padding: 16px 12px; }
          .gallery-manage-actions { grid-template-columns: 1fr !important; }
          .gallery-manage-stats { grid-template-columns: repeat(3, 1fr) !important; gap: 6px !important; }
          .gallery-manage-stats > div { padding: 10px 4px !important; }
          .gallery-manage-stats div[style*="font-size: 22"] { font-size: 16px !important; }
          .gallery-manage-stats div[style*="font-size: 11"] { font-size: 10px !important; }
          .gallery-manage-photos { columns: 2 !important; gap: 6px !important; }
        }
      `}</style>
    </div>
  )
}