'use client'
import Link from 'next/link'
import { m } from 'framer-motion'
import { Star, ArrowRight, Play } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { STATS } from './landing-data'
import HeroPhoneMockupDesktop from './HeroPhoneMockupDesktop'
import HeroPhoneMockupMobile from './HeroPhoneMockupMobile'

interface HeroSectionProps {
  isMobile: boolean
  isDesktop: boolean
  onOpenDemo: () => void
}

const fade = fadeUp

export default function HeroSection({ isMobile, isDesktop, onOpenDemo }: HeroSectionProps) {
  return (
    <section className="hero-section" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: 1400,
      margin: '0 auto',
    }}>
      <div style={{ position: 'absolute', top: '30%', left: '25%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,84,56,0.09) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(80px)' }} />

      {/* LEFT — Text content */}
      <m.div
        initial="hidden" animate="show" variants={stagger}
        style={{ flex: 1, zIndex: 10, maxWidth: isMobile ? '100%' : 620 }}
      >
        <m.div variants={fade} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px',
          borderRadius: 99, border: '1px solid rgba(223,84,56,0.25)', background: 'rgba(223,84,56,0.07)',
          marginBottom: 28, fontSize: 13, color: '#C8482E', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase'
        }}>
          <Star size={12} fill="#E8B33D" color="#E8B33D" /> ✦ Nouveau — Partagez via WhatsApp
        </m.div>

        <m.h1 className="font-title" variants={fade} style={{
          fontSize: isMobile ? 'clamp(38px, 12vw, 56px)' : 'clamp(48px, 6vw, 80px)',
          fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24,
          color: '#F2EDE4',
        }}>
          Livrez vos photos{' '}
          <span style={{ color: '#C8482E' }}>comme un pro</span>
        </m.h1>

        <m.p variants={fade} style={{ fontSize: isMobile ? 16 : 18, color: '#A09890', maxWidth: 540, lineHeight: 1.7, marginBottom: 40 }}>
          La plateforme pour photographes qui veulent livrer des galeries élégantes, recevoir les sélections clients et se démarquer.
        </m.p>

        <m.div variants={fade} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
            fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)',
            color: '#fff', boxShadow: '0 6px 24px rgba(223,84,56,0.4)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 32px rgba(223,84,56,0.55)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(223,84,56,0.4)'
            }}
          >
            Commencer gratuitement <ArrowRight size={18} />
          </Link>
          <button
            onClick={onOpenDemo}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12,
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#F2EDE4', transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(223,84,56,0.4)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'
            }}
          >
            <Play size={16} fill="#F2EDE4" color="#F2EDE4" /> Voir la démo
          </button>
        </m.div>

        {/* Social proof */}
        <m.div variants={fade} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '2px solid #15171A',
                marginLeft: i > 1 ? -10 : 0,
                background: `hsl(${i * 40 + 20}, 30%, 30%)`,
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 600, color: '#F2EDE4',
              }}>
                {['A', 'S', 'M', 'J'][i - 1]}
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} fill="#E8B33D" color="#E8B33D" />)}
            </div>
            <div style={{ fontSize: 14, color: '#A09890' }}
              dangerouslySetInnerHTML={{ __html: `<strong style="color:#F2EDE4">+${STATS[0].value} photographes</strong> nous font confiance` }}
            />
          </div>
        </m.div>
      </m.div>

      {/* RIGHT — Phone mockups */}
      <HeroPhoneMockupDesktop isDesktop={isDesktop} />
      <HeroPhoneMockupMobile />
    </section>
  )
}
