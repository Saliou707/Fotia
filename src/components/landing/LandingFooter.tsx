'use client'
import Link from 'next/link'
import Image from 'next/image'
import { NAV_LINKS } from './landing-data'

interface LandingFooterProps {
  isMobile: boolean
}

export default function LandingFooter({ isMobile }: LandingFooterProps) {
  return (
    <footer style={{ padding: '60px 40px 36px', borderTop: '1px solid rgba(255,255,255,0.04)', background: '#15171A' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 40, marginBottom: 52 }}>
          <div style={{ maxWidth: 300 }}>
            <Image src="/logo.png" alt="Fotia Logo" width={90} height={30} priority style={{ width: 'auto', height: 'auto', objectFit: 'contain', filter: 'brightness(1.05)', marginBottom: 16 }} />
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65 }}>La plateforme de livraison de galeries photos pour photographes professionnels.</p>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 32 : 64, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Produit</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {NAV_LINKS.map(link => (
                  <a key={link.label} href={link.href} style={{ fontSize: 14, color: '#A09890', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#F2EDE4'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#A09890'}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Légal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/privacy" style={{ fontSize: 14, color: '#A09890', textDecoration: 'none' }}>Confidentialité</Link>
                <Link href="/terms" style={{ fontSize: 14, color: '#A09890', textDecoration: 'none' }}>Conditions d&apos;utilisation</Link>
                <a href="https://wa.me/79962131741" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#C8482E', textDecoration: 'none', fontWeight: 500 }}>Support WhatsApp</a>
                <a href="mailto:support@myfotia.com" style={{ fontSize: 14, color: '#A09890', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#F2EDE4'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#A09890'}
                >
                  Support Email
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 28 }} />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ color: '#444', fontSize: 14, textAlign: 'center' }}>© 2026 Fotia. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  )
}
