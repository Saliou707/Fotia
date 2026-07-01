'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ArrowRight, Upload, Share2, Heart, Download,
  Star, CheckCircle, Zap, MessageSquare, Shield,
  Smartphone, Menu, X, Camera, BarChart3, Play,
  Globe, Mail
} from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'

const fade = fadeUp

const HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=400&q=80&auto=format&fit=crop',
]

const FEATURES = [
  {
    icon: Upload,
    title: 'Upload & Créer',
    desc: 'Uploadez vos photos et créez de belles galeries en quelques minutes.'
  },
  {
    icon: Share2,
    title: 'Partager Instantanément',
    desc: 'Partagez instantanément via WhatsApp avec vos clients. Un seul clic.'
  },
  {
    icon: Heart,
    title: 'Favoris Clients',
    desc: 'Vos clients sélectionnent leurs meilleures photos. Vous livrez avec confiance.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Puissantes',
    desc: 'Suivez les vues, favoris et téléchargements avec des statistiques détaillées.'
  },
]

const STEPS = [
  { n: '01', label: 'Uploadez vos créations', sub: 'Glissez-déposez vos photos brutes ou retouchées en haute résolution.' },
  { n: '02', label: 'Partagez via WhatsApp', sub: 'Copiez le lien élégant et envoyez-le directement sur le chat de votre client.' },
  { n: '03', label: 'Sélection client immersive', sub: 'Votre client fait son choix sur son mobile grâce à une interface fluide.' },
  { n: '04', label: 'Livraison en un clic', sub: 'Votre client télécharge sa sélection validée. Vous contrôlez tout.' },
]

const FLOATING_CARDS = [
  { icon: MessageSquare, text: 'Galerie envoyée sur WhatsApp !', color: '#25D366', delay: 0, style: { top: '15%', left: '4%' } },
  { icon: Heart, text: 'Sarah a sélectionné 24 favoris ❤️', color: '#C8482E', delay: 1.5, style: { bottom: '25%', left: '6%' } },
  { icon: Shield, text: 'Sauvegarde cloud sécurisée (R2)', color: '#3B82F6', delay: 0.8, style: { top: '25%', right: '5%' } },
]

const TRUSTED_BY = [
  { name: 'Klala Photography', style: 'italic' },
  { name: 'Amara Studios', style: 'normal' },
  { name: 'Eleanor Gooding', style: 'italic' },
  { name: 'Pixel Perfect', style: 'normal' },
  { name: 'Lenskulture', style: 'italic' },
  { name: 'Smile Photos', style: 'normal' },
]

