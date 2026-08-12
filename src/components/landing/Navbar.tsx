'use client'
import Link from 'next/link'
import Image from 'next/image'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowRight, Menu, X, Camera } from 'lucide-react'

interface NavbarProps {
  scrolled: boolean
  isMobile?: boolean
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
  navLinks: { label: string; href: string }[]
}

export default function Navbar({ scrolled, menuOpen, setMenuOpen, navLinks }: NavbarProps) {
  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(8,8,8,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(223,84,56,0.15)' : '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
        }}
        className="fotia-navbar"
      >
        <div className="fotia-navbar-container">
          {/* LOGO */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: 16,
                  background: 'radial-gradient(ellipse, rgba(223,84,56,0.2) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                  pointerEvents: 'none',
                }}
              />
              <Image
                src="/logo.png"
                alt="Fotia Logo"
                width={400}
                height={267}
                priority
                style={{
                  height: 28,
                  width: 'auto',
                  objectFit: 'contain',
                  position: 'relative',
                  filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(223,84,56,0.4))',
                }}
              />
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="fotia-nav-desktop-links">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="fotia-nav-link"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* LOGIN LINK (Desktop only) */}
            <Link
              href="/login"
              className="fotia-nav-login-link"
            >
              Connexion
            </Link>

            {/* SIGNUP CTA BUTTON */}
            <Link
              href="/signup"
              className="fotia-nav-signup-btn"
            >
              <Camera size={14} className="fotia-nav-camera-icon" />
              <span className="fotia-signup-text-desktop">Commencer gratuitement</span>
              <span className="fotia-signup-text-mobile">S&apos;inscrire</span>
            </Link>

            {/* HAMBURGER TOGGLE BUTTON (Mobile only) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="fotia-nav-hamburger-btn"
              aria-label="Menu principal"
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <m.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <X size={20} />
                  </m.span>
                ) : (
                  <m.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Menu size={20} />
                  </m.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER & BACKDROP */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fotia-mobile-backdrop"
            />

            {/* Menu Drawer */}
            <m.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fotia-mobile-menu-drawer"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {navLinks.map((link, i) => (
                  <m.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="fotia-mobile-nav-item"
                  >
                    {link.label}
                    <ArrowRight size={14} color="#C8482E" />
                  </m.a>
                ))}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="fotia-mobile-drawer-login"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="fotia-mobile-drawer-signup"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* STYLES RESPONSIVES PURS */}
      <style>{`
        .fotia-navbar {
          padding: 12px 28px;
        }
        .fotia-navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .fotia-nav-desktop-links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }
        .fotia-nav-link {
          color: #A09890;
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 10px;
          transition: all 0.2s ease;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .fotia-nav-link:hover {
          color: #F2EDE4;
          background: rgba(255,255,255,0.05);
        }
        .fotia-nav-login-link {
          color: #A09890;
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 10px;
          transition: color 0.2s;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
        }
        .fotia-nav-login-link:hover {
          color: #F2EDE4;
        }
        .fotia-nav-signup-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 20px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14.5px;
          font-weight: 600;
          background: linear-gradient(135deg, #DF5438 0%, #C8482E 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(223,84,56,0.35);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .fotia-nav-signup-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(223,84,56,0.5);
        }
        .fotia-signup-text-mobile { display: none; }
        .fotia-signup-text-desktop { display: inline; }
        .fotia-nav-camera-icon { display: inline; }

        .fotia-nav-hamburger-btn {
          display: none;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          width: 38px;
          height: 38px;
          color: #F2EDE4;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fotia-mobile-backdrop {
          display: none;
        }
        .fotia-mobile-menu-drawer {
          display: none;
        }

        @media (max-width: 768px) {
          .fotia-navbar {
            padding: 10px 14px;
          }
          .fotia-nav-desktop-links {
            display: none !important;
          }
          .fotia-nav-login-link {
            display: none !important;
          }
          .fotia-signup-text-desktop {
            display: none !important;
          }
          .fotia-nav-camera-icon {
            display: none !important;
          }
          .fotia-signup-text-mobile {
            display: inline !important;
          }
          .fotia-nav-signup-btn {
            padding: 7px 12px !important;
            font-size: 13px !important;
            border-radius: 10px !important;
          }
          .fotia-nav-hamburger-btn {
            display: flex !important;
          }

          .fotia-mobile-backdrop {
            display: block !important;
            position: fixed;
            inset: 0;
            z-index: 998;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
          }
          .fotia-mobile-menu-drawer {
            display: block !important;
            position: fixed;
            top: 60px;
            left: 12px;
            right: 12px;
            z-index: 999;
            border-radius: 20px;
            background: rgba(18, 18, 18, 0.98);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px 20px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
          }
          .fotia-mobile-nav-item {
            color: #F2EDE4;
            font-size: 15px;
            font-weight: 500;
            text-decoration: none;
            padding: 12px 14px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255,255,255,0.02);
          }
          .fotia-mobile-drawer-login {
            text-align: center;
            padding: 12px;
            border-radius: 12px;
            text-decoration: none;
            color: #A09890;
            font-size: 14.5px;
            font-weight: 500;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(255,255,255,0.03);
          }
          .fotia-mobile-drawer-signup {
            text-align: center;
            padding: 13px;
            border-radius: 12px;
            text-decoration: none;
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            background: linear-gradient(135deg, #DF5438 0%, #C8482E 100%);
            box-shadow: 0 4px 16px rgba(223,84,56,0.35);
          }
        }
      `}</style>
    </>
  )
}

