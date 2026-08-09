'use client'
import { m } from 'framer-motion'
import { fadeUp, stagger } from '@/lib/animations'
import { FAQ_ITEMS, stepContainer, stepItem } from './landing-data'

interface FaqSectionProps {
  isMobile: boolean
}

const fade = fadeUp

export default function FaqSection({ isMobile }: FaqSectionProps) {
  return (
    <section id="faq" className="cv-section" style={{ padding: isMobile ? '80px 20px' : '110px 40px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <m.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ maxWidth: 780, margin: '0 auto' }}>
        <m.div variants={fade} style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: '#C8482E', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Questions fréquentes</div>
          <h2 className="font-title" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4' }}>
            Tout ce qu&apos;il faut <span style={{ color: '#C8482E' }}>savoir</span>
          </h2>
        </m.div>
        {/* Le parent (stagger) pilote l'apparition ; le container répartit le delay entre les questions */}
        <m.div variants={stepContainer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ_ITEMS.map(item => (
            <m.details
              key={item.q}
              variants={stepItem}
              style={{
                background: '#111',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'background 0.25s ease, border-color 0.25s ease, boxShadow 0.25s ease',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(223,84,56,0.04)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(223,84,56,0.3)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(223,84,56,0.08)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.background = '#111'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <summary
                style={{
                  padding: '18px 22px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#F2EDE4',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span style={{ flex: 1 }}>{item.q}</span>
                <span style={{ fontSize: 20, color: '#C8482E', lineHeight: 1, flexShrink: 0 }}>+</span>
              </summary>
              <div style={{ padding: '0 22px 20px', color: '#A09890', fontSize: 15, lineHeight: 1.7 }}>
                {item.a}
              </div>
            </m.details>
          ))}
        </m.div>
      </m.div>
      <style>{`
        .cv-section summary::-webkit-details-marker { display: none; }
      `}</style>
    </section>
  )
}
