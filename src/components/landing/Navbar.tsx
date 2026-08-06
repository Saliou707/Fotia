'use client'
import Link from 'next/link'
import Image from 'next/image'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowRight, Menu, X, Camera } from 'lucide-react'

interface NavbarProps {
  scrolled: boolean
  isMobile: boolean
  isDesktop: boolean
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
  navLinks: { label: string; href: string }[]
}

export default function Navbar({ scrolled, isMobile, isDesktop, menuOpen, setMenuOpen, navLinks }: NavbarProps) {
  return (
    <>
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
            <Image
              src="/logo.png" alt="Fotia Logo"
              width={isMobile ? 80 : 100}
              height={32}
              priority
              style={{ width: 'auto', height: 'auto', objectFit: 'contain', position: 'relative', filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(255,107,53,0.4))' }}
            />
          </div>
        </Link>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {navLinks.map((link) => (
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
            Commencer gratuitement
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
                  ? <m.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} /></m.span>
                  : <m.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={20} /></m.span>
                }
              </AnimatePresence>
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && isMobile && (
          <m.div
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
              {navLinks.map((link, i) => (
                <m.a
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
                </m.a>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '12px', borderRadius: 12, textDecoration: 'none', color: '#A09890', fontSize: 15, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)' }}>
                Connexion
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '13px', borderRadius: 12, textDecoration: 'none', color: '#fff', fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)', boxShadow: '0 4px 16px rgba(255,107,53,0.3)' }}>
                Commencer gratuitement
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
