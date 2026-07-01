'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Eye, Heart, Image as ImageIcon, ArrowRight, MoreHorizontal, Pencil, Trash2, Calendar, FileImage } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { fetchGalleries, fetchDashboardStats, createGallery, deleteGallery, fmtNumber, fmtDate, type Gallery } from '@/lib/api'

function Skeleton({ h = 16, radius = 8 }: { h?: number; radius?: number }) {
  return <div className="skeleton" style={{ height: h, borderRadius: radius, width: '100%' }} />
}

function GalleryCard({ g, onDelete }: { g: Gallery; onDelete: (id: string) => void }) {
  const [menu, setMenu] = useState(false)
  return (
    <motion.div 
      variants={fadeUp} 
      style={{ 
        borderRadius: 16, 
        overflow: 'visible', 
        background: 'rgba(17, 17, 17, 0.45)', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        position: 'relative', 
        zIndex: menu ? 20 : 1,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="hover:border-white/[0.08] hover:bg-white/[0.02] hover:-translate-y-1"
    >
      {/* Cover picture */}
      <div 
        onClick={() => window.location.href = `/dashboard/gallery/${g.id}`} 
        style={{ 
          position: 'relative', 
          aspectRatio: '4/3', 
          overflow: 'hidden', 
          background: '#0D0D0D', 
          borderTopLeftRadius: 15, 
          borderTopRightRadius: 15, 
          cursor: 'pointer' 
        }}
      >
        {g.cover_image_url ? (
          <img 
            src={g.cover_image_url} 
            alt={g.title} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <FileImage size={30} color="#2D2C2A" />
            <span style={{ fontSize: 12, color: '#5A5550', fontWeight: 500 }}>Aucune photo importée</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 60%)', pointerEvents: 'none' }} />
        
        {/* Status indicator badge */}
        <div style={{ position: 'absolute', top: 12, left: 12, pointerEvents: 'none' }}>
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: 99, 
            fontSize: 9.5, 
            fontWeight: 700, 
            letterSpacing: '0.05em', 
            background: g.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)', 
            color: g.status === 'active' ? '#22C55E' : '#A09890', 
            border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}>
            {g.status === 'active' ? '● LIVE' : '○ BROUILLON'}
          </span>
        </div>

        {/* Menu Toggle */}
        <button 
          onClick={e => { e.stopPropagation(); setMenu(!menu) }} 
          style={{ 
            position: 'absolute', top: 12, right: 12, width: 28, height: 28, 
            borderRadius: 8, background: 'rgba(8,8,8,0.6)', 
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', color: '#F2EDE4', transition: 'all 0.2s'
          }}
          className="hover:bg-white/[0.08] hover:border-white/[0.2]"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Dropdown Options */}
      <AnimatePresence>
        {menu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()} 
            style={{ 
              position: 'absolute', top: 46, right: 12, 
              borderRadius: 12, padding: '6px', zIndex: 30, 
              minWidth: 170
            }}
            className="premium-glass-strong"
          >
            <Link href={`/dashboard/gallery/${g.id}`} onClick={() => setMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 8, fontWeight: 500 }} className="hover:bg-white/[0.04]">
              <Pencil size={13} style={{ color: '#C8482E' }} /> Gérer
            </Link>
            <Link href={`/g/${g.slug}`} target="_blank" onClick={() => setMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 8, fontWeight: 500 }} className="hover:bg-white/[0.04]">
              <Eye size={13} style={{ color: '#3B82F6' }} /> Galerie client
            </Link>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <button onClick={() => { onDelete(g.id); setMenu(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#ef4444', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderRadius: 8, fontWeight: 500 }} className="hover:bg-red-500/[0.05]">
              <Trash2 size={13} /> Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Container */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          <Link href={`/dashboard/gallery/${g.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hover:text-[#C8482E] transition-colors duration-200">
              {g.title}
            </div>
          </Link>
          <div style={{ fontSize: 11.5, color: '#8E8E93', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={12} />
            <span>{fmtDate(g.created_at)}</span>
          </div>
        </div>

        {/* Action / Stats bar */}
        <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8E8E93', fontWeight: 500 }} title="Nombre d'images">
            <ImageIcon size={12} /> <span>{g.photo_count}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8E8E93', fontWeight: 500 }} title="Vues de la galerie">
            <Eye size={12} /> <span>{fmtNumber(g.view_count)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8E8E93', fontWeight: 500 }} title="Favoris clients">
            <Heart size={12} /> <span>{fmtNumber(g.favorite_count)}</span>
          </div>
          
          <Link href={`/dashboard/gallery/${g.id}`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#C8482E', textDecoration: 'none', fontWeight: 700 }} className="hover:underline">
            Gérer <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [stats, setStats] = useState<{ totalGalleries: number; totalViews: number; totalFavorites: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [creating, setCreating] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  useEffect(() => {
    Promise.all([fetchGalleries(), fetchDashboardStats()]).then(([g, s]) => {
      setGalleries(g)
      if (s) setStats({ totalGalleries: s.totalGalleries, totalViews: s.totalViews, totalFavorites: s.totalFavorites })
      setLoading(false)
    })
  }, [])

  const handleCreate = async () => {
    if (!title.trim() || creating) return
    setCreating(true)
    const fullTitle = clientName.trim() ? `${title.trim()} — ${clientName.trim()}` : title.trim()
    try {
      const g = await createGallery(fullTitle)
      if (g) {
        router.push(`/dashboard/gallery/${g.id}`)
      }
    } catch (e: any) {
      setCreating(false)
      if (e.cause && e.cause.requiresUpgrade) {
        alert("Vous avez atteint la limite de 3 galeries du plan gratuit.\n\nPassez au plan Premium Pro pour créer des galeries illimitées et débloquer toutes les fonctionnalités !")
        router.push('/dashboard/settings')
      } else {
        alert(e.message || "Erreur lors de la création de la galerie")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer définitivement cette galerie et l\'ensemble des fichiers associés ?')) return
    const { deleteGallery: del } = await import('@/lib/api')
    await del(id)
    setGalleries(prev => prev.filter(g => g.id !== id))
    setStats(prev => prev ? { ...prev, totalGalleries: Math.max(0, prev.totalGalleries - 1) } : prev)
  }

  return (
    <div className="dashboard-container" style={{ minHeight: 'calc(100vh - 58px)', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial="hidden" animate="show" variants={stagger}>

        {/* ── Header ── */}
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 30px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 6, color: '#F2EDE4' }}>
              {greeting} 👋
            </h1>
            <p style={{ fontSize: 14.5, color: '#A09890', fontWeight: 500 }}>Simplifiez la livraison et optimisez le choix de vos clients.</p>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="btn-primary hover-scale"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 9, 
              padding: '12px 24px', borderRadius: 12, border: 'none', 
              fontWeight: 700, fontSize: 14.5, cursor: 'pointer', height: '44px' 
            }}
          >
            <Plus size={18} /> Nouvelle galerie
          </button>
        </motion.div>

        {/* ── Stats Panels ── */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 44 }} className="dashboard-stats-grid">
          {[
            { icon: ImageIcon, label: 'Galeries Actives', val: stats?.totalGalleries ?? 0, color: '#C8482E', bg: 'rgba(200,72,46,0.08)', border: 'rgba(200,72,46,0.15)' },
            { icon: Eye, label: 'Vues Totales', val: stats?.totalViews ?? 0, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
            { icon: Heart, label: 'Photos Favorites', val: stats?.totalFavorites ?? 0, color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.15)' },
          ].map(s => (
            <div 
              key={s.label} 
              style={{ 
                background: 'rgba(17, 17, 17, 0.45)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: 16, 
                padding: '20px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 20 
              }}
              className="glow-hover"
            >
              <div style={{ 
                width: 48, height: 48, borderRadius: 14, 
                background: s.bg, display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                flexShrink: 0,
                border: `1px solid ${s.border}`
              }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                {loading ? <div style={{ width: 80 }}><Skeleton h={28} /></div> : <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#F2EDE4' }}>{fmtNumber(s.val)}</div>}
                <div style={{ fontSize: 12.5, color: '#8E8E93', marginTop: 4, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Section Title ── */}
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#F2EDE4' }}>Galeries Récentes</h2>
          {!loading && galleries.length > 0 && (
            <Link href="/dashboard/galleries" style={{ fontSize: 13, color: '#8E8E93', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }} className="hover:text-[#C8482E] transition-colors">
              Voir toutes les galeries <ArrowRight size={13} />
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(17, 17, 17, 0.45)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Skeleton h={180} radius={0} />
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton h={18} />
                  <Skeleton h={12} />
                </div>
              </div>
            ))}
          </div>
        ) : galleries.length === 0 ? (
          /* Empty state - Premium box */
          <motion.div 
            variants={fadeUp}
            style={{ 
              border: '2px dashed rgba(255,255,255,0.08)', 
              borderRadius: 24, 
              padding: '90px 24px', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: 'rgba(17, 17, 17, 0.25)' 
            }}
            onClick={() => setShowCreate(true)}
            className="hover:border-orange-500/30 transition-all duration-300"
          >
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Plus size={30} color="#C8482E" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#F2EDE4' }}>Créez votre première galerie client</h3>
            <p style={{ fontSize: 14, color: '#8E8E93', marginBottom: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
              Glissez-déposez vos créations, partagez un lien intelligent sur WhatsApp et recevez les choix favoris de votre client instantanément.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary hover-scale" style={{ padding: '12px 32px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>
              Commencer maintenant
            </button>
          </motion.div>
        ) : (
          <motion.div variants={stagger} className="dashboard-gallery-grid" style={{ display: 'grid', gap: 16 }}>
            {galleries.map(g => <GalleryCard key={g.id} g={g} onDelete={handleDelete} />)}
          </motion.div>
        )}
      </motion.div>

      {/* ── Create gallery Modal (Premium Glassmorphism Overlay) ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 200, 
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 
            }}
            onClick={() => !creating && setShowCreate(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }}
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{ 
                borderRadius: 24, padding: '36px', width: '100%', maxWidth: 460
              }}
              className="premium-glass-strong"
            >
              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6, color: '#F2EDE4' }}>Créer une galerie</h2>
                <p style={{ fontSize: 13.5, color: '#8E8E93' }}>Configurez le dossier. Vous importerez vos photos à l&apos;étape suivante.</p>
              </div>

              {/* Inputs */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Nom de la Galerie <span style={{ color: '#C8482E' }}>*</span>
                </label>
                <input
                  autoFocus 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="ex: Mariage Yasmine & Oumar, Portrait Mode"
                  style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: 12, 
                    background: 'rgba(255,255,255,0.03)', 
                    border: `1.5px solid ${title ? 'rgba(200,72,46,0.4)' : 'rgba(255,255,255,0.06)'}`, 
                    color: '#F2EDE4', fontSize: 14.5, outline: 'none', boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  className="focus:border-orange-500 focus:bg-white/[0.01]"
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Nom du Client <span style={{ color: '#5A5550', fontWeight: 400 }}>(optionnel)</span>
                </label>
                <input
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="ex: Cabinet Aissatou Diallo"
                  style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: 12, 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1.5px solid rgba(255,255,255,0.06)', 
                    color: '#F2EDE4', fontSize: 14.5, outline: 'none', boxSizing: 'border-box',
                    transition: 'all 0.2s' 
                  }}
                  className="focus:border-orange-500 focus:bg-white/[0.01]"
                />
              </div>

              {/* Actions button */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => setShowCreate(false)} 
                  disabled={creating}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: 12, 
                    background: 'rgba(255,255,255,0.04)', color: '#A09890', 
                    border: '1px solid rgba(255,255,255,0.05)', fontWeight: 600, 
                    fontSize: 14.5, cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                  className="hover:bg-white/[0.08]"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleCreate} 
                  disabled={!title.trim() || creating}
                  className="btn-primary"
                  style={{ 
                    flex: 2, padding: '12px', borderRadius: 12, 
                    color: '#fff', border: 'none', fontWeight: 700, 
                    fontSize: 14.5, cursor: title.trim() && !creating ? 'pointer' : 'not-allowed', 
                    opacity: !title.trim() ? 0.5 : 1, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: 8, 
                    boxShadow: title.trim() ? '0 4px 16px rgba(200,72,46,0.3)' : 'none' 
                  }}
                >
                  {creating ? (
                    <>
                      <div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                      Création…
                    </>
                  ) : (
                    <>Continuer vers l&apos;import <ArrowRight size={15} /></>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        
        .dashboard-container { padding: 32px 28px; }
        .dashboard-gallery-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        
        @media (max-width: 768px) {
          .dashboard-container { padding: 24px 16px; }
          .dashboard-stats-grid { grid-template-columns: 1fr !important; }
          .dashboard-gallery-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

