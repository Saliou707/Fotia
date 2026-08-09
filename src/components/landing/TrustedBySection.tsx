'use client'
import { m } from 'framer-motion'
import { TRUSTED_BY } from './landing-data'

interface TrustedBySectionProps {
  isMobile: boolean
}

export default function TrustedBySection({ isMobile }: TrustedBySectionProps) {
  return (
    <section className="cv-section" style={{ padding: isMobile ? '36px 20px 44px' : '44px 32px 56px', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#080808', overflow: 'hidden' }}>
      <m.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06))' }} />
          <span style={{ fontSize: 10, color: '#444', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Ils nous font confiance</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.06))' }} />
        </div>
        <div style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
          {TRUSTED_BY.map(({ name, style: fontStyle }, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
              <m.div
                initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                style={{
                  fontSize: isMobile ? 14 : 17,
                  fontFamily: fontStyle === 'italic' ? 'var(--font-playfair, "Playfair Display", Georgia, serif)' : 'var(--font-inter, "Inter", "Helvetica Neue", sans-serif)',
                  fontStyle: fontStyle === 'italic' ? 'italic' : 'normal',
                  fontWeight: fontStyle === 'italic' ? 500 : 600,
                  color: '#4a4a4a', letterSpacing: fontStyle === 'italic' ? '0.01em' : '0.08em',
                  textTransform: fontStyle === 'italic' ? 'none' : 'uppercase',
                  whiteSpace: 'nowrap', padding: isMobile ? '6px 14px' : '0 28px',
                  transition: 'color 0.25s ease', cursor: 'default',
                }}
                whileHover={{ color: '#888' }}
              >
                {name}
              </m.div>
              {i < TRUSTED_BY.length - 1 && (
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#2a2a2a', flexShrink: 0, display: isMobile && i % 2 === 1 ? 'none' : 'block' }} />
              )}
            </div>
          ))}
        </div>
      </m.div>
    </section>
  )
}
