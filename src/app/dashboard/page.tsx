'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import {
  Plus, Eye, Heart, Image as ImageIcon, ArrowRight,
  MoreHorizontal, Pencil, Trash2, Calendar, FileImage,
  Upload, Share2, Sparkles, Zap, TrendingUp, BarChart3,
  X, ChevronRight, Activity, Crown, CheckCircle2, Infinity
} from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { fetchGalleries, fetchDashboardStats, createGallery, fmtNumber, fmtDate, type Gallery } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return
    const dur = 900
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / dur, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(ts => step(ts, startTime))
    }
    requestAnimationFrame(ts => step(ts, ts))
  }, [value])
  return <>{fmtNumber(display)}</>
}

function Skeleton({ h = 16, radius = 8, w = '100%' }: { h?: number; radius?: number; w?: string }) {
  return <div className="skeleton" style={{ height: h, borderRadius: radius, width: w }} />
}

// ─── Gallery Card ─────────────────────────────────────────────────────────────
function GalleryCard({ g, onDelete, index }: { g: Gallery; onDelete: (id: string) => void; index: number }) {
  const [menu, setMenu] = useState(false)
  const engagementRate = g.view_count > 0 ? Math.round((g.favorite_count / g.view_count) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 18, overflow: 'visible', position: 'relative',
        zIndex: menu ? 20 : 1,
        background: 'rgba(14,14,14,0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
      whileHover={{ y: -4, borderColor: 'rgba(200,72,46,0.25)', boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,72,46,0.1)' }}
    >
      {/* Cover */}
      <div
        onClick={() => window.location.href = `/dashboard/gallery/${g.id}`}
        style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#0A0A0A', borderTopLeftRadius: 17, borderTopRightRadius: 17, cursor: 'pointer' }}
      >
        {g.cover_image_url ? (
          <img
            src={g.cover_image_url} alt={g.title} loading="lazy" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} color="#C8482E" />
            </div>
            <span style={{ fontSize: 12, color: '#4A4A4A', fontWeight: 500 }}>Importer des photos</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)', pointerEvents: 'none' }} />

        {/* Status */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{
            padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            background: g.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
            color: g.status === 'active' ? '#22C55E' : '#A09890',
            border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {g.status === 'active' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'liveDot 2s ease-in-out infinite' }} />}
            {g.status === 'active' ? 'LIVE' : 'BROUILLON'}
          </span>
        </div>

        {/* Engagement badge */}
        {g.view_count > 0 && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 99, padding: '3px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <TrendingUp size={11} color="#22C55E" />
            <span style={{ fontSize: 11, color: '#F2EDE4', fontWeight: 600 }}>{engagementRate}% engagement</span>
          </div>
        )}

        {/* Menu button */}
        <button
          onClick={e => { e.stopPropagation(); setMenu(!menu) }}
          style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 9, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#F2EDE4', transition: 'all 0.2s' }}
          className="hover:bg-white/[0.1]"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 4 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', top: 46, right: 12, zIndex: 30, minWidth: 176, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', overflow: 'hidden', padding: '6px' }}
          >
            <Link href={`/dashboard/gallery/${g.id}`} onClick={() => setMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 9, fontWeight: 500 }} className="hover:bg-white/[0.05]">
              <Pencil size={13} color="#C8482E" /> Gérer
            </Link>
            <Link href={`/g/${g.slug}`} target="_blank" onClick={() => setMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#F2EDE4', fontSize: 13, textDecoration: 'none', borderRadius: 9, fontWeight: 500 }} className="hover:bg-white/[0.05]">
              <Share2 size={13} color="#3B82F6" /> Vue client
            </Link>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <button onClick={() => { onDelete(g.id); setMenu(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: '#ef4444', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderRadius: 9, fontWeight: 500 }} className="hover:bg-red-500/[0.07]">
              <Trash2 size={13} /> Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ marginBottom: 14 }}>
          <Link href={`/dashboard/gallery/${g.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4, transition: 'color 0.2s' }} className="hover:text-[#C8482E]">
              {g.title}
            </div>
          </Link>
          <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={11} /> {fmtDate(g.created_at)}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#787068', fontWeight: 500 }}>
            <ImageIcon size={12} color="#555" /> {g.photo_count}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#787068', fontWeight: 500 }}>
            <Eye size={12} color="#F59E0B" /> {fmtNumber(g.view_count)}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#787068', fontWeight: 500 }}>
            <Heart size={12} color="#EC4899" /> {fmtNumber(g.favorite_count)}
          </div>
          <Link href={`/dashboard/gallery/${g.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#C8482E', textDecoration: 'none', fontWeight: 700, padding: '5px 10px', borderRadius: 8, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.18)', transition: 'all 0.2s' }} className="hover:bg-[#C8482E]/20">
            Gérer <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [stats, setStats] = useState<{ totalGalleries: number; totalViews: number; totalFavorites: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [creating, setCreating] = useState(false)

  const supabase = createClient()
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'studio'>('free')
  const [subExpiresAt, setSubExpiresAt] = useState<string | null>(null)

  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const greetingEmoji = hour < 5 ? '🌙' : hour < 12 ? '☀️' : hour < 18 ? '👋' : '🌆'
  const isPro = userPlan === 'pro' || userPlan === 'studio'

  const daysLeft = subExpiresAt
    ? Math.max(0, Math.ceil((new Date(subExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  useEffect(() => {
    Promise.all([fetchGalleries(), fetchDashboardStats()]).then(([g, s]) => {
      setGalleries(g)
      if (s) setStats({ totalGalleries: s.totalGalleries, totalViews: s.totalViews, totalFavorites: s.totalFavorites })
      setLoading(false)
    })

    // Fetch plan & subscription for Pro banner
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: p } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (p) setUserPlan((p.plan as any) || 'free')

        try {
          const subRes = await fetch('/api/billing/subscription')
          if (subRes.ok) {
            const { subscription: sub } = await subRes.json()
            if (sub?.expires_at) setSubExpiresAt(sub.expires_at)
          }
        } catch { /* ignore */ }
      }
    })()
  }, [])

  const handleCreate = async () => {
    if (!title.trim() || creating) return
    setCreating(true)
    const fullTitle = clientName.trim() ? `${title.trim()} — ${clientName.trim()}` : title.trim()
    try {
      const g = await createGallery(fullTitle)
      if (g) router.push(`/dashboard/gallery/${g.id}`)
    } catch (e: any) {
      setCreating(false)
      if (e.cause?.requiresUpgrade) {
        alert("Vous avez atteint la limite de 3 galeries du plan gratuit.\n\nPassez au plan Premium Pro pour des galeries illimitées !")
        router.push('/dashboard/settings')
      } else {
        alert(e.message || "Erreur lors de la création")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer définitivement cette galerie ?')) return
    const { deleteGallery: del } = await import('@/lib/api')
    await del(id)
    setGalleries(prev => prev.filter(g => g.id !== id))
    setStats(prev => prev ? { ...prev, totalGalleries: Math.max(0, prev.totalGalleries - 1) } : prev)
  }

  const KPIS = [
    {
      icon: ImageIcon, label: 'Galeries actives', val: stats?.totalGalleries ?? 0,
      accent: '#C8482E', bg: 'rgba(200,72,46,0.08)', border: 'rgba(200,72,46,0.18)',
      sub: `${galleries.filter(g => g.status === 'active').length} en ligne`,
    },
    {
      icon: Eye, label: 'Vues totales', val: stats?.totalViews ?? 0,
      accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)',
      sub: 'Toutes galeries confondues',
    },
    {
      icon: Heart, label: 'Favoris clients', val: stats?.totalFavorites ?? 0,
      accent: '#EC4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.18)',
      sub: stats && stats.totalViews > 0 ? `${Math.round((stats.totalFavorites / stats.totalViews) * 100)}% taux d'engagement` : 'Sélections de vos clients',
    },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 58px)', background: '#15171A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>

      {/* ══ HERO BANNER ══════════════════════════════════════════════════════ */}
      <div className="dash-hero" style={{ position: 'relative', overflow: 'hidden', padding: '44px 36px 0', marginBottom: 0 }}>
        {/* Ambient gradient background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: -60, width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.09) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 350, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
          {/* Left: greeting */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 32, lineHeight: 1 }}>{greetingEmoji}</span>
              <h1 style={{ fontSize: 'clamp(26px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#F2EDE4', margin: 0 }}>
                {greeting}
              </h1>
            </div>
            <p style={{ fontSize: 15, color: '#787068', margin: 0, fontWeight: 500 }}>
              Simplifiez la livraison et optimisez le choix de vos clients.
            </p>
          </motion.div>

          {/* Right: CTA */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            onClick={() => setShowCreate(true)}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(200,72,46,0.45)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '13px 26px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 60%, #A4351F 100%)',
              color: '#fff', fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(200,72,46,0.35)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <Plus size={18} strokeWidth={2.5} />
            Nouvelle galerie
          </motion.button>
        </div>

        {/* ── Pro Banner ── */}
        {isPro && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{
              marginBottom: 36,
              padding: '18px 22px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.04) 50%, rgba(17,17,17,0.6) 100%)',
              border: '1px solid rgba(251,191,36,0.22)',
              display: 'flex', alignItems: 'center', gap: 16,
              flexWrap: 'wrap',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(251,191,36,0.06)',
            }}
          >
            {/* Background glow */}
            <div style={{ position: 'absolute', top: -40, right: -30, width: 200, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(245,158,11,0.1))',
              border: '1px solid rgba(251,191,36,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(251,191,36,0.15)',
            }}>
              <Crown size={20} color="#FBBF24" />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#FBBF24', letterSpacing: '-0.01em' }}>Plan Premium Pro</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                  color: '#22C55E', letterSpacing: '0.06em', textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <CheckCircle2 size={9} /> Actif
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#A09890', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Infinity size={11} color="#FBBF24" /> Galeries illimitées
                </span>
                <span>·</span>
                <span>Téléchargement HD</span>
                <span>·</span>
                <span>Stats avancées</span>
                {daysLeft > 0 && (
                  <>
                    <span>·</span>
                    <span style={{ color: daysLeft <= 7 ? '#F59E0B' : '#787068', fontWeight: daysLeft <= 7 ? 600 : 400 }}>
                      {daysLeft <= 7 ? `⏳ Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : `Renouvellement dans ${daysLeft} jours`}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/dashboard/settings"
              style={{
                padding: '8px 16px', borderRadius: 10,
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.25)',
                color: '#FBBF24', fontSize: 12.5, fontWeight: 600,
                textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
              className="hover:bg-[#FBBF24]/20"
            >
              Gérer <ChevronRight size={12} />
            </Link>
          </motion.div>
        )}

        {/* KPI Cards */}
        <motion.div
          initial="hidden" animate="show" variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 0 }}
          className="kpi-grid"
        >
          {KPIS.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${kpi.border}`,
                borderRadius: 18, padding: '22px 24px',
                position: 'relative', overflow: 'hidden',
                backdropFilter: 'blur(12px)',
              }}
              whileHover={{ scale: 1.02, borderColor: kpi.accent + '44' }}
            >
              {/* Glow top-right */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${kpi.accent}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: kpi.bg, border: `1px solid ${kpi.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <kpi.icon size={19} color={kpi.accent} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '3px 9px', borderRadius: 99 }}>
                  <Activity size={9} /> LIVE
                </div>
              </div>

              {loading ? (
                <><Skeleton h={32} radius={8} /><div style={{ marginTop: 8 }}><Skeleton h={13} radius={6} w="70%" /></div></>
              ) : (
                <>
                  <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: '#F2EDE4', lineHeight: 1, marginBottom: 6 }}>
                    <AnimatedNumber value={kpi.val} />
                  </div>
                  <div style={{ fontSize: 12.5, color: '#8E8E93', fontWeight: 600, letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: 3 }}>{kpi.label}</div>
                  <div style={{ fontSize: 11.5, color: kpi.accent, fontWeight: 500, opacity: 0.8 }}>{kpi.sub}</div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ══ QUICK ACTIONS STRIP ══════════════════════════════════════════════ */}
      <motion.div className="dash-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ padding: '20px 36px', display: 'flex', gap: 10, overflowX: 'auto' }}
      >
        {[
          { icon: BarChart3, label: 'Statistiques', href: '/dashboard/statistics', color: '#C8482E' },
          { icon: Heart, label: 'Favoris clients', href: '/dashboard/favorites', color: '#EC4899' },
          { icon: Upload, label: 'Importer des photos', href: '/dashboard/upload', color: '#F59E0B' },
          { icon: Share2, label: 'Toutes mes galeries', href: '/dashboard/galleries', color: '#3B82F6' },
        ].map((a, i) => (
          <Link key={a.label} href={a.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.32 + i * 0.06 }}
              whileHover={{ y: -2, background: 'rgba(255,255,255,0.06)' }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <a.icon size={14} color={a.color} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F2EDE4', whiteSpace: 'nowrap' }}>{a.label}</span>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* ══ GALERIES RÉCENTES ════════════════════════════════════════════════ */}
      <div className="dash-galleries" style={{ padding: '0 36px 48px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#F2EDE4', margin: 0 }}>Galeries récentes</h2>
            {!loading && galleries.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.22)', color: '#C8482E', borderRadius: 99, padding: '2px 9px' }}>
                {galleries.length}
              </span>
            )}
          </div>
          {!loading && galleries.length > 0 && (
            <Link href="/dashboard/galleries" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#8E8E93', textDecoration: 'none', fontWeight: 600, padding: '6px 12px', borderRadius: 9, transition: 'all 0.2s' }} className="hover:text-[#C8482E] hover:bg-white/[0.04]">
              Voir toutes <ArrowRight size={13} />
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div className="gallery-grid" style={{ display: 'grid', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Skeleton h={160} radius={0} />
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton h={18} radius={6} /><Skeleton h={12} radius={5} w="60%" />
                </div>
              </div>
            ))}
          </div>
        ) : galleries.length === 0 ? (
          /* ── Empty state premium ── */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setShowCreate(true)}
            style={{ border: '1.5px dashed rgba(255,255,255,0.08)', borderRadius: 24, padding: '80px 24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(14,14,14,0.4)', transition: 'all 0.3s' }}
            className="hover:border-[#C8482E]/40 hover:bg-white/[0.01]"
          >
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(200,72,46,0.08)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Sparkles size={28} color="#C8482E" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, color: '#F2EDE4' }}>Créez votre première galerie client</h3>
            <p style={{ fontSize: 14, color: '#8E8E93', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Glissez-déposez vos créations, partagez sur WhatsApp et recevez les choix de vos clients instantanément.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(200,72,46,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              style={{ padding: '13px 32px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,72,46,0.3)' }}
            >
              Commencer maintenant
            </motion.button>
          </motion.div>
        ) : (
          <div className="gallery-grid" style={{ display: 'grid', gap: 16 }}>
            {galleries.map((g, i) => <GalleryCard key={g.id} g={g} onDelete={handleDelete} index={i} />)}
          </div>
        )}
      </div>

      {/* ══ MODAL CRÉATION ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => !creating && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.93, y: 12, opacity: 0 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
              onClick={e => e.stopPropagation()}
              style={{ borderRadius: 24, padding: '36px', width: '100%', maxWidth: 480, background: '#111', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', position: 'relative', overflow: 'hidden' }}
            >
              {/* Glow accent top */}
              <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.12) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

              {/* Close button */}
              <button onClick={() => !creating && setShowCreate(false)} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8E8E93', transition: 'all 0.2s' }} className="hover:bg-white/[0.1] hover:text-white">
                <X size={14} />
              </button>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={20} color="#C8482E" />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#F2EDE4' }}>Créer une galerie</h2>
                  <p style={{ fontSize: 13, color: '#787068', margin: 0, marginTop: 2 }}>Vous importerez vos photos à l'étape suivante.</p>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Nom de la galerie <span style={{ color: '#C8482E' }}>*</span>
                  </label>
                  <input
                    autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="ex: Mariage Yasmine & Oumar"
                    style={{ width: '100%', padding: '13px 16px', borderRadius: 13, background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${title ? 'rgba(200,72,46,0.45)' : 'rgba(255,255,255,0.08)'}`, color: '#F2EDE4', fontSize: 14.5, outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    className="focus:bg-white/[0.02]"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Nom du client <span style={{ color: '#4A4A4A', fontWeight: 400 }}>(optionnel)</span>
                  </label>
                  <input
                    value={clientName} onChange={e => setClientName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="ex: Cabinet Aissatou Diallo"
                    style={{ width: '100%', padding: '13px 16px', borderRadius: 13, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#F2EDE4', fontSize: 14.5, outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    className="focus:border-white/[0.15] focus:bg-white/[0.02]"
                  />
                </div>
              </div>

              {/* Preview of final title */}
              {title && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(200,72,46,0.06)', border: '1px solid rgba(200,72,46,0.15)', borderRadius: 11, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <ImageIcon size={13} color="#C8482E" />
                  <span style={{ fontSize: 13, color: '#F2EDE4', fontWeight: 500 }}>
                    {clientName.trim() ? `${title.trim()} — ${clientName.trim()}` : title.trim()}
                  </span>
                </motion.div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowCreate(false)} disabled={creating} style={{ flex: 1, padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', color: '#A09890', border: '1px solid rgba(255,255,255,0.07)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-white/[0.08]">
                  Annuler
                </button>
                <motion.button
                  onClick={handleCreate} disabled={!title.trim() || creating}
                  whileHover={title.trim() && !creating ? { scale: 1.03 } : {}}
                  whileTap={title.trim() && !creating ? { scale: 0.97 } : {}}
                  style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, cursor: title.trim() && !creating ? 'pointer' : 'not-allowed', background: title.trim() ? 'linear-gradient(135deg, #DF5438, #C8482E)' : 'rgba(255,255,255,0.06)', color: title.trim() ? '#fff' : '#4A4A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: title.trim() ? '0 4px 16px rgba(200,72,46,0.3)' : 'none', transition: 'all 0.2s' }}
                >
                  {creating ? (
                    <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', animation: 'dashSpin 0.8s linear infinite' }} /> Création…</>
                  ) : (
                    <>Continuer vers l&apos;import <ArrowRight size={14} /></>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes dashSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes liveDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
        .kpi-grid { }

        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .dash-hero { padding: 24px 16px 0 !important; }
          .dash-actions { padding: 16px 16px !important; gap: 8px !important; flex-wrap: wrap !important; }
          .dash-actions a { flex: 1 1 auto !important; min-width: 0 !important; }
          .dash-galleries { padding: 0 16px 32px !important; }
          .create-modal-padding { padding: 24px 20px !important; }
        }
        @media (max-width: 380px) {
          .dash-hero { padding: 18px 10px 0 !important; }
          .dash-hero h1 { font-size: 22px !important; }
          .dash-actions { padding: 12px 8px !important; }
        }
      `}</style>
    </div>
  )
}
