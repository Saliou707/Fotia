'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Eye, Heart, Search, Grid3X3, List,
  MoreHorizontal, Image as ImageIcon, Pencil, Trash2,
  Upload, Share2, X, ArrowUpRight, Camera, Zap, Check
} from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { fetchGalleries, updateGallery, deleteGallery, fmtNumber, fmtDate, type Gallery } from '@/lib/api'

function Skeleton({ h = 140, radius = 12 }: { h?: number; radius?: number }) {
  return <div style={{ height: h, borderRadius: radius, background: 'rgba(255,255,255,0.04)', animation: 'gPulse 1.5s ease-in-out infinite' }} />
}

export default function GalleriesPage() {
  const router = useRouter()
  const [galleries, setGalleries]   = useState<Gallery[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [view, setView]             = useState<'grid' | 'list'>('grid')
  const [menuId, setMenuId]         = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle]     = useState('')
  const [clientName, setClientName] = useState('')
  const [creating, setCreating]     = useState(false)
  const [deleting, setDeleting]     = useState<string | null>(null)

  useEffect(() => {
    fetchGalleries().then(g => { setGalleries(g); setLoading(false) })
  }, [])

  const filtered = galleries.filter(g => g.title.toLowerCase().includes(search.toLowerCase()))

  const activeCount = galleries.filter(g => g.status === 'active').length

  const handleCreate = async () => {
    if (!newTitle.trim() || creating) return
    setCreating(true)
    const fullTitle = clientName.trim() ? `${newTitle.trim()} — ${clientName.trim()}` : newTitle.trim()
    try {
      const { createGallery } = await import('@/lib/api')
      const g = await createGallery(fullTitle)
      setGalleries(prev => [g as unknown as Gallery, ...prev])
      router.push(`/dashboard/gallery/${g.id}`)
      setNewTitle(''); setClientName(''); setCreating(false); setShowCreate(false)
    } catch (err: unknown) {
      setCreating(false)
      const e = err as Error & { cause?: { requiresUpgrade?: boolean } }
      if (e.cause?.requiresUpgrade) {
        if (confirm(`${e.message}\n\nVoulez-vous passer au plan Pro ?`)) router.push('/dashboard/settings')
      } else {
        alert(e.message || 'Une erreur est survenue.')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette galerie ? Action irréversible.')) return
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
    <div className="galleries-page p-8 md:px-12" style={{ minHeight: 'calc(100vh - 58px)', background: '#15171A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="galleries-header flex flex-col sm:flex-row items-start justify-between mb-8 gap-4"
        style={{}}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(200,72,46,0.12)', border: '1px solid rgba(200,72,46,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={18} color="#C8482E" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4', margin: 0 }}>Galeries</h1>
            {!loading && (
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.22)', color: '#C8482E', borderRadius: 99, padding: '2px 9px' }}>
                {galleries.length}
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: '#787068', margin: 0, paddingLeft: 52 }}>
            {!loading && `${activeCount} active${activeCount !== 1 ? 's' : ''} · ${galleries.length - activeCount} brouillon${galleries.length - activeCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        <motion.button
          onClick={() => setShowCreate(true)}
          whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(200,72,46,0.4)' }}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 22px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,72,46,0.3)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
          <Plus size={17} strokeWidth={2.5} /> Nouvelle galerie
        </motion.button>
      </motion.div>

      {/* ── Filtres ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="galleries-filter-wrap flex flex-wrap gap-3 mb-7 items-center"
        style={{}}
      >
        {/* Recherche */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '9px 16px', flex: 1, minWidth: '280px', maxWidth: 380, transition: 'border 0.2s' }} className="search-focus-wrapper">
          <Search size={14} color="#555" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une galerie..."
            style={{ background: 'none', border: 'none', color: '#F2EDE4', fontSize: 13.5, outline: 'none', width: '100%', fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Toggle vue */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          {([{ v: 'grid', icon: Grid3X3 }, { v: 'list', icon: List }] as const).map(({ v, icon: Icon }) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '9px 14px', background: view === v ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', cursor: 'pointer', color: view === v ? '#F2EDE4' : '#555', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
              <Icon size={15} />
            </button>
          ))}
        </div>

        {/* Résultat filtre */}
        {search && (
          <span style={{ fontSize: 12.5, color: '#555', fontWeight: 500 }}>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour «&nbsp;{search}&nbsp;»
          </span>
        )}
      </motion.div>

      {/* ── Contenu ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Skeleton h={160} radius={0} />
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton h={16} /><Skeleton h={11} radius={6} />
              </div>
            </div>
          ))}
        </div>

      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(14,14,14,0.4)', border: '1.5px dashed rgba(255,255,255,0.07)', borderRadius: 24 }}
        >
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {search ? <Search size={26} color="#C8482E" /> : <Camera size={26} color="#C8482E" />}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F2EDE4', marginBottom: 8 }}>
            {search ? 'Aucun résultat' : 'Aucune galerie'}
          </h3>
          <p style={{ fontSize: 14, color: '#787068', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            {search ? `Aucune galerie ne correspond à "${search}"` : 'Créez votre première galerie pour commencer à livrer vos photos.'}
          </p>
          {!search && (
            <button onClick={() => setShowCreate(true)} style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,72,46,0.3)' }}>
              Créer une galerie
            </button>
          )}
        </motion.div>

      ) : view === 'grid' ? (
        <motion.div initial="hidden" animate="show" variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}
        >
          {filtered.map(g => (
            <motion.div
              key={g.id} variants={fadeUp}
              style={{ position: 'relative', zIndex: menuId === g.id ? 20 : 1, opacity: deleting === g.id ? 0.35 : 1, transition: 'opacity 0.3s' }}
            >
              <motion.div
                whileHover={{ y: -3, borderColor: 'rgba(200,72,46,0.22)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
                style={{ background: 'rgba(14,14,14,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', transition: 'all 0.25s' }}
              >
                {/* Cover */}
                <div onClick={() => router.push(`/dashboard/gallery/${g.id}`)}
                  style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#0A0A0A', cursor: 'pointer' }}
                >
                  {g.cover_image_url ? (
                    <img src={g.cover_image_url} alt={g.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(200,72,46,0.07)', border: '1px solid rgba(200,72,46,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={19} color="#C8482E" />
                      </div>
                      <span style={{ fontSize: 12, color: '#3D3D3D', fontWeight: 500 }}>Importer des photos</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)', pointerEvents: 'none' }} />

                  {/* Status */}
                  <div style={{ position: 'absolute', top: 10, left: 12 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 5, background: g.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)', color: g.status === 'active' ? '#22C55E' : '#787068', border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                      {g.status === 'active' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', animation: 'liveDot 2s ease-in-out infinite', display: 'inline-block' }} />}
                      {g.status === 'active' ? 'LIVE' : 'BROUILLON'}
                    </span>
                  </div>

                  {/* Menu */}
                  <button onClick={e => { e.stopPropagation(); setMenuId(menuId === g.id ? null : g.id) }}
                    style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 9, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#F2EDE4', transition: 'all 0.2s' }}
                    className="hover:bg-white/[0.1]"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>{fmtDate(g.created_at)} · {g.photo_count} photo{g.photo_count !== 1 ? 's' : ''}</div>
                  <div style={{ display: 'flex', gap: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#787068', fontWeight: 500 }}>
                      <Eye size={12} color="#F59E0B" /> {fmtNumber(g.view_count)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#787068', fontWeight: 500 }}>
                      <Heart size={12} color="#EC4899" /> {fmtNumber(g.favorite_count)}
                    </div>
                    <Link href={`/dashboard/gallery/${g.id}`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#C8482E', textDecoration: 'none', fontWeight: 700, padding: '5px 10px', borderRadius: 8, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.18)', transition: 'all 0.2s' }} className="hover:bg-[#C8482E]/20">
                      Gérer <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Dropdown menu */}
              <AnimatePresence>
                {menuId === g.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    transition={{ duration: 0.14 }}
                    onClick={e => e.stopPropagation()}
                    style={{ position: 'absolute', top: 44, right: 10, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '6px', zIndex: 30, minWidth: 180, boxShadow: '0 16px 48px rgba(0,0,0,0.8)' }}
                  >
                    <Link href={`/dashboard/gallery/${g.id}`} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 9, fontWeight: 500, transition: 'background 0.15s' }} className="hover:bg-white/[0.05]">
                      <Pencil size={13} color="#C8482E" /> Gérer la galerie
                    </Link>
                    <button onClick={() => handleToggleStatus(g)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderRadius: 9, fontWeight: 500, transition: 'background 0.15s' }} className="hover:bg-white/[0.05]">
                      {g.status === 'active' ? <><Zap size={13} color="#555" /> Mettre en brouillon</> : <><Zap size={13} color="#22C55E" /> Publier</>}
                    </button>
                    <Link href={`/galerie/${g.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 9, fontWeight: 500, transition: 'background 0.15s' }} className="hover:bg-white/[0.05]">
                      <Share2 size={13} color="#3B82F6" /> Vue client
                    </Link>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                    <button onClick={() => handleDelete(g.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', color: '#ef4444', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderRadius: 9, fontWeight: 500, transition: 'background 0.15s' }} className="hover:bg-red-500/[0.06]">
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

      ) : (
        /* ── Vue liste ── */
        <motion.div initial="hidden" animate="show" variants={stagger} className="galleries-list-view"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}
        >
          {/* Entête */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Galerie</span>
            <span style={{ textAlign: 'center' }}>Photos</span>
            <span style={{ textAlign: 'center' }}>Vues</span>
            <span style={{ textAlign: 'center' }}>Favs</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>
          {filtered.map((g, i) => (
            <motion.div key={g.id} variants={fadeUp}
              style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px', padding: '14px 20px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: deleting === g.id ? 0.35 : 1, transition: 'all 0.2s', background: 'transparent' }}
              className="list-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                {g.cover_image_url ? (
                  <img src={g.cover_image_url} alt={g.title} loading="lazy" decoding="async" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(200,72,46,0.07)', border: '1px solid rgba(200,72,46,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ImageIcon size={17} color="#C8482E" />
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{g.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#555' }}>{fmtDate(g.created_at)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: g.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', color: g.status === 'active' ? '#22C55E' : '#555', border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                      {g.status === 'active' ? 'LIVE' : 'BROUILLON'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: '#F2EDE4' }}>{g.photo_count}</div>
              <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13.5, fontWeight: 600, color: '#F59E0B' }}><Eye size={12} /> {fmtNumber(g.view_count)}</div>
              <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13.5, fontWeight: 600, color: '#EC4899' }}><Heart size={12} fill="#EC4899" color="#EC4899" /> {fmtNumber(g.favorite_count)}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                <Link href={`/dashboard/gallery/${g.id}`} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', color: '#C8482E', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, transition: 'all 0.2s' }} className="hover:bg-[#C8482E]/20">
                  Gérer
                </Link>
                <button onClick={() => handleDelete(g.id)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} className="hover:bg-red-500/10">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Modal création ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => !creating && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.93, y: 12, opacity: 0 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
              onClick={e => e.stopPropagation()}
              className="galleries-create-modal"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 460, position: 'relative', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}
            >
              {/* Glow */}
              <div style={{ position: 'absolute', top: -50, right: -30, width: 200, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.12) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

              <button onClick={() => !creating && setShowCreate(false)} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }} className="hover:text-white hover:bg-white/[0.1]">
                <X size={14} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={20} color="#C8482E" />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#F2EDE4' }}>Nouvelle galerie</h2>
                  <p style={{ fontSize: 13, color: '#787068', margin: 0, marginTop: 2 }}>Vous importerez vos photos à l&apos;étape suivante.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Nom de la galerie <span style={{ color: '#C8482E' }}>*</span>
                  </label>
                  <input
                    autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="ex: Mariage de Fatima & Ibrahima"
                    style={{ width: '100%', padding: '13px 16px', borderRadius: 13, border: `1.5px solid ${newTitle ? 'rgba(200,72,46,0.45)' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(255,255,255,0.03)', color: '#F2EDE4', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Nom du client <span style={{ color: '#3D3D3D', fontWeight: 400 }}>(optionnel)</span>
                  </label>
                  <input
                    value={clientName} onChange={e => setClientName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="ex: Cabinet Aissatou Diallo"
                    style={{ width: '100%', padding: '13px 16px', borderRadius: 13, border: '1.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#F2EDE4', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  />
                </div>
              </div>

              {newTitle && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(200,72,46,0.06)', border: '1px solid rgba(200,72,46,0.15)', borderRadius: 11, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Check size={13} color="#22C55E" />
                  <span style={{ fontSize: 13, color: '#F2EDE4', fontWeight: 500 }}>
                    {clientName.trim() ? `${newTitle.trim()} — ${clientName.trim()}` : newTitle.trim()}
                  </span>
                </motion.div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowCreate(false)} disabled={creating} style={{ flex: 1, padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', color: '#A09890', border: '1px solid rgba(255,255,255,0.07)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }} className="hover:bg-white/[0.08]">
                  Annuler
                </button>
                <motion.button
                  onClick={handleCreate} disabled={!newTitle.trim() || creating}
                  whileHover={newTitle.trim() && !creating ? { scale: 1.03 } : {}}
                  whileTap={newTitle.trim() && !creating ? { scale: 0.97 } : {}}
                  style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, cursor: newTitle.trim() && !creating ? 'pointer' : 'not-allowed', background: newTitle.trim() ? 'linear-gradient(135deg, #DF5438, #C8482E)' : 'rgba(255,255,255,0.05)', color: newTitle.trim() ? '#fff' : '#3D3D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: newTitle.trim() ? '0 4px 16px rgba(200,72,46,0.3)' : 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
                >
                  {creating ? (
                    <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', animation: 'gSpin 0.8s linear infinite' }} /> Création…</>
                  ) : (
                    <>Créer &amp; importer <ArrowUpRight size={15} /></>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
