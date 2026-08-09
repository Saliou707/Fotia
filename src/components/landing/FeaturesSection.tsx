'use client'
import { m } from 'framer-motion'
import { fadeUp, stagger } from '@/lib/animations'
import { FEATURES, stepContainer, stepItem } from './landing-data'

interface FeaturesSectionProps {
  isMobile: boolean
}

const fade = fadeUp

export default function FeaturesSection({ isMobile }: FeaturesSectionProps) {
  return (
    <section id="features" className="cv-section" style={{ padding: isMobile ? '80px 20px 60px' : '120px 40px 100px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,84,56,0.04) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(60px)' }} />
      <m.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <m.div variants={fade} style={{ textAlign: 'center', marginBottom: 72 }}>
          <h2 className="font-title" style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, color: '#F2EDE4' }}>
            Tout ce dont vous avez{' '}
            <span style={{ color: '#C8482E' }}>besoin</span>
          </h2>
          <p style={{ fontSize: 18, color: '#A09890', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            Une suite complète d’outils pour gérer vos galeries, partager vos photos et recevoir les sélections de vos clients.
          </p>
        </m.div>
        {/* Le parent (stagger) pilote l'apparition ; le container répartit le delay entre les cartes */}
        <m.div variants={stepContainer} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 20 }}>
          {FEATURES.map((f) => (
            <m.div
              key={f.title as string}
              variants={stepItem}
              whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
              style={{ padding: isMobile ? '24px 18px' : '36px 28px', borderRadius: 20, background: '#111', border: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.25s ease, border-color 0.25s ease, boxShadow 0.25s ease', cursor: 'default' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(223,84,56,0.04)'
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(223,84,56,0.3)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(223,84,56,0.12)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLDivElement).style.background = '#111'
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
              }}
            >
              <m.div
                style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(223,84,56,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid rgba(223,84,56,0.15)' }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(223,84,56,0.16)' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <f.icon size={22} color="#C8482E" />
              </m.div>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18, marginBottom: 10, color: '#F2EDE4' }}>{f.title}</div>
              <div style={{ color: '#A09890', fontSize: isMobile ? 13 : 15, lineHeight: 1.6 }}>{f.desc}</div>
            </m.div>
          ))}
        </m.div>
      </m.div>
    </section>
  )
}
