'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid, Heart, BarChart2, Settings, LogOut,
  Menu, X, Bell, ChevronDown, Users, ImageIcon, ChevronRight, Cloud, CreditCard
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { PLAN_LIMITS, PlanType } from '@/lib/limits'

interface Profile { name: string; email: string; plan: string; storageUsed?: number; galleryCount?: number }

const NAV = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Tableau de bord', exact: true },
  { href: '/dashboard/galleries', icon: ImageIcon, label: 'Galeries client' },
  { href: '/dashboard/favorites', icon: Heart, label: 'Favoris' },
  { href: '/dashboard/clients', icon: Users, label: 'Mes Clients' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Statistiques' },
  { href: '/dashboard/settings', icon: Settings, label: 'Paramètres' },
]

export default function DashboardShell({ children, profile, isAdmin = false }: { children: React.ReactNode; profile: Profile; isAdmin?: boolean }) {
  const userPlan = (profile.plan as PlanType) || 'free'
  const STORAGE_TOTAL_BYTES = PLAN_LIMITS[userPlan]?.maxStorageBytes || PLAN_LIMITS.free.maxStorageBytes
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [proModal, setProModal] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)

  const handleCheckout = async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to initiate payment')
      }
      const { checkout_url } = await res.json()
      router.push(checkout_url)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erreur lors de l\'initiation du paiement.')
    } finally {
      setBillingLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return path === href
    return path.startsWith(href)
  }

  const storagePercent = profile.storageUsed ? Math.min(100, Math.round((profile.storageUsed / STORAGE_TOTAL_BYTES) * 100)) : 0
  const storageUsedGo = profile.storageUsed ? (profile.storageUsed / 1e9).toFixed(1) : '0'
  const storageTotalGo = (STORAGE_TOTAL_BYTES / 1e9).toFixed(0)

  const maxGalleries = PLAN_LIMITS.free.maxGalleries
  const galleryCount = profile.galleryCount || 0
  const galleryPercent = Math.min(100, Math.round((galleryCount / maxGalleries) * 100))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#15171A', color: '#F2EDE4', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 30,
        background: 'rgba(10, 10, 10, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }} className="fotia-sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/logo.png" alt="Fotia Logo" width={85} style={{ objectFit: 'contain', filter: 'brightness(1.05)' }} />
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {NAV.map(({ href, icon: Icon, label, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 10, textDecoration: 'none', fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                color: active ? '#F2EDE4' : '#A09890',
                background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: active ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative'
              }} className={active ? '' : 'hover:bg-white/[0.02]'}>
                {active && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    style={{
                      position: 'absolute', left: 0, width: 3, top: 10, bottom: 10,
                      borderRadius: 99, background: '#C8482E'
                    }}
                  />
                )}
                <Icon size={16} style={{ color: active ? '#C8482E' : '#8E8E93', flexShrink: 0, transition: 'color 0.2s' }} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Progress status - Premium visualizer */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {userPlan === 'free' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ImageIcon size={16} color="#C8482E" />
                <span style={{ fontSize: 12, color: '#A09890', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Galeries créées</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
                <div style={{ height: '100%', width: `${galleryPercent}%`, background: 'linear-gradient(90deg, #C8482E 0%, #DF5438 100%)', borderRadius: 99 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11.5, color: '#8E8E93', fontWeight: 500 }}>{galleryCount} / {maxGalleries}</span>
                <span style={{ fontSize: 11.5, color: '#F2EDE4', fontWeight: 600 }}>{galleryPercent}%</span>
              </div>
              <button onClick={() => setProModal(true)} style={{ fontSize: 12, color: '#C8482E', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }} className="hover:underline">
                Passer au plan Pro <ChevronRight size={12} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={16} color="#C8482E" fill="#C8482E" />
                <span style={{ fontSize: 12, color: '#F2EDE4', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Plan Premium Pro</span>
              </div>
              <div style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.5, marginBottom: 4 }}>
                Création de galeries <strong>illimitées</strong>. Profitez de toutes les fonctionnalités.
              </div>
              <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                <button style={{ fontSize: 12, color: '#C8482E', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }} className="hover:underline">
                  Gérer mon forfait <ChevronRight size={12} />
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {isAdmin && (
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', color: '#C8482E', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 12, transition: 'all 0.2s' }} className="hover:bg-orange-500/20">
              <Settings size={14} /> Espace Administrateur
            </Link>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #C8482E, #A4351F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(255,107,53,0.2)'
            }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#F2EDE4' }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: '#8E8E93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE HEADER (Logo + Profile) ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 16px', display: 'none', alignItems: 'center', justifyContent: 'space-between',
      }} className="fotia-mobile-header">
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="Fotia Logo" width={70} style={{ objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Notifications */}
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A09890' }}>
            <Bell size={16} />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#C8482E', border: '1.5px solid #15171A' }} />
          </button>
          {/* Profile Quick view */}
          <div style={{ position: 'relative' }}>
            <div onClick={() => setProfileOpen(!profileOpen)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C8482E, #A4351F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,107,53,0.2)' }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            
            <AnimatePresence>
              {profileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 44, right: 0, width: 170, borderRadius: 12, background: '#111111', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 100 }}
                >
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', fontSize: 13, color: '#C8482E', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Settings size={14} /> Espace Admin
                    </Link>
                  )}
                  <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', fontSize: 13, color: '#F2EDE4', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Settings size={14} /> Paramètres
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500 }}>
                    <LogOut size={14} /> Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'none', alignItems: 'center', justifyContent: 'space-around',
        padding: '10px 8px 24px', // safe area padding at the bottom
      }} className="fotia-mobile-bottom-nav">
        {NAV.slice(0, 5).map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link 
              key={href} 
              href={href} 
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, 
                textDecoration: 'none', color: active ? '#C8482E' : '#8E8E93', 
                minWidth: 56, padding: '4px'
              }} 
            >
              <div style={{ position: 'relative' }}>
                <Icon size={22} style={{ transition: 'all 0.2s', color: active ? '#C8482E' : '#8E8E93' }} />
                {active && <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#C8482E' }} />}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, marginTop: 2 }}>{label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </div>

      {/* ── TOPBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 240, right: 0, height: 58,
        background: 'rgba(8, 8, 8, 0.45)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 25,
      }} className="fotia-topbar">
        <div />

        {/* Right side options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Notifications */}
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative', width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A09890', transition: 'all 0.2s' }} className="hover:bg-white/[0.06] hover:text-white">
            <Bell size={16} />
            <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#C8482E', border: '1.5px solid #15171A' }} />
          </button>

          {/* Profile Quick view */}
          <div style={{ position: 'relative' }}>
            <div onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 12px', borderRadius: 10, transition: 'all 0.2s', background: profileOpen ? 'rgba(255,255,255,0.04)' : 'transparent', border: '1px solid transparent' }} className={profileOpen ? '' : 'hover:bg-white/[0.02]'}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #C8482E, #A4351F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(255,107,53,0.2)' }}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#F2EDE4' }}>{profile.name}</div>
                <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 500 }}>PRO</div>
              </div>
              <ChevronDown size={12} color="#8E8E93" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            
            <AnimatePresence>
              {profileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 48, right: 0, width: 170, borderRadius: 12, background: '#111111', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 100 }}
                >
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500 }} className="hover:bg-red-500/[0.05]">
                    <LogOut size={14} /> Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ flex: 1, minHeight: '100vh' }} className="fotia-main">
        {children}
      </main>

      <style>{`
        .fotia-sidebar { display: flex !important; }
        .fotia-mobile-header { display: none !important; }
        .fotia-mobile-bottom-nav { display: none !important; }
        .fotia-topbar { display: flex !important; }
        .fotia-main { margin-left: 240px; padding-top: 58px; }
        @media (max-width: 768px) {
          .fotia-sidebar { display: none !important; }
          .fotia-mobile-header { display: flex !important; }
          .fotia-mobile-bottom-nav { display: flex !important; }
          .fotia-topbar { display: none !important; }
          .fotia-main { margin-left: 0 !important; padding-top: 60px; padding-bottom: 80px; }
        }
      `}</style>
      {/* Pro Modal */}
      <AnimatePresence>
        {proModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setProModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CreditCard size={20} color="#C8482E" />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#F2EDE4' }}>Passer au Plan Pro</h3>
              </div>
              <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 20 }}>Profitez de toutes les fonctionnalités premium !</p>
              <div style={{ padding: '16px', background: 'rgba(255,107,53,0.08)', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: '#F2EDE4' }}>9€<span style={{ fontSize: 14, fontWeight: 400, color: '#A1A1AA' }}> /mois</span></div>
                <ul style={{ fontSize: 13, color: '#F2EDE4', margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
                  <li>Galeries illimitées</li>
                  <li>1000 photos / galerie</li>
                  <li>Téléchargement HD</li>
                  <li>Filigrane personnalisé</li>
                </ul>
              </div>
              <button 
                onClick={() => { setProModal(false); handleCheckout() }} 
                disabled={billingLoading}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  borderRadius: 12, 
                  background: '#C8482E', 
                  color: '#fff', 
                  border: 'none', 
                  fontWeight: 700, 
                  fontSize: 15, 
                  cursor: billingLoading ? 'not-allowed' : 'pointer',
                  opacity: billingLoading ? 0.7 : 1
                }}
              >
                {billingLoading ? 'Chargement...' : 'Commencer Premium Pro'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