const CLIENT_FEATURES = [
  { icon: Smartphone, label: 'Galerie mobile élégante' },
  { icon: Heart, label: 'Favoris faciles' },
  { icon: Download, label: 'Téléchargements HD' },
]

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#workflow' },
  { label: 'WhatsApp', href: '#whatsapp' },
  { label: 'Tarifs', href: '#pricing' },
]

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 1600
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, target])

  return <span ref={ref} className="font-mono">{count.toLocaleString()}{suffix}</span>
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    const onResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsDesktop(window.innerWidth > 1024)
    }
    onResize()
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div style={{ background: '#15171A', color: '#F2EDE4', fontFamily: 'var(--font-inter, Inter, sans-serif)', overflowX: 'hidden' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? '10px 28px' : '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(8,8,8,0.75)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(255,107,53,0.12)' : '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
        gap: 16,
      }}>

        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{
              position: 'absolute', inset: -8, borderRadius: 16,
              background: 'radial-gradient(ellipse, rgba(255,107,53,0.2) 0%, transparent 70%)',
              filter: 'blur(10px)', pointerEvents: 'none',
            }} />
            <img
              src="/logo.png" alt="Fotia Logo"
              width={isMobile ? 80 : 100}
              style={{ objectFit: 'contain', position: 'relative', filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(255,107,53,0.4))' }}
            />
          </div>
        </Link>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  color: '#A09890', fontSize: 15, fontWeight: 500,
                  textDecoration: 'none', padding: '8px 14px', borderRadius: 10,
                  transition: 'all 0.2s ease', letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#F2EDE4'
                  ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#A09890'
                  ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {!isMobile && (
            <Link
              href="/login"
              style={{
                color: '#A09890', fontSize: 15, fontWeight: 500,
                textDecoration: 'none', padding: '8px 14px', borderRadius: 10,
                transition: 'color 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#F2EDE4'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#A09890'}
            >
              Connexion
            </Link>
          )}
          <Link
            href="/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: isMobile ? '8px 16px' : '9px 20px',
              borderRadius: 12, textDecoration: 'none',
              fontSize: 15, fontWeight: 600,
              background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)',
              color: '#fff', boxShadow: '0 4px 16px rgba(255,107,53,0.35)',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(255,107,53,0.5)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(255,107,53,0.35)'
            }}
          >
            {!isMobile && <Camera size={14} />}
            Commencer
          </Link>

          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '8px', color: '#F2EDE4', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {menuOpen
                  ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} /></motion.span>
                  : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={20} /></motion.span>
                }
              </AnimatePresence>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 65, left: 12, right: 12, zIndex: 999,
              borderRadius: 20, background: 'rgba(14,14,14,0.97)',
              backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)',
              padding: '20px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label} href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    color: '#F2EDE4', fontSize: 16, fontWeight: 500,
                    textDecoration: 'none', padding: '12px 16px', borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  {link.label}
                  <ArrowRight size={14} color="#C8482E" />
                </motion.a>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '12px', borderRadius: 12, textDecoration: 'none', color: '#A09890', fontSize: 15, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)' }}>
                Connexion
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '13px', borderRadius: 12, textDecoration: 'none', color: '#fff', fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)', boxShadow: '0 4px 16px rgba(255,107,53,0.3)' }}>
                Commencer gratuitement →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO — Split Layout ===== */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '110px 20px 60px' : '0 60px',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: 1400,
        margin: '0 auto',
        gap: isMobile ? 48 : 0,
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '30%', left: '25%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(80px)' }} />

        {/* LEFT — Text content */}
        <motion.div
          initial="hidden" animate="show" variants={stagger}
          style={{ flex: 1, zIndex: 10, maxWidth: isMobile ? '100%' : 620 }}
        >
          <motion.div variants={fade} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px',
            borderRadius: 99, border: '1px solid rgba(255,107,53,0.25)', background: 'rgba(255,107,53,0.07)',
            marginBottom: 28, fontSize: 13, color: '#C8482E', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase'
          }}>
            <Star size={12} fill="#E8B33D" color="#E8B33D" /> Pour les Photographes, par des Photographes
          </motion.div>

          <motion.h1 className="font-title" variants={fade} style={{
            fontSize: isMobile ? 'clamp(38px, 12vw, 56px)' : 'clamp(48px, 6vw, 80px)',
            fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24,
            color: '#F2EDE4',
          }}>
            Livrez vos photos{' '}
            <span style={{ color: '#C8482E' }}>magnifiquement.</span>
          </motion.h1>

          <motion.p variants={fade} style={{ fontSize: isMobile ? 16 : 18, color: '#787068', maxWidth: 540, lineHeight: 1.7, marginBottom: 40 }}>
            La plateforme moderne pour créer de superbes galeries, partager sur WhatsApp et laisser vos clients marquer les photos qu&apos;ils adorent.
          </motion.p>

          <motion.div variants={fade} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
              fontSize: 16, fontWeight: 700,
              background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)',
              color: '#fff', boxShadow: '0 6px 24px rgba(255,107,53,0.4)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 32px rgba(255,107,53,0.55)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(255,107,53,0.4)'
              }}
            >
              Commencer gratuitement <ArrowRight size={18} />
            </Link>
            <a href="#workflow" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
              fontSize: 16, fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#F2EDE4', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.22)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)'
              }}
            >
              <Play size={16} fill="#F2EDE4" /> Voir la démo
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fade} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
              <div style={{ fontSize: 14, color: '#787068' }}>
                Adoré par <span style={{ color: '#F2EDE4', fontWeight: 600 }}>1 200+</span> photographes à travers l&apos;Afrique et au-delà.
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT — Realistic Phone mockup (Fotia gallery view) */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: 60, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 10, paddingTop: 40 }}
          >
            {/* Floating WhatsApp notification */}
            {isDesktop && (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: '8%', left: '-2%', zIndex: 20,
                  padding: '10px 16px', borderRadius: 14,
                  background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={15} color="#25D366" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>WhatsApp · maintenant</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#F2EDE4' }}>Galerie partagée avec 12 clients</div>
                </div>
              </motion.div>
            )}

            {/* Floating views card */}
            {isDesktop && (
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                style={{
                  position: 'absolute', top: '45%', right: '-4%', zIndex: 20,
                  padding: '12px 18px', borderRadius: 14,
                  background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>Vues totales</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#C8482E', letterSpacing: '-0.02em', lineHeight: 1 }}>3.6K</div>
              </motion.div>
            )}

            {/* Floating favorites card */}
            {isDesktop && (
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                style={{
                  position: 'absolute', bottom: '14%', left: '-4%', zIndex: 20,
                  padding: '12px 18px', borderRadius: 14,
                  background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,107,53,0.2)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <Heart size={11} color="#C8482E" fill="#C8482E" />
                  <div style={{ fontSize: 10, color: '#555' }}>Favoris</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.02em', lineHeight: 1 }}>1.2K</div>
              </motion.div>
            )}

            {/* ─── Phone Frame ─── */}
            <div style={{
              width: 288,
              height: 620,
              borderRadius: 46,
              background: '#0d0d0d',
              border: '8px solid #1a1a1a',
              boxShadow: [
                '0 0 0 1px rgba(255,255,255,0.06)',
                '0 50px 120px rgba(0,0,0,0.8)',
                '0 20px 60px rgba(255,107,53,0.08)',
                'inset 0 1px 0 rgba(255,255,255,0.08)',
              ].join(', '),
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {/* Dynamic Island */}
              <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                width: 100, height: 28, borderRadius: 14,
                background: '#0d0d0d', zIndex: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1d1d1d' }} />
                <div style={{ width: 50, height: 18, borderRadius: 9, background: '#1d1d1d' }} />
              </div>

              {/* Status bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 48,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                padding: '0 18px 6px', zIndex: 25,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>9:41</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {/* Signal bars */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
                    {[3, 5, 8, 11].map((h, i) => (
                      <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: i < 3 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }} />
                    ))}
                  </div>
                  {/* Battery */}
                  <div style={{ width: 22, height: 11, borderRadius: 3, border: '1px solid rgba(255,255,255,0.5)', position: 'relative', marginLeft: 2 }}>
                    <div style={{ position: 'absolute', left: 2, top: 2, bottom: 2, width: '70%', borderRadius: 1.5, background: 'rgba(255,255,255,0.8)' }} />
                    <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 3, height: 5, borderRadius: '0 2px 2px 0', background: 'rgba(255,255,255,0.5)' }} />
                  </div>
                </div>
              </div>

              {/* Scrollable gallery content */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                overflowY: 'hidden', overflowX: 'hidden',
                background: '#0f0f0f',
              }}>
                {/* ── Top bar (app header) ── */}
                <div style={{
                  padding: '48px 14px 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#0f0f0f',
                }}>
                  <img src="/logo.png" alt="Fotia" style={{ height: 18, objectFit: 'contain', filter: 'brightness(1.1)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <Smartphone size={9} color="#A09890" />
                      <span style={{ fontSize: 9, color: '#A09890', fontWeight: 600 }}>Ouvrir</span>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, color: '#787068', lineHeight: 1 }}>···</span>
                    </div>
                  </div>
                </div>

                {/* ── Cover Photo ── */}
                <div style={{ position: 'relative', margin: '0 14px', borderRadius: 14, overflow: 'hidden', height: 120 }}>
                  <img
                    src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80&auto=format&fit=crop"
                    alt="Love in Accra cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,15,15,0.2) 0%, rgba(15,15,15,0.7) 100%)' }} />
                </div>

                {/* ── Photographer info ── */}
                <div style={{ padding: '10px 14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #DF5438, #C8482E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Camera size={11} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#F2EDE4', lineHeight: 1.2 }}>Amara Studios</div>
                      <div style={{ fontSize: 9, color: '#555' }}>Wedding Photographer</div>
                    </div>
                  </div>

                  {/* Gallery title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.02em' }}>Love in Accra</span>
                    <span style={{ color: '#C8482E', fontSize: 13 }}>✦</span>
                  </div>
                  <div style={{ fontSize: 9, color: '#555', lineHeight: 1.4, marginBottom: 8 }}>
                    Une belle union d&apos;amour et de culture. Capturée au cœur d&apos;Accra.
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    {[
                      { icon: '📷', label: '152 photos' },
                      { icon: '📅', label: '12 mai 2024' },
                      { icon: '👁', label: '3.6K vues' },
                    ].map(({ icon, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontSize: 8 }}>{icon}</span>
                        <span style={{ fontSize: 8, color: '#555', fontWeight: 500 }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      padding: '6px 0', borderRadius: 8,
                      background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.25)',
                    }}>
                      <Heart size={9} color="#C8482E" fill="#C8482E" />
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#C8482E' }}>Tout aimer</span>
                    </div>
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      padding: '6px 0', borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                    }}>
                      <Share2 size={9} color="#A09890" />
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#A09890' }}>Partager</span>
                    </div>
                  </div>
                </div>

                {/* ── Gallery grid header ── */}
                <div style={{ padding: '0 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#F2EDE4' }}>Galerie</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 8, color: '#555' }}>Filtrer</span>
                    <span style={{ fontSize: 8, color: '#555' }}>Trier</span>
                  </div>
                </div>

                {/* ── Photo grid 3-col ── */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2,
                  padding: '0 2px',
                }}>
                  {[
                    { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&q=80&auto=format&fit=crop', liked: false },
                    { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80&auto=format&fit=crop', liked: true },
                    { src: 'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=200&q=80&auto=format&fit=crop', liked: false },
                    { src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80&auto=format&fit=crop', liked: true },
                    { src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&q=80&auto=format&fit=crop', liked: false },
                    { src: 'https://images.unsplash.com/photo-1519741497674-4d5e0a1e1c4b?w=200&q=80&auto=format&fit=crop', liked: true },
                    { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&q=80&auto=format&fit=crop', liked: false },
                    { src: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=200&q=80&auto=format&fit=crop', liked: true },
                    { src: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=200&q=80&auto=format&fit=crop', liked: false },
                  ].map(({ src, liked }, i) => (
                    <div key={i} style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {/* Heart overlay */}
                      <div style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 18, height: 18, borderRadius: '50%',
                        background: liked ? '#C8482E' : 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: liked ? 'none' : 'blur(4px)',
                        border: liked ? 'none' : '1px solid rgba(255,255,255,0.15)',
                      }}>
                        <Heart size={9} color="#fff" fill={liked ? '#fff' : 'transparent'} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Powered by */}
                <div style={{ padding: '10px 0 4px', textAlign: 'center' }}>
                  <span style={{ fontSize: 8, color: '#333' }}>Propulsé par </span>
                  <span style={{ fontSize: 8, color: '#C8482E', fontWeight: 700 }}>Fotia</span>
                </div>
              </div>

              {/* ── Sticky bottom bar ── */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '10px 14px 22px',
                background: 'linear-gradient(to top, rgba(10,10,10,1) 60%, rgba(10,10,10,0.95) 80%, transparent 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Heart size={13} color="#C8482E" fill="#C8482E" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#F2EDE4', lineHeight: 1 }}>24</div>
                    <div style={{ fontSize: 9, color: '#555', lineHeight: 1 }}>Favoris</div>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '9px 16px', borderRadius: 20,
                  background: 'linear-gradient(135deg, #DF5438, #C8482E)',
                  boxShadow: '0 4px 14px rgba(255,107,53,0.45)',
                }}>
                  <Download size={11} color="#fff" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Télécharger les favoris</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}



        {/* Mobile — Ultra-realistic iPhone 15 Pro mockup */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative', paddingBottom: 16 }}
          >
            {/* Ambient glow behind phone */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 60%, rgba(200,72,46,0.18) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

            {/* iPhone 15 Pro — titanium frame */}
            <div style={{
              width: 240,
              height: 510,
              borderRadius: 46,
              background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 40%, #222 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: [
                '0 0 0 6px #1c1c1e',
                '0 0 0 7px rgba(255,255,255,0.08)',
                '0 30px 80px rgba(0,0,0,0.85)',
                '0 10px 40px rgba(200,72,46,0.12)',
                'inset 0 1px 0 rgba(255,255,255,0.1)',
                'inset 0 -1px 0 rgba(0,0,0,0.5)',
              ].join(', '),
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {/* Side buttons — power */}
              <div style={{ position: 'absolute', right: -3, top: '28%', width: 3, height: 60, borderRadius: '0 2px 2px 0', background: 'linear-gradient(to right, #2a2a2a, #1a1a1a)', zIndex: 40 }} />
              {/* Side buttons — volume */}
              <div style={{ position: 'absolute', left: -3, top: '22%', width: 3, height: 36, borderRadius: '2px 0 0 2px', background: 'linear-gradient(to left, #2a2a2a, #1a1a1a)', zIndex: 40 }} />
              <div style={{ position: 'absolute', left: -3, top: '32%', width: 3, height: 36, borderRadius: '2px 0 0 2px', background: 'linear-gradient(to left, #2a2a2a, #1a1a1a)', zIndex: 40 }} />
              {/* Action button */}
              <div style={{ position: 'absolute', left: -3, top: '16%', width: 3, height: 22, borderRadius: '2px 0 0 2px', background: 'linear-gradient(to left, #3a3a3a, #2a2a2a)', zIndex: 40 }} />

              {/* Screen bezel */}
              <div style={{
                position: 'absolute', inset: 6,
                borderRadius: 42,
                background: '#0a0a0a',
                overflow: 'hidden',
              }}>
                {/* Dynamic Island */}
                <div style={{
                  position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                  width: 90, height: 26, borderRadius: 13,
                  background: '#0a0a0a',
                  zIndex: 30, border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a1a1a' }} />
                  <div style={{ width: 42, height: 16, borderRadius: 8, background: '#1a1a1a' }} />
                </div>

                {/* Status bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 44,
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                  padding: '0 16px 5px', zIndex: 25,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.02em' }}>9:41</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                      {[3, 5, 7, 9].map((h, i) => (
                        <div key={i} style={{ width: 2.5, height: h, borderRadius: 1, background: i < 3 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }} />
                      ))}
                    </div>
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path d="M6.5 1.5C8.5 1.5 10.2 2.3 11.4 3.6L12.5 2.4C11 0.9 8.9 0 6.5 0C4.1 0 2 0.9 0.5 2.4L1.6 3.6C2.8 2.3 4.5 1.5 6.5 1.5Z" fill="rgba(255,255,255,0.75)"/>
                      <path d="M6.5 4C7.8 4 9 4.5 9.8 5.4L11 4.2C9.9 3 8.3 2.2 6.5 2.2C4.7 2.2 3.1 3 2 4.2L3.2 5.4C4 4.5 5.2 4 6.5 4Z" fill="rgba(255,255,255,0.75)"/>
                      <circle cx="6.5" cy="8" r="1.5" fill="rgba(255,255,255,0.75)"/>
                    </svg>
                    <div style={{ width: 20, height: 10, borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.5)', position: 'relative', marginLeft: 1 }}>
                      <div style={{ position: 'absolute', left: 2, top: 2, bottom: 2, width: '65%', borderRadius: 1, background: 'rgba(255,255,255,0.8)' }} />
                      <div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 2.5, height: 5, borderRadius: '0 1.5px 1.5px 0', background: 'rgba(255,255,255,0.5)' }} />
                    </div>
                  </div>
                </div>

                {/* App content */}
                <div style={{ position: 'absolute', inset: 0, top: 0, background: '#0f0f0f', overflowY: 'hidden' }}>
                  {/* Top app bar */}
                  <div style={{ padding: '50px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,15,15,0.95)' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.01em' }}>Love in Accra</div>
                      <div style={{ fontSize: 9, color: '#555' }}>152 photos · Amara Studios</div>
                    </div>
                    <div style={{ padding: '4px 9px', background: 'rgba(255,255,255,0.05)', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid rgba(255,255,255,0.07)' }}>
                      <Share2 size={8} color="#A09890" />
                      <span style={{ fontSize: 8.5, fontWeight: 600, color: '#A09890' }}>Share</span>
                    </div>
                  </div>

                  {/* Cover photo */}
                  <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
                    <img
                      src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&q=85&auto=format&fit=crop"
                      alt="Wedding cover"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(15,15,15,0.9) 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 8, left: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#DF5438,#C8482E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={9} color="#fff" />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#F2EDE4' }}>Amara Studios</span>
                    </div>
                  </div>

                  {/* Photo grid — 3 columns, different photos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, padding: '8px 2px 2px' }}>
                    {[
                      { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80&auto=format&fit=crop', liked: true },
                      { src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=200&q=80&auto=format&fit=crop', liked: false },
                      { src: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=200&q=80&auto=format&fit=crop', liked: true },
                      { src: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=200&q=80&auto=format&fit=crop', liked: false },
                      { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&q=80&auto=format&fit=crop', liked: true },
                      { src: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=200&q=80&auto=format&fit=crop', liked: false },
                      { src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=200&q=80&auto=format&fit=crop', liked: true },
                      { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200&q=80&auto=format&fit=crop', liked: false },
                      { src: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=200&q=80&auto=format&fit=crop', liked: true },
                    ].map(({ src, liked }, i) => (
                      <div key={i} style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{
                          position: 'absolute', top: 3, right: 3,
                          width: 16, height: 16, borderRadius: '50%',
                          background: liked ? '#C8482E' : 'rgba(0,0,0,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backdropFilter: liked ? 'none' : 'blur(4px)',
                        }}>
                          <Heart size={8} color="#fff" fill={liked ? '#fff' : 'transparent'} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticky bottom bar */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '8px 12px 16px',
                  background: 'linear-gradient(to top, rgba(8,8,8,1) 55%, rgba(8,8,8,0.96) 75%, transparent 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Heart size={11} color="#C8482E" fill="#C8482E" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#F2EDE4', lineHeight: 1 }}>24</div>
                      <div style={{ fontSize: 8, color: '#555', lineHeight: 1 }}>Favoris</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 18,
                    background: 'linear-gradient(135deg, #DF5438, #C8482E)',
                    boxShadow: '0 3px 12px rgba(255,107,53,0.5)',
                  }}>
                    <Download size={9} color="#fff" />
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff' }}>Télécharger</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section style={{ padding: isMobile ? '36px 20px 44px' : '44px 32px 56px', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#080808', overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ maxWidth: 1100, margin: '0 auto' }}
        >
          {/* Label */}
          <div style={{
            textAlign: 'center', marginBottom: isMobile ? 24 : 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06))' }} />
            <span style={{ fontSize: 10, color: '#444', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Approuvé par les photographes &amp; studios
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.06))' }} />
          </div>

          {/* Studio names — serif italic editorial style */}
          <div style={{
            display: 'flex',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0,
          }}>
            {TRUSTED_BY.map(({ name, style: fontStyle }, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  style={{
                    fontSize: isMobile ? 14 : 17,
                    fontFamily: fontStyle === 'italic'
                      ? 'var(--font-playfair, "Playfair Display", Georgia, serif)'
                      : 'var(--font-inter, "Inter", "Helvetica Neue", sans-serif)',
                    fontStyle: fontStyle === 'italic' ? 'italic' : 'normal',
                    fontWeight: fontStyle === 'italic' ? 500 : 600,
                    color: '#4a4a4a',
                    letterSpacing: fontStyle === 'italic' ? '0.01em' : '0.08em',
                    textTransform: fontStyle === 'italic' ? 'none' : 'uppercase',
                    whiteSpace: 'nowrap',
                    padding: isMobile ? '6px 14px' : '0 28px',
                    transition: 'color 0.25s ease',
                    cursor: 'default',
                  }}
                  whileHover={{ color: '#888' }}
                >
                  {name}
                </motion.div>
                {/* Separator dot */}
                {i < TRUSTED_BY.length - 1 && (
                  <div style={{
                    width: 3, height: 3, borderRadius: '50%',
                    background: '#2a2a2a',
                    flexShrink: 0,
                    display: isMobile && i % 2 === 1 ? 'none' : 'block',
                  }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: isMobile ? '80px 20px 60px' : '120px 40px 100px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(60px)' }} />

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fade} style={{ textAlign: 'center', marginBottom: 72 }}>
            <h2 className="font-title" style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, color: '#F2EDE4' }}>
              Tout ce qu&apos;il vous faut pour délivrer une{' '}
              <span style={{ color: '#C8482E' }}>expérience inoubliable</span>
            </h2>
            <p style={{ fontSize: 18, color: '#787068', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
              Des outils conçus pour les photographes professionnels.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 20 }}>
            {FEATURES.map((f, idx) => (
              <motion.div
                key={f.title}
                variants={fade}
                style={{
                  padding: isMobile ? '24px 18px' : '36px 28px', borderRadius: 20,
                  background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,107,53,0.09)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 20, border: '1px solid rgba(255,107,53,0.15)',
                }}>
                  <f.icon size={22} color="#C8482E" />
                </div>
                <div style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18, marginBottom: 10, color: '#F2EDE4' }}>{f.title}</div>
                <div style={{ color: '#787068', fontSize: isMobile ? 13 : 15, lineHeight: 1.6 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== CLIENT EXPERIENCE ===== */}
      <section style={{ padding: isMobile ? '80px 20px' : '120px 40px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 48 : 80 }}>

          {/* Left — Phone(s) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'relative', 
              width: '100%',
              minHeight: isMobile ? 500 : 600,
            }}
          >
            {/* glow behind phone */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.10) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            {/* Background Phone (Grid) - Hidden on Mobile to avoid clutter/overlap */}
            {!isMobile && (
              <div style={{
                width: 250, height: 520,
                borderRadius: 42,
                background: '#0a0a0a',
                position: 'absolute', left: '10%', top: 30,
                boxShadow: '0 0 0 2px #333, 0 0 0 6px #151515, 0 20px 40px rgba(0,0,0,0.6)',
                transform: 'rotate(-5deg)',
                zIndex: 1,
              }}>
                <div style={{ width: '100%', height: '100%', background: '#0a0a0a', borderRadius: 40, overflow: 'hidden', position: 'relative' }}>
                   {/* Dynamic Island */}
                   <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 70, height: 20, background: '#000', borderRadius: 10, zIndex: 20 }} />
                   
                   {/* Side Buttons */}
                   <div style={{ position: 'absolute', left: -6, top: 100, width: 3, height: 20, background: '#333', borderRadius: '3px 0 0 3px' }} />
                   <div style={{ position: 'absolute', left: -6, top: 135, width: 3, height: 40, background: '#333', borderRadius: '3px 0 0 3px' }} />
                   <div style={{ position: 'absolute', left: -6, top: 185, width: 3, height: 40, background: '#333', borderRadius: '3px 0 0 3px' }} />
                   <div style={{ position: 'absolute', right: -6, top: 140, width: 3, height: 60, background: '#333', borderRadius: '0 3px 3px 0' }} />

                   {/* Top app bar */}
                   <div style={{ padding: '40px 14px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(10,10,10,0.95)' }}>
                      <div>
                         <div style={{ fontSize: 13, fontWeight: 700, color: '#F2EDE4', marginBottom: 2 }}>Studio Session</div>
                         <div style={{ fontSize: 10, color: '#555' }}>58 photos</div>
                      </div>
                      <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Share2 size={10} color="#A09890" />
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#A09890' }}>Share</span>
                      </div>
                   </div>
                   {/* Grid */}
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: '0 4px', height: '100%', overflow: 'hidden' }}>
                      {HERO_PHOTOS.map((src, i) => (
                        <div key={i} style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: i === 0 ? '3/4' : '1/1', gridRow: i === 0 ? 'span 2' : 'auto' }}>
                          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {/* Foreground Phone (Large Photo) - Centered on Mobile */}
            <div style={{
              width: isMobile ? 260 : 280, height: isMobile ? 540 : 580,
              borderRadius: 44,
              background: '#0a0a0a',
              position: isMobile ? 'relative' : 'absolute', 
              right: isMobile ? 'auto' : '5%', 
              bottom: isMobile ? 'auto' : 0,
              boxShadow: '0 0 0 2px #444, 0 0 0 6px #1a1a1a, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05)',
              zIndex: 2,
            }}>
              <div style={{ width: '100%', height: '100%', background: '#0a0a0a', borderRadius: 42, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Dynamic Island */}
                <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 80, height: 24, background: '#000', borderRadius: 12, zIndex: 20 }} />
                
                {/* Side Buttons */}
                <div style={{ position: 'absolute', left: -6, top: 100, width: 3, height: 20, background: '#333', borderRadius: '3px 0 0 3px' }} />
                <div style={{ position: 'absolute', left: -6, top: 135, width: 3, height: 40, background: '#333', borderRadius: '3px 0 0 3px' }} />
                <div style={{ position: 'absolute', left: -6, top: 185, width: 3, height: 40, background: '#333', borderRadius: '3px 0 0 3px' }} />
                <div style={{ position: 'absolute', right: -6, top: 140, width: 3, height: 60, background: '#333', borderRadius: '0 3px 3px 0' }} />

                {/* Photo Area */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={HERO_PHOTOS[0]} alt="Bride" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Gradient Overlay */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />
                  {/* Heart Icon top right */}
                  <div style={{ position: 'absolute', top: 50, right: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Heart size={18} color="#C8482E" fill="#C8482E" />
                  </div>
                </div>
                
                {/* Bottom Bar */}
                <div style={{ padding: '16px 20px 24px', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Heart size={18} color="#C8482E" />
                      <div>
                         <div style={{ fontSize: 16, fontWeight: 700, color: '#F2EDE4', lineHeight: 1 }}>24</div>
                         <div style={{ fontSize: 11, color: '#A09890', lineHeight: 1, marginTop: 4 }}>Favorites</div>
                      </div>
                   </div>
                   <div style={{ padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #DF5438, #C8482E)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(223,84,56,0.3)' }}>
                      <Download size={14} color="#fff" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Download</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Text */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            style={{ flex: 1, maxWidth: isMobile ? '100%' : 520 }}
          >
            <motion.div variants={fade} style={{
              display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12,
              color: '#C8482E', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 20, padding: '5px 12px', borderRadius: 99,
              background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)',
            }}>
              <Smartphone size={13} /> Conçue pour les clients
            </motion.div>

            <motion.h2 variants={fade} style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1, color: '#F2EDE4' }}>
              Une expérience galerie que vos clients <span style={{ color: '#C8482E' }}>vont adorer.</span>
            </motion.h2>

            <motion.p variants={fade} style={{ fontSize: 17, color: '#787068', lineHeight: 1.7, marginBottom: 36 }}>
              Épurée. Élégante. Mobile-first. Vos clients peuvent parcourir, mettre en favoris et télécharger leurs photos avec une facilité déconcertante.
            </motion.p>

            <motion.div variants={fade} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {CLIENT_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,107,53,0.09)', border: '1px solid rgba(255,107,53,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="#C8482E" />
                  </div>
                  <span style={{ fontSize: 15, color: '#A09890', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fade}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '12px 24px', borderRadius: 12,
                background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)',
                fontSize: 15, fontWeight: 600, color: '#C8482E', textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,107,53,0.15)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,107,53,0.1)'
                }}
              >
                Créer ma première galerie <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="workflow" style={{ padding: isMobile ? '80px 20px' : '120px 40px', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} style={{ textAlign: 'center', marginBottom: 70 }}>
              <div style={{ fontSize: 12, color: '#C8482E', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Workflow Intuitif</div>
              <h2 className="font-title" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4' }}>Simple, Fluide, Instantané</h2>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  variants={fade}
                  style={{ display: 'flex', gap: 24, padding: '36px 0', borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'flex-start' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#C8482E', minWidth: 44, height: 44, borderRadius: '50%', background: 'rgba(255,107,53,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,107,53,0.18)', flexShrink: 0 }}>
                    {s.n}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10, color: '#F2EDE4' }}>{s.label}</div>
                    <div style={{ color: '#787068', fontSize: 16, lineHeight: 1.65 }}>{s.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section style={{ padding: isMobile ? '60px 20px' : '90px 40px', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: isMobile ? 32 : 0 }}>
          {[
            { value: 1200, suffix: '+', label: 'Photographes actifs' },
            { value: 15000, suffix: '+', label: 'Galeries livrées' },
            { value: 99, suffix: '%', label: 'Satisfaction client' },
            { value: 0, suffix: '€', label: 'Sans carte bancaire' },
          ].map(({ value, suffix, label }, i) => (
            <div key={label} style={{ textAlign: 'center', padding: isMobile ? 0 : '0 20px', borderRight: !isMobile && i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: isMobile ? 40 : 52, fontWeight: 800, color: '#C8482E', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value === 0 ? '0€' : <CountUp target={value} suffix={suffix} />}
              </div>
              <div style={{ fontSize: 14, color: '#787068', marginTop: 10, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHATSAPP CTA ===== */}
      <section id="whatsapp" style={{ padding: isMobile ? '80px 20px' : '120px 40px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,211,102,0.04) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(60px)' }} />

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <motion.div variants={fade} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 99, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', marginBottom: 28, fontSize: 13, color: '#25D366', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Smartphone size={14} /> Notification Client Immédiate
          </motion.div>
          <motion.h2 variants={fade} style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 28, lineHeight: 1.1, color: '#F2EDE4' }}>
            Vos clients accèdent à leur galerie{' '}
            <span style={{ color: '#25D366' }}>directement sur WhatsApp.</span>
          </motion.h2>
          <motion.p variants={fade} style={{ color: '#787068', fontSize: 18, lineHeight: 1.7, marginBottom: 48, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>
            Oubliez les transferts lourds et les emails perdus dans les spams. Fotia envoie un lien ultra-léger et interactif qui s&apos;ouvre parfaitement sur mobile en une seconde.
          </motion.p>
          <motion.div variants={fade}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 36px', borderRadius: 14, textDecoration: 'none',
              fontSize: 17, fontWeight: 700,
              background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)',
              color: '#fff', boxShadow: '0 8px 32px rgba(255,107,53,0.4)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 44px rgba(255,107,53,0.55)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(255,107,53,0.4)'
              }}
            >
              Créer mon espace gratuit <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" style={{ padding: isMobile ? '80px 20px' : '140px 40px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(80px)' }} />

        <div style={{ maxWidth: 1020, margin: '0 auto', position: 'relative' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} style={{ textAlign: 'center', marginBottom: 80 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 99, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', marginBottom: 24, fontSize: 12, color: '#C8482E', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Tarifs
              </div>
              <h2 className="font-title" style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, color: '#F2EDE4' }}>
                Simple. Clair. <span style={{ color: '#C8482E' }}>Sans surprise.</span>
              </h2>
              <p style={{ fontSize: 18, color: '#787068', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
                Commencez à livrer des galeries professionnelles à vos clients dès aujourd&apos;hui.
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28, alignItems: 'stretch' }}>

              {/* ESSENTIEL */}
              <motion.div
                variants={fade}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
                style={{
                  padding: '44px 40px', borderRadius: 24,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: '#111',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#787068', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Essentiel</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 58, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.04em', lineHeight: 1 }}>0€</span>
                    <span style={{ fontSize: 16, color: '#787068', marginBottom: 10 }}>/ gratuit à vie</span>
                  </div>
                  <p style={{ fontSize: 15, color: '#787068', lineHeight: 1.55 }}>Pour démarrer et tester Fotia sans engagement.</p>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 28 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36, flex: 1 }}>
                  {[
                    '3 galeries actives simultanément',
                    '100 photos par galerie',
                    '5 GB de stockage sécurisé',
                    'Partage WhatsApp optimisé',
                    'Sélection des favoris en direct ❤️',
                    'Hébergement sécurisé inclus',
                  ].map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <CheckCircle size={11} color="#555" />
                      </div>
                      <span style={{ fontSize: 15, color: '#A09890', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/signup"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '15px 24px', borderRadius: 14,
                    textDecoration: 'none', fontWeight: 600, fontSize: 16,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#F2EDE4', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)'
                  }}
                >
                  Commencer gratuitement
                </Link>
              </motion.div>

              {/* PREMIUM PRO */}
              <motion.div
                variants={fade}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
                style={{
                  padding: '52px 44px', borderRadius: 24,
                  border: '1.5px solid rgba(255,107,53,0.4)',
                  background: 'linear-gradient(155deg, rgba(255,107,53,0.07) 0%, #111 45%)',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                  boxShadow: '0 32px 80px rgba(255,107,53,0.12)',
                }}
              >
                <div style={{
                  position: 'absolute', top: -17, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  padding: '6px 22px', borderRadius: 99,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  boxShadow: '0 6px 20px rgba(255,107,53,0.45)',
                  whiteSpace: 'nowrap',
                }}>
                  ⭐ Recommandé
                </div>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 180,
                  borderRadius: '24px 24px 0 0',
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,53,0.10) 0%, transparent 75%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ marginBottom: 32, position: 'relative' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#DF5438', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Premium Pro</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 58, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.04em', lineHeight: 1 }}>9€</span>
                    <span style={{ fontSize: 16, color: '#787068', marginBottom: 10 }}>/ mois</span>
                  </div>
                  <p style={{ fontSize: 15, color: '#A09890', lineHeight: 1.55 }}>
                    Pour impressionner vos clients à chaque livraison.
                  </p>
                </div>

                <div style={{ height: 1, background: 'rgba(255,107,53,0.18)', marginBottom: 28 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36, flex: 1, position: 'relative' }}>
                  {[
                    'Galeries illimitées',
                    '1 000 photos par galerie',
                    '100 GB de stockage optimisé',
                    'Téléchargement HD',
                    'Filigrane personnalisé',
                    'Profil photographe sur les galeries',
                    'Statistiques clients en temps réel',
                  ].map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(255,107,53,0.13)', border: '1px solid rgba(255,107,53,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <CheckCircle size={11} color="#C8482E" />
                      </div>
                      <span style={{ fontSize: 15, color: '#F2EDE4', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/signup"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '17px 28px', borderRadius: 14,
                    textDecoration: 'none', fontWeight: 700, fontSize: 17,
                    background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)',
                    color: '#fff', boxShadow: '0 8px 32px rgba(255,107,53,0.42)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                    ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 44px rgba(255,107,53,0.58)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(255,107,53,0.42)'
                  }}
                >
                  Devenir Premium Pro <ArrowRight size={18} />
                </Link>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#787068', marginTop: 14 }}>
                  Sans engagement · Annulable à tout moment
                </p>
              </motion.div>
            </div>

            <motion.p variants={fade} style={{ textAlign: 'center', marginTop: 56, fontSize: 15, color: '#787068', lineHeight: 1.6 }}>
              Des questions ? <a href="https://wa.me/79962131741" target="_blank" rel="noopener noreferrer" style={{ color: '#C8482E', textDecoration: 'none', fontWeight: 600 }}>Contactez-nous sur WhatsApp</a> — on répond en moins d&apos;une heure.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA BANNER ===== */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,107,53,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: 1100, margin: '0 auto',
            background: 'linear-gradient(135deg, #111 0%, #0f0f0f 100%)',
            border: '1px solid rgba(255,107,53,0.18)',
            borderRadius: 28, padding: isMobile ? '48px 28px' : '64px 80px',
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center', justifyContent: 'space-between', gap: 36,
            boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, borderRadius: '28px 28px 0 0', background: 'radial-gradient(ellipse at 30% 0%, rgba(255,107,53,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={22} color="#C8482E" />
              </div>
              <span style={{ fontSize: 14, color: '#C8482E', fontWeight: 600 }}>Démarrez en 2 minutes</span>
            </div>
            <h2 className="font-title" style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4', marginBottom: 12, lineHeight: 1.15 }}>
              Prêt à livrer vos photos magnifiquement ?
            </h2>
            <p style={{ fontSize: 16, color: '#787068', lineHeight: 1.65 }}>
              Rejoignez des milliers de photographes qui utilisent Fotia pour impressionner leurs clients.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '18px 40px', borderRadius: 14, textDecoration: 'none',
              fontSize: 17, fontWeight: 700, whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)',
              color: '#fff', boxShadow: '0 8px 32px rgba(255,107,53,0.45)',
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px) scale(1.02)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 16px 48px rgba(255,107,53,0.6)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0) scale(1)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(255,107,53,0.45)'
              }}
            >
              Commencer Gratuitement <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: '60px 40px 36px', borderTop: '1px solid rgba(255,255,255,0.04)', background: '#15171A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 40, marginBottom: 52 }}>
            {/* Brand */}
            <div style={{ maxWidth: 300 }}>
              <img src="/logo.png" alt="Fotia Logo" width={90} style={{ objectFit: 'contain', filter: 'brightness(1.05)', marginBottom: 16 }} />
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65 }}>
                La plateforme de livraison de galeries photo pour les photographes professionnels en Afrique.
              </p>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: isMobile ? 32 : 64, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Produit</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {NAV_LINKS.map(l => (
                    <a key={l.label} href={l.href} style={{ fontSize: 14, color: '#787068', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#F2EDE4'}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#787068'}
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Légal</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link href="/privacy" style={{ fontSize: 14, color: '#787068', textDecoration: 'none' }}>Confidentialité</Link>
                  <Link href="/terms" style={{ fontSize: 14, color: '#787068', textDecoration: 'none' }}>Conditions</Link>
                  <a href="https://wa.me/79962131741" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#C8482E', textDecoration: 'none', fontWeight: 500 }}>Support WhatsApp</a>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 28 }} />

          {/* Bottom */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 20 }}>
            <span style={{ color: '#444', fontSize: 14 }}>© 2026 Fotia. Tous droits réservés.</span>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { Icon: Globe, href: '#', label: 'Site' },
                { Icon: Mail, href: 'https://wa.me/79962131741', label: 'Contact' },
                { Icon: Share2, href: '#', label: 'Partager' },
              ].map(({ Icon, href, label }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  title={label}
                  style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,107,53,0.1)'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,107,53,0.25)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#C8482E'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#555'
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#444', fontWeight: 500 }}>
              <Zap size={13} color="#C8482E" /> Fait en Afrique, pour le monde
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
