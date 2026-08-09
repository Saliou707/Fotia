'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Check, ArrowUpRight, Trash2 } from 'lucide-react'
import { stagger } from '@/lib/animations'
import { fetchGalleries, updateGallery, deleteGallery, type Gallery } from '@/lib/api'
import { toast, ConfirmDialog } from '@/components/ui'
import { translateAuthError } from '@/lib/auth-errors'
import GalleriesHeader from './GalleriesHeader'
import GalleryFilters from './GalleryFilters'
import GalleryEmptyState from './GalleryEmptyState'
import GalleryCard from './GalleryCard'
import GalleryList from './GalleryList'
import CreateGalleryModal from '@/components/modals/CreateGalleryModal'

export default function GalleriesPage() {
  const router = useRouter()
  const [galleries, setGalleries]   = useState<Gallery[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [view, setView]             = useState<'grid' | 'list'>('grid')
  const [menuId, setMenuId]         = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating]     = useState(false)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Gallery | null>(null)

  useEffect(() => {
    fetchGalleries().then(g => { setGalleries(g); setLoading(false) })
  }, [])

  const filtered = galleries.filter(g => g.title.toLowerCase().includes(search.toLowerCase()))
  const activeCount = galleries.filter(g => g.status === 'active').length

  const handleCreate = async (title: string, clientName: string) => {
    if (!title.trim() || creating) return
    setCreating(true)
    const fullTitle = clientName.trim() ? `${title.trim()} — ${clientName.trim()}` : title.trim()
    try {
      const { createGallery } = await import('@/lib/api')
      const g = await createGallery(fullTitle)
      setGalleries(prev => [g as unknown as Gallery, ...prev])
      router.push(`/dashboard/gallery/${g.id}`)
      setCreating(false); setShowCreate(false)
      toast.success('Galerie créée', `« ${fullTitle} » est prête, importez vos photos.`)
    } catch (err: unknown) {
      setCreating(false)
      const e = err as Error & { cause?: { requiresUpgrade?: boolean } }
      if (e.cause?.requiresUpgrade) {
        toast.info('Limite atteinte', `${e.message} Passez au plan Pro pour des galeries illimitées.`)
        router.push('/dashboard/settings')
      } else {
        toast.error('Impossible de créer la galerie', translateAuthError(e.message) || 'Une erreur est survenue. Réessayez.')
      }
    }
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    const g = confirmDelete
    setConfirmDelete(null)
    setDeleting(g.id)
    const ok = await deleteGallery(g.id)
    if (ok) {
      setGalleries(prev => prev.filter(x => x.id !== g.id))
      toast.success('Galerie supprimée', `« ${g.title} » et ses photos ont été supprimées.`)
    } else {
      toast.error('Suppression impossible', 'Une erreur est survenue. Réessayez.')
    }
    setDeleting(null); setMenuId(null)
  }

  const handleToggleStatus = async (g: Gallery) => {
    const newStatus = g.status === 'active' ? 'draft' : 'active'
    await updateGallery(g.id, { status: newStatus })
    setGalleries(prev => prev.map(x => x.id === g.id ? { ...x, status: newStatus } : x))
    setMenuId(null)
  }

  return (
    <div className="galleries-page p-8 md:px-12" style={{ minHeight: 'calc(100vh - 58px)', background: '#15171A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>

      <GalleriesHeader
        loading={loading}
        count={galleries.length}
        activeCount={activeCount}
        onCreate={() => setShowCreate(true)}
      />

      <GalleryFilters
        search={search}
        onSearch={setSearch}
        view={view}
        onView={setView}
        resultCount={filtered.length}
      />

      {/* ── Contenu ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ height: 160, background: 'rgba(255,255,255,0.04)', animation: 'gPulse 1.5s ease-in-out infinite' }} />
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ height: 16, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'gPulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: 11, borderRadius: 6, background: 'rgba(255,255,255,0.04)', animation: 'gPulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          ))}
        </div>

      ) : filtered.length === 0 ? (
        <GalleryEmptyState search={search} onCreate={() => setShowCreate(true)} />

      ) : view === 'grid' ? (
        <motion.div initial="hidden" animate="show" variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}
        >
          {filtered.map(g => (
            <GalleryCard
              key={g.id}
              gallery={g}
              menuOpen={menuId === g.id}
              deleting={deleting === g.id}
              onToggleMenu={() => setMenuId(menuId === g.id ? null : g.id)}
              onToggleStatus={() => handleToggleStatus(g)}
              onDelete={() => setConfirmDelete(g)}
            />
          ))}
        </motion.div>

      ) : (
        <GalleryList
          galleries={filtered}
          deletingId={deleting}
          onDelete={(id) => setConfirmDelete(galleries.find(g => g.id === id) ?? null)}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmAndDelete}
        loading={!!deleting}
        danger
        title="Supprimer cette galerie ?"
        description={`« ${confirmDelete?.title ?? ''} » sera définitivement supprimée, ainsi que toutes ses photos. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        icon={<Trash2 size={19} />}
      />

      <CreateGalleryModal
        open={showCreate}
        creating={creating}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        icon={Camera}
        title="Nouvelle galerie"
        titlePlaceholder="ex: Mariage de Fatima & Ibrahima"
        submitLabel="Créer & importer"
        submitIcon={ArrowUpRight}
        submitIconSize={15}
        previewIcon={Check}
        previewColor="#22C55E"
        spinnerKeyframe="gSpin"
        className="galleries-create-modal"
        maxWidth={460}
        padding={32}
      />

      <style>{`
        @keyframes gPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes gSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes liveDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .list-row:hover { background: rgba(255,255,255,0.02) !important; }
        .search-focus-wrapper:focus-within { border-color: rgba(200,72,46,0.35) !important; }
        @media (max-width: 768px) {
          .g-list-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .galleries-page { padding: 20px 16px !important; }
          .galleries-header { flex-direction: column !important; align-items: stretch !important; }
          .galleries-header button { width: 100% !important; justify-content: center !important; }
          .galleries-filter-wrap { flex-direction: column !important; }
          .galleries-filter-wrap > div:first-child { max-width: none !important; width: 100% !important; }
          .galleries-list-view > div:first-child { display: none !important; } /* Hide header */
          .list-row { display: flex !important; flex-wrap: wrap !important; gap: 10px !important; padding: 16px !important; }
          .list-row > div:first-child { width: 100% !important; margin-bottom: 6px !important; }
          .list-row > div:nth-child(2), .list-row > div:nth-child(3), .list-row > div:nth-child(4) { flex: 1 1 auto; text-align: left !important; justify-content: flex-start !important; }
          .list-row > div:last-child { width: 100% !important; justify-content: stretch !important; margin-top: 6px !important; }
          .list-row > div:last-child > * { flex: 1; justify-content: center !important; }
        }
        @media (max-width: 380px) {
          .galleries-page { padding: 14px 10px !important; }
          .galleries-create-modal { padding: 22px 16px !important; }
        }
      `}</style>
    </div>
  )
}
