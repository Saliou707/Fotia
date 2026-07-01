'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Eye, Heart, Search, Grid, List, MoreHorizontal, Image, Pencil, Trash2 } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { fetchGalleries, updateGallery, deleteGallery, fmtNumber, fmtDate, type Gallery } from '@/lib/api'

function Skeleton({ h = 140, radius = 8 }: { h?: number; radius?: number }) {
  return <div style={{ height: h, borderRadius: radius, background: 'rgba(255,255,255,0.06)', animation: 'fotia-pulse 1.5s ease-in-out infinite' }} />
}

export default function GalleriesPage() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [menuId, setMenuId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchGalleries().then(g => { setGalleries(g); setLoading(false) })
  }, [])

  const filtered = galleries.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!newTitle.trim() || creating) return
    setCreating(true)
    try {
      const { createGallery } = await import('@/lib/api')
      const g = await createGallery(newTitle.trim())
      setGalleries(prev => [g as unknown as Gallery, ...prev])
      router.push(`/dashboard/upload?gallery=${g.id}`)
      setNewTitle(''); setCreating(false); setShowCreate(false)
    } catch (err: any) {
      setCreating(false)
      const data = err.cause
      if (data?.requiresUpgrade) {
        if (confirm(`${err.message}\n\nVoulez-vous passer au plan Premium Pro pour créer des galeries illimitées ?`)) {
          router.push('/dashboard/settings') // Or wherever the upgrade button is
        }
      } else {
        alert(err.message || 'Une erreur est survenue.')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette galerie ? Cette action est irréversible.')) return
    setDeleting(id)
    await deleteGallery(id)
    setGalleries(prev => prev.filter(g => g.id !== id))
    setDeleting(null); setMenuId(null)
  }

  const handleToggleStatus = async (g: Gallery) => {
    const newStatus = g.status === 'active' ? 'draft' : 'active'
    await updateGallery(g.id, { status: newStatus })
    setGalleries(prev => prev.map(x => x.id === g.id ? { ...x, status: newStatus } : x))
    setMenuId(null)
  }

  return (
    <div style={{ padding: '28px', minHeight: 'calc(100vh - 58px)' }}>
      <motion.div initial="hidden" animate="show" variants={stagger}>

        {/* Header */}
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Galeries</h1>
            <p style={{ fontSize: 14, color: '#6B6B6B' }}>{galleries.length} galerie{galleries.length !== 1 ? 's' : ''} · {galleries.filter(g => g.status === 'active').length} active{galleries.filter(g => g.status === 'active').length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <Plus size={15} /> Nouvelle galerie
          </button>
        </motion.div>

        {/* Filtres */}
        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 14px', flex: 1, maxWidth: 360 }}>
            <Search size={14} color="#6B6B6B" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une galerie..." style={{ background: 'none', border: 'none', color: '#F7F7F5', fontSize: 13, outline: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 9, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[{ v: 'grid', i: Grid }, { v: 'list', i: List }].map(({ v, i: Icon }) => (
              <button key={v} onClick={() => setView(v as 'grid' | 'list')} style={{ padding: '8px 12px', background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', cursor: 'pointer', color: view === v ? '#F7F7F5' : '#6B6B6B', display: 'flex', alignItems: 'center' }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Contenu */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                <Skeleton h={160} radius={0} />
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton h={14} />
                  <Skeleton h={11} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp} style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{search ? 'Aucun résultat' : 'Aucune galerie'}</h3>
            <p style={{ fontSize: 14, color: '#6B6B6B' }}>{search ? `Aucune galerie ne correspond à "${search}"` : 'Créez votre première galerie.'}</p>
          </motion.div>
        ) : (
          <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 16 }}>
            {filtered.map(g => (
              <motion.div key={g.id} variants={fadeUp} style={{ position: 'relative', zIndex: menuId === g.id ? 20 : 1, opacity: deleting === g.id ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                {view === 'grid' ? (
                  <>
                    <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#1A1A1A' }}>
                      {g.cover_image_url ? (
                        <img src={g.cover_image_url} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Image size={32} color="#333" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                      <div style={{ position: 'absolute', top: 10, left: 12 }}>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: g.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(161,161,170,0.2)', color: g.status === 'active' ? '#22c55e' : '#A1A1AA', border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(161,161,170,0.2)'}` }}>
                          {g.status === 'active' ? 'Active' : 'Brouillon'}
                        </span>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setMenuId(menuId === g.id ? null : g.id) }}
                        style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                      <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 12 }}>{fmtDate(g.created_at)} · {g.photo_count} photo{g.photo_count !== 1 ? 's' : ''}</div>
                      <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
                        {[{ i: Eye, v: g.view_count }, { i: Heart, v: g.favorite_count }].map(({ i: Icon, v }, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B6B6B' }}>
                            <Icon size={12} /> {fmtNumber(v)}
                          </div>
                        ))}
                        <Link href={`/dashboard/gallery/${g.id}`} style={{ marginLeft: 'auto', fontSize: 12, color: '#C8482E', textDecoration: 'none', fontWeight: 500 }}>Gérer →</Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
                    {g.cover_image_url ? (
                      <img src={g.cover_image_url} alt={g.title} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Image size={20} color="#333" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                      <div style={{ fontSize: 12, color: '#6B6B6B' }}>{fmtDate(g.created_at)} · {g.photo_count} photos</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {[{ i: Eye, v: g.view_count }, { i: Heart, v: g.favorite_count }].map(({ i: Icon, v }, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B6B6B' }}>
                          <Icon size={12} /> {fmtNumber(v)}
                        </div>
                      ))}
                    </div>
                    <Link href={`/dashboard/gallery/${g.id}`} style={{ fontSize: 13, color: '#C8482E', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>Gérer →</Link>
                  </div>
                )}
                </div>
                {view === 'grid' && menuId === g.id && (
                  <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 42, right: 10, background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '4px', zIndex: 10, minWidth: 160, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <Link href={`/dashboard/gallery/${g.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: '#F7F7F5', fontSize: 13, textDecoration: 'none' }}>
                      <Pencil size={12} /> Modifier
                    </Link>
                    <button onClick={() => handleToggleStatus(g)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: '#F7F7F5', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                      {g.status === 'active' ? '🔒 Mettre en brouillon' : '✅ Publier'}
                    </button>
                    <Link href={`/g/${g.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: '#F7F7F5', fontSize: 13, textDecoration: 'none' }}>
                      <Eye size={12} /> Voir la galerie
                    </Link>
                    <button onClick={() => handleDelete(g.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: '#ef4444', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Modal création */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowCreate(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Nouvelle galerie</h2>
            <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 24 }}>Choisissez un nom pour votre galerie.</p>
            <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="ex: Mariage de Fatima & Ibrahima"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#F7F7F5', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#F7F7F5', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleCreate} disabled={!newTitle.trim() || creating} style={{ flex: 2, padding: '11px', borderRadius: 10, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: creating ? 'wait' : 'pointer', opacity: !newTitle.trim() ? 0.5 : 1 }}>
                {creating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fotia-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  )
}

