'use client'
import Link from 'next/link'
import { m } from 'framer-motion'
import { Smartphone, ArrowRight } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'

interface WhatsAppCtaSectionProps {
  isMobile: boolean
}

const fade = fadeUp

export default function WhatsAppCtaSection({ isMobile }: WhatsAppCtaSectionProps) {
  return (
    <section id="whatsapp" className="cv-section" style={{ padding: isMobile ? '80px 20px' : '120px 40px', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,211,102,0.04) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(60px)' }} />
      <m.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <m.div variants={fade} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 99, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', marginBottom: 28, fontSize: 13, color: '#25D366', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Smartphone size={14} /> WhatsApp Natif
        </m.div>
        <m.h2 variants={fade} style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 28, lineHeight: 1.1, color: '#F2EDE4' }}>
          Partagez{' '}<span style={{ color: '#25D366' }}>via WhatsApp</span>
        </m.h2>
        <m.p variants={fade} style={{ color: '#A09890', fontSize: 18, lineHeight: 1.7, marginBottom: 48, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>
          Envoyez un lien WhatsApp à vos clients. Ils ouvrent la galerie directement, sans télécharger d’application. Simple, rapide, professionnel.
        </m.p>
        <m.div variants={fade}>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 14, textDecoration: 'none', fontSize: 17, fontWeight: 700, background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)', color: '#fff', boxShadow: '0 8px 32px rgba(223,84,56,0.4)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 44px rgba(223,84,56,0.55)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(223,84,56,0.4)' }}
          >
            Créer ma première galerie <ArrowRight size={18} />
          </Link>
        </m.div>
      </m.div>
    </section>
  )
}
