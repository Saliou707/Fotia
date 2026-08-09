'use client'
import Link from 'next/link'
import { m } from 'framer-motion'
import { Camera, ArrowRight } from 'lucide-react'
import { STATS } from './landing-data'

interface FinalCtaSectionProps {
  isMobile: boolean
}

export default function FinalCtaSection({ isMobile }: FinalCtaSectionProps) {
  return (
    <section className="cv-section" style={{ padding: isMobile ? '60px 20px' : '80px 40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(223,84,56,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <m.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: 1100, margin: '0 auto',
          background: 'linear-gradient(135deg, #111 0%, #0f0f0f 100%)',
          border: '1px solid rgba(223,84,56,0.18)', borderRadius: 28,
          padding: isMobile ? '48px 28px' : '64px 80px',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', justifyContent: 'space-between', gap: 36,
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)', position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, borderRadius: '28px 28px 0 0', background: 'radial-gradient(ellipse at 30% 0%, rgba(223,84,56,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(223,84,56,0.12)', border: '1px solid rgba(223,84,56,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={22} color="#C8482E" />
            </div>
            <span style={{ fontSize: 14, color: '#C8482E', fontWeight: 600 }}>Pour les photographes</span>
          </div>
          <h2 className="font-title" style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4', marginBottom: 12, lineHeight: 1.15 }}>
            Prêt à impressionner vos clients ?
          </h2>
          <p style={{ fontSize: 16, color: '#A09890', lineHeight: 1.65 }}>
            Rejoignez plus de {STATS[0].value.toLocaleString('fr-FR')} photographes qui font confiance à Fotia pour livrer leurs galeries.
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '18px 40px', borderRadius: 14, textDecoration: 'none', fontSize: 17, fontWeight: 700, whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)', color: '#fff', boxShadow: '0 8px 32px rgba(223,84,56,0.45)', transition: 'all 0.25s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px) scale(1.02)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 16px 48px rgba(223,84,56,0.6)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0) scale(1)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(223,84,56,0.45)' }}
          >
            Créer mon compte <ArrowRight size={18} />
          </Link>
        </div>
      </m.div>
    </section>
  )
}
