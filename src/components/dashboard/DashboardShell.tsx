'use client'
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid, Heart, BarChart2, Settings, LogOut,
  Bell, ChevronDown, ImageIcon, ChevronRight,
  CreditCard, Sparkles, Zap, Check, X, ArrowUpRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { PLAN_LIMITS, PlanType } from '@/lib/limits'
import { translateAuthError } from '@/lib/auth-errors'
import { toast } from '@/components/ui'

// ─── Plan Badge ───────────────────────────────────────────────────────────────
function PlanBadge({ plan, size = 'sm' }: { plan: string; size?: 'sm' | 'md' | 'lg' }) {
  const isPro = plan === 'pro' || plan === 'studio'
  const sizeMap = {
    sm:  { fontSize: 9,  padding: '2px 7px',  iconSize: 10, gap: 3 },
    md:  { fontSize: 10, padding: '3px 8px',  iconSize: 12, gap: 4 },
    lg:  { fontSize: 11, padding: '4px 10px', iconSize: 14, gap: 5 },
  }
  const s = sizeMap[size]
  if (isPro) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap, padding: s.padding, borderRadius: 99, background: 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.1) 100%)', border: '1px solid rgba(251,191,36,0.3)', color: '#E8B33D', fontSize: s.fontSize, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1 }}>
        <Sparkles size={s.iconSize} style={{ flexShrink: 0 }} /> PRO
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap, padding: s.padding, borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#A09890', fontSize: s.fontSize, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1 }}>
      <Zap size={s.iconSize} style={{ flexShrink: 0 }} /> FREE
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, plan, size = 28 }: { name: string; plan: string; size?: number }) {
  const isPro = plan === 'pro' || plan === 'studio'
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: isPro ? 'linear-gradient(135deg, #E8B33D, #D97706)' : 'linear-gradient(135deg, #DF5438, #A4351F)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.44, fontWeight: 700, color: '#fff',
        boxShadow: isPro ? `0 2px 12px rgba(251,191,36,0.35)` : `0 2px 10px rgba(200,72,46,0.35)`,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      {isPro && (
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 13, height: 13, borderRadius: '50%', background: 'linear-gradient(135deg, #E8B33D, #F59E0B)', border: '2px solid #0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={7} color="#fff" />
        </div>
      )}
    </div>
  )
}

interface Profile { name: string; email: string; plan: string; storageUsed?: number; galleryCount?: number }

// ─── Nav labels ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard',            icon: LayoutGrid, label: 'Dashboard',    exact: true,  badge: null },
  { href: '/dashboard/galleries',  icon: ImageIcon,  label: 'Galeries',     exact: false, badge: null },
  { href: '/dashboard/favorites',  icon: Heart,      label: 'Favoris',      exact: false, badge: null },
  { href: '/dashboard/statistics', icon: BarChart2,  label: 'Statistiques', exact: false, badge: null },
  { href: '/dashboard/settings',   icon: Settings,   label: 'Paramètres',   exact: false, badge: null },
]

