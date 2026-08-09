'use client'

import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ElementType } from 'react'
import { Plus, Crown, CheckCircle2, Infinity as InfinityIcon, Activity, ChevronRight, Sun, MoonStar, Hand } from 'lucide-react'
import { stagger } from '@/lib/animations'
import AnimatedNumber from './AnimatedNumber'
import Skeleton from './Skeleton'

/* Animations douces de l'icône de salutation selon le créneau horaire */
const greetingIconVariants: Variants = {
  spin: {
    rotate: [0, 360],
    transition: { duration: 24, repeat: Number.POSITIVE_INFINITY, ease: 'linear' },
  },
  pulse: {
    scale: [1, 1.12, 1],
    transition: { duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
  },
  wave: {
    rotate: [-14, 14, -14],
    transition: { duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
  },
  breathe: {
    scale: [1, 1.06, 1],
    opacity: [1, 0.82, 1],
    transition: { duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
  },
}

type GreetingIconAnim = 'spin' | 'pulse' | 'wave' | 'breathe'

export interface DashboardKpi {
  icon: ElementType
  label: string
  val: number
  accent: string
  bg: string
  border: string
  sub: string
}

interface DashboardHeroProps {
  greeting: string
  greetingIcon: ElementType
  greetingAccent: string
  loading: boolean
  isPro: boolean
  daysLeft: number
  kpis: DashboardKpi[]
  onOpenCreate: () => void
}

export default function DashboardHero({ greeting, greetingIcon: GreetingIcon, greetingAccent, loading, isPro, daysLeft, kpis, onOpenCreate }: DashboardHeroProps) {
  const reduceMotion = useReducedMotion()
  const iconAnim: GreetingIconAnim =
    GreetingIcon === Sun ? 'spin'
      : GreetingIcon === MoonStar ? 'pulse'
      : GreetingIcon === Hand ? 'wave'
      : 'breathe'

  return (
    <div className="dash-hero" style={{ position: 'relative', overflow: 'hidden', padding: '44px 36px 0', marginBottom: 0 }}>
      {/* Ambient gradient background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: -60, width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.09) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 350, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
        {/* Left: greeting */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div className="dash-greet-icon" style={{
              width: 46, height: 46, borderRadius: 13, flexShrink: 0,
              background: `linear-gradient(135deg, ${greetingAccent}26 0%, ${greetingAccent}0A 100%)`,
              border: `1px solid ${greetingAccent}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 18px ${greetingAccent}30`,
            }}>
              <motion.div
                animate={reduceMotion ? undefined : iconAnim}
                variants={greetingIconVariants}
                aria-hidden="true"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transformOrigin: iconAnim === 'wave' ? '50% 85%' : '50% 50%' }}
              >
                <GreetingIcon size={22} color={greetingAccent} />
              </motion.div>
            </div>
            <h1 style={{ fontSize: 'clamp(24px,3vw,34px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#F2EDE4', margin: 0, textTransform: 'uppercase', lineHeight: 1.05 }}>
              {greeting}
            </h1>
          </div>
          <p style={{ fontSize: 14.5, color: '#A09890', margin: 0, fontWeight: 500, lineHeight: 1.55, maxWidth: 440 }}>
            Simplifiez la livraison et optimisez le choix de vos clients.
          </p>
        </motion.div>

        {/* Right: CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          onClick={onOpenCreate}
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
          className="dash-pro-banner"
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
          <div className="dash-pro-icon" style={{
            width: 44, height: 44, borderRadius: 13,
            background: 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(245,158,11,0.1))',
            border: '1px solid rgba(251,191,36,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 20px rgba(251,191,36,0.15)',
          }}>
            <Crown size={20} color="#E8B33D" />
          </div>

          {/* Info */}
          <div className="dash-pro-info" style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span className="dash-pro-title" style={{ fontSize: 15, fontWeight: 700, color: '#E8B33D', letterSpacing: '-0.01em' }}>Plan Premium Pro</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                color: '#22C55E', letterSpacing: '0.06em', textTransform: 'uppercase',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <CheckCircle2 size={9} /> Actif
              </span>
            </div>
            <div className="dash-pro-features" style={{ fontSize: 12.5, color: '#A09890', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <InfinityIcon size={11} color="#E8B33D" /> Galeries illimitées
              </span>
              <span>·</span>
              <span>Téléchargement HD</span>
              <span>·</span>
              <span>Stats avancées</span>
              {daysLeft > 0 && (
                <>
                  <span>·</span>
                  <span style={{ color: daysLeft <= 7 ? '#F59E0B' : '#A09890', fontWeight: daysLeft <= 7 ? 600 : 400 }}>
                    {daysLeft <= 7 ? `⏳ Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : `Renouvellement dans ${daysLeft} jours`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard/settings"
            className="dash-pro-cta hover:bg-[#E8B33D]/20"
            style={{
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.25)',
              color: '#E8B33D', fontSize: 12.5, fontWeight: 600,
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            Gérer <ChevronRight size={12} />
          </Link>
        </motion.div>
      )}

      {/* KPI Cards */}
      <motion.div
        initial="hidden" animate="show" variants={stagger}
        style={{ display: 'grid', gap: 14, marginBottom: 0 }}
        className="kpi-grid"
      >
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="kpi-card"
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

            <div className="kpi-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="kpi-icon-box" style={{ width: 42, height: 42, borderRadius: 12, background: kpi.bg, border: `1px solid ${kpi.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={19} color={kpi.accent} />
              </div>
              <div className="kpi-live" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '3px 9px', borderRadius: 99 }}>
                <Activity size={9} /> LIVE
              </div>
            </div>

            {loading ? (
              <><Skeleton h={32} radius={8} /><div style={{ marginTop: 8 }}><Skeleton h={13} radius={6} w="70%" /></div></>
            ) : (
              <>
                <div className="kpi-value" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: '#F2EDE4', lineHeight: 1, marginBottom: 6 }}>
                  <AnimatedNumber value={kpi.val} />
                </div>
                <div className="kpi-label" style={{ fontSize: 12.5, color: '#A09890', fontWeight: 600, letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: 3 }}>{kpi.label}</div>
                <div className="kpi-sub" style={{ fontSize: 11.5, color: kpi.accent, fontWeight: 500, opacity: 0.8 }}>{kpi.sub}</div>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