export default function DashboardShell({
  children, profile, isAdmin = false,
}: {
  children: React.ReactNode; profile: Profile; isAdmin?: boolean
}) {
  const userPlan = (profile.plan as PlanType) || 'free'
  const STORAGE_TOTAL_BYTES = PLAN_LIMITS[userPlan]?.maxStorageBytes || PLAN_LIMITS.free.maxStorageBytes
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [notifOpen, setNotifOpen]     = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [proModal, setProModal]       = useState(false)
  const [proModalStep, setProModalStep] = useState<'plan' | 'form'>('plan')
  const [proPhone, setProPhone]       = useState('')
  const [billingLoading, setBillingLoading] = useState(false)
  const [subExpiresAt, setSubExpiresAt] = useState<string | null>(null)

  // Fetch subscription expiry for Pro card
  useEffect(() => {
    if (userPlan === 'pro' || userPlan === 'studio') {
      fetch('/api/billing/subscription')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.subscription?.expires_at) setSubExpiresAt(data.subscription.expires_at) })
        .catch(() => {})
    }
  }, [userPlan])

  const isActive = (href: string, exact?: boolean) => exact ? path === href : path.startsWith(href)

  const storagePercent = profile.storageUsed ? Math.min(100, Math.round((profile.storageUsed / STORAGE_TOTAL_BYTES) * 100)) : 0
  const storageUsedGo  = profile.storageUsed ? (profile.storageUsed / 1e9).toFixed(1) : '0'
  const storageTotalGo = (STORAGE_TOTAL_BYTES / 1e9).toFixed(0)
  const maxGalleries   = PLAN_LIMITS.free.maxGalleries
  const galleryCount   = profile.galleryCount || 0
  const galleryPercent = Math.min(100, Math.round((galleryCount / maxGalleries) * 100))

  // Breadcrumb from path
  const breadcrumb = NAV_ITEMS.find(n => n.exact ? path === n.href : (path.startsWith(n.href) && n.href !== '/dashboard'))?.label
    ?? (path === '/dashboard' ? 'Dashboard' : '')

  const handleCheckout = async () => {
    if (!proPhone.trim()) return
    setBillingLoading(true)
    try {
      const res  = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'pro', phone: proPhone.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur de paiement')
      window.location.href = data.checkout_url
    } catch (err: any) {
      toast.error('Paiement impossible', translateAuthError(err?.message) || 'Erreur lors du paiement. Réessayez.')
      setBillingLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const PRO_FEATURES = [
    'Galeries illimitées',
    '500 photos par galerie',
    'Domaine personnalisé',
    'Statistiques avancées',
    'Support prioritaire 24h',
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#15171A', color: '#F2EDE4', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside
        style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 30, background: 'rgba(8,8,8,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        className="fotia-sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '22px 22px 16px' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', inset: -12, borderRadius: 18, background: 'radial-gradient(ellipse, rgba(223,84,56,0.2) 0%, transparent 70%)', filter: 'blur(10px)', pointerEvents: 'none' }} />
              <img src="/logo.png" alt="Fotia Logo" width={88} style={{ objectFit: 'contain', position: 'relative', filter: 'brightness(1.12) drop-shadow(0 0 10px rgba(223,84,56,0.4))' }} />
            </div>
          </Link>
        </div>

        {/* Nav section label */}
        <div style={{ padding: '4px 22px 8px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#3D3D3D', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Menu</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href} href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px',
                  borderRadius: 11, textDecoration: 'none',
                  fontSize: 13.5, fontWeight: active ? 600 : 500,
                  color: active ? '#F2EDE4' : '#A09890',
                  background: active ? 'rgba(200,72,46,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(200,72,46,0.18)' : '1px solid transparent',
                  transition: 'all 0.18s ease', position: 'relative', overflow: 'hidden',
                }}
                className={active ? '' : 'nav-item-hover'}
              >
                {/* Active left bar */}
                {active && (
                  <motion.div layoutId="nav-bar" style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 99, background: 'linear-gradient(180deg, #DF5438, #C8482E)' }} />
                )}
                <Icon size={15} style={{ color: active ? '#C8482E' : '#555', flexShrink: 0, transition: 'color 0.18s' }} />
                <span>{label}</span>
              </Link>
            )
          })}

          {/* Admin link */}
          {isAdmin && (
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderRadius: 11, textDecoration: 'none', fontSize: 13.5, fontWeight: 500, color: '#C8482E', background: 'rgba(200,72,46,0.06)', border: '1px solid rgba(200,72,46,0.14)', transition: 'all 0.18s', marginTop: 4 }} className="nav-item-hover">
              <Settings size={15} color="#C8482E" />
              Administrateur
              <ArrowUpRight size={12} color="#C8482E" style={{ marginLeft: 'auto' }} />
            </Link>
          )}
        </nav>

        {/* Usage card */}
        <div style={{ padding: '14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 6px 6px' }}>
          {userPlan === 'free' ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={13} color="#C8482E" />
                  <span style={{ fontSize: 11.5, color: '#A09890', fontWeight: 600 }}>Galeries</span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: galleryPercent >= 80 ? '#C8482E' : '#F2EDE4' }}>{galleryCount}/{maxGalleries}</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 12 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${galleryPercent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', background: galleryPercent >= 80 ? 'linear-gradient(90deg, #C8482E, #DF5438)' : 'linear-gradient(90deg, #C8482E, #F59E0B)', borderRadius: 99 }} />
              </div>
              <button
                onClick={() => setProModal(true)}
                style={{ width: '100%', padding: '9px', borderRadius: 9, background: 'linear-gradient(135deg, rgba(200,72,46,0.15), rgba(200,72,46,0.08))', color: '#C8482E', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid rgba(200,72,46,0.2)', transition: 'all 0.2s' }}
                className="hover:bg-[#C8482E]/20"
              >
                <Sparkles size={13} /> Passer au Pro
              </button>
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Sparkles size={13} color="#E8B33D" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#E8B33D' }}>Plan Premium Pro</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#A09890', marginBottom: subExpiresAt ? 6 : 10 }}>Galeries illimitées activées</div>
              {subExpiresAt && (
                <div style={{ fontSize: 10.5, color: '#E8B33D', marginBottom: 10, opacity: 0.75, fontWeight: 500 }}>
                  Expire le {new Date(subExpiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
              <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: 12, color: '#E8B33D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }} className="hover:underline">
                  Gérer l&apos;abonnement <ChevronRight size={12} />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Profile bottom */}
        <div style={{ padding: '0 8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Avatar name={profile.name} plan={userPlan} size={34} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</div>
              <PlanBadge plan={userPlan} size="sm" />
            </div>
            <button onClick={handleLogout} title="Déconnexion" style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 7, transition: 'all 0.2s', flexShrink: 0 }} className="hover:text-red-400 hover:bg-red-500/[0.08]">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MOBILE HEADER ════════════════════════════════════════════════════ */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px', display: 'none', alignItems: 'center', justifyContent: 'space-between' }} className="fotia-mobile-header">
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: 12, background: 'radial-gradient(ellipse, rgba(223,84,56,0.16) 0%, transparent 70%)', filter: 'blur(6px)', pointerEvents: 'none' }} />
            <img src="/logo.png" alt="Fotia Logo" width={68} style={{ objectFit: 'contain', position: 'relative', filter: 'brightness(1.1) drop-shadow(0 0 6px rgba(223,84,56,0.3))' }} />
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative', width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A09890' }}>
            <Bell size={16} />
            <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: '#C8482E', border: '1.5px solid #15171A' }} />
          </button>
          <div style={{ position: 'relative' }}>
            <div onClick={() => setProfileOpen(!profileOpen)} style={{ cursor: 'pointer' }}>
              <Avatar name={profile.name} plan={userPlan} size={34} />
            </div>
            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.96 }} transition={{ duration: 0.14 }} style={{ position: 'absolute', top: 44, right: 0, width: 210, borderRadius: 14, background: '#111', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.7)', zIndex: 100 }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12.5, color: '#F2EDE4', fontWeight: 600 }}>{profile.name}</span>
                    <PlanBadge plan={userPlan} />
                  </div>
                  {userPlan === 'free' && (
                    <button onClick={() => { setProfileOpen(false); setProModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', fontSize: 13, color: '#E8B33D', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Sparkles size={14} /> Passer au Pro
                    </button>
                  )}
                  <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', fontSize: 13, color: '#F2EDE4', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Settings size={14} color="#A09890" /> Paramètres
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', fontSize: 13, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500 }}>
                    <LogOut size={14} /> Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══ MOBILE BOTTOM NAV ════════════════════════════════════════════════ */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'none', alignItems: 'center', justifyContent: 'space-around', padding: '10px 8px 28px' }} className="fotia-mobile-bottom-nav">
        {NAV_ITEMS.slice(0, 5).map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', color: active ? '#C8482E' : '#555', minWidth: 52, padding: '4px', transition: 'color 0.2s' }}>
              <div style={{ position: 'relative', width: 44, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: active ? 'rgba(200,72,46,0.12)' : 'transparent', transition: 'all 0.2s' }}>
                <Icon size={20} />
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </div>

      {/* ══ TOPBAR ═══════════════════════════════════════════════════════════ */}
      <header style={{ position: 'fixed', top: 0, left: 240, right: 0, height: 58, background: 'rgba(8,8,8,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', zIndex: 25 }} className="fotia-topbar">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#3D3D3D', fontWeight: 500 }}>Fotia</span>
          {breadcrumb && (
            <>
              <ChevronRight size={12} color="#2D2D2D" />
              <span style={{ fontSize: 13, color: '#F2EDE4', fontWeight: 600 }}>{breadcrumb}</span>
            </>
          )}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Upgrade CTA for free users */}
          {userPlan === 'free' && (
            <motion.button
              onClick={() => setProModal(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))', color: '#E8B33D', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(251,191,36,0.22)', transition: 'all 0.2s' }}
            >
              <Sparkles size={13} /> Passer au Pro
            </motion.button>
          )}

          {/* Notif bell */}
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A09890', transition: 'all 0.2s' }} className="hover:bg-white/[0.06] hover:text-[#F2EDE4]">
            <Bell size={16} />
            <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#C8482E', border: '1.5px solid #15171A', animation: 'notifPulse 2s ease-in-out infinite' }} />
          </button>

          {/* Profile dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '5px 10px 5px 6px', borderRadius: 11, background: profileOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s' }}
              className="hover:bg-white/[0.04]"
            >
              <Avatar name={profile.name} plan={userPlan} size={28} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#F2EDE4', lineHeight: 1.2 }}>{profile.name.split(' ')[0]}</div>
                <PlanBadge plan={userPlan} size="sm" />
              </div>
              <ChevronDown size={12} color="#555" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 2 }} />
            </div>

            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.96 }} transition={{ duration: 0.14 }} style={{ position: 'absolute', top: 50, right: 0, width: 210, borderRadius: 14, background: '#111', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.8)', zIndex: 100 }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F2EDE4', marginBottom: 3 }}>{profile.name}</div>
                    <div style={{ fontSize: 11.5, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email}</div>
                  </div>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', fontSize: 13, color: '#C8482E', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Settings size={14} /> Espace Admin
                    </Link>
                  )}
                  {userPlan === 'free' && (
                    <button onClick={() => { setProfileOpen(false); setProModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', fontSize: 13, color: '#E8B33D', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Sparkles size={14} /> Passer au Pro
                    </button>
                  )}
                  <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', fontSize: 13, color: '#F2EDE4', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Settings size={14} color="#555" /> Paramètres
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', fontSize: 13, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500 }}>
                    <LogOut size={14} /> Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, minHeight: '100vh' }} className="fotia-main">
        {children}
      </main>

      {/* ══ PRO MODAL ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {proModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => { setProModal(false); setProModalStep('plan'); setProPhone('') }}
          >
            <motion.div
              initial={{ scale: 0.93, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.93, y: 12, opacity: 0 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '32px', width: '100%', maxWidth: 440, position: 'relative', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}
            >
              {/* Glow */}
              <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

              {/* Close */}
              <button onClick={() => { setProModal(false); setProModalStep('plan'); setProPhone('') }} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555', transition: 'all 0.2s' }} className="hover:text-white hover:bg-white/[0.1]">
                <X size={14} />
              </button>

              {/* ── Step 1: Plan overview ── */}
              {proModalStep === 'plan' && (
                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={22} color="#E8B33D" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#F2EDE4', letterSpacing: '-0.02em' }}>Plan Premium Pro</h3>
                      <p style={{ fontSize: 13, color: '#A09890', margin: 0, marginTop: 3 }}>Débloquez toutes les fonctionnalités.</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.03))', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 16, padding: '20px 22px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: 40, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.04em', lineHeight: 1 }}>90 000</span>
                      <span style={{ fontSize: 14, color: '#A09890', fontWeight: 500, marginBottom: 5 }}>FCFA / mois</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {PRO_FEATURES.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: '#F2EDE4', fontWeight: 500 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={11} color="#22C55E" strokeWidth={3} />
                          </div>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment methods */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
                    {['Orange Money', 'MTN MoMo', 'Kulu', 'Wave'].map(m => (
                      <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', color: '#A09890', border: '1px solid rgba(255,255,255,0.08)' }}>{m}</span>
                    ))}
                  </div>

                  <motion.button
                    onClick={() => setProModalStep('form')}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(251,191,36,0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #E8B33D, #D97706)', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(251,191,36,0.25)' }}
                  >
                    <Sparkles size={16} /> Payer maintenant
                  </motion.button>
                </div>
              )}

              {/* ── Step 2: Phone form ── */}
              {proModalStep === 'form' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                    <button onClick={() => setProModalStep('plan')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#F2EDE4', cursor: 'pointer', display: 'flex', padding: '6px', transition: 'all 0.2s' }} className="hover:bg-white/[0.1]">
                      <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <div>
                      <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: '#F2EDE4' }}>Votre numéro mobile</h3>
                      <p style={{ fontSize: 12.5, color: '#A09890', margin: 0, marginTop: 2 }}>Vous recevrez la demande de paiement.</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel" autoFocus
                      placeholder="+221 77 000 00 00"
                      value={proPhone}
                      onChange={e => setProPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCheckout()}
                      style={{ width: '100%', padding: '13px 16px', borderRadius: 13, border: `1.5px solid ${proPhone ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(255,255,255,0.03)', color: '#F2EDE4', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    />
                    <p style={{ fontSize: 11.5, color: '#555', marginTop: 6 }}>Format : +221 ou 00221 suivi du numéro</p>
                  </div>

                  <motion.button
                    onClick={handleCheckout}
                    disabled={billingLoading || !proPhone.trim()}
                    whileHover={proPhone.trim() && !billingLoading ? { scale: 1.02 } : {}}
                    whileTap={proPhone.trim() && !billingLoading ? { scale: 0.98 } : {}}
                    style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: billingLoading || !proPhone.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #E8B33D, #D97706)', color: billingLoading || !proPhone.trim() ? '#4A4A4A' : '#000', fontWeight: 800, fontSize: 15, cursor: proPhone.trim() && !billingLoading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                  >
                    {billingLoading ? (
                      <><div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', animation: 'shellSpin 0.8s linear infinite' }} /> Traitement…</>
                    ) : 'Confirmer le paiement'}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shellSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes notifPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

        .fotia-sidebar { display: flex !important; }
        .fotia-mobile-header { display: none !important; }
        .fotia-mobile-bottom-nav { display: none !important; }
        .fotia-topbar { display: flex !important; }
        .fotia-main { margin-left: 240px; padding-top: 58px; }

        .nav-item-hover:hover { background: rgba(255,255,255,0.03) !important; color: #F2EDE4 !important; border-color: rgba(255,255,255,0.05) !important; }
        .nav-item-hover:hover svg { color: #A09890 !important; }

        @media (max-width: 1024px) {
          .fotia-sidebar { width: 200px !important; }
          .fotia-main { margin-left: 200px !important; }
          .fotia-topbar { left: 200px !important; }
        }

        @media (max-width: 768px) {
          .fotia-sidebar { display: none !important; }
          .fotia-mobile-header { display: flex !important; }
          .fotia-mobile-bottom-nav { display: flex !important; }
          .fotia-topbar { display: none !important; }
          .fotia-main { margin-left: 0 !important; padding-top: 60px; padding-bottom: 84px; }
        }

        @media (max-width: 480px) {
          .fotia-mobile-header { padding: 8px 12px !important; }
          .fotia-mobile-bottom-nav { padding: 6px 4px 24px !important; }
          .fotia-mobile-bottom-nav a { min-width: 44px !important; }
          .fotia-mobile-bottom-nav a svg { width: 18px !important; height: 18px !important; }
          .fotia-mobile-bottom-nav a span { font-size: 9px !important; }
        }
      `}</style>
    </div>
  )
}
