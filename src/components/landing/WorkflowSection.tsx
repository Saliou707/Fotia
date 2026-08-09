'use client'
import { m } from 'framer-motion'
import { fadeUp, stagger } from '@/lib/animations'
import { STEPS, stepContainer, stepItem } from './landing-data'

interface WorkflowSectionProps {
  isMobile: boolean
}

const fade = fadeUp

export default function WorkflowSection({ isMobile }: WorkflowSectionProps) {
  return (
    <section id="workflow" className="cv-section" style={{ padding: isMobile ? '80px 20px' : '120px 40px', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <m.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <m.div variants={fade} style={{ textAlign: 'center', marginBottom: 70 }}>
            <div style={{ fontSize: 12, color: '#C8482E', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Comment ça marche</div>
            <h2 className="font-title" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4' }}>En 4 étapes simples</h2>
          </m.div>
          {/* Le parent (stagger) pilote l'apparition ; stepContainer ne fait que répartir le delay entre les étapes */}
          <m.div variants={stepContainer} style={{ display: 'flex', flexDirection: 'column' }}>
            {STEPS.map((s, i) => (
              <m.div
                key={s.n}
                variants={stepItem}
                whileHover={{ x: 6, transition: { duration: 0.2, ease: 'easeOut' } }}
                style={{ display: 'flex', gap: 24, padding: '36px 20px', margin: '0 -20px', borderRadius: 16, borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'flex-start', cursor: 'default', transition: 'background 0.25s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(223,84,56,0.05)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <m.div
                  style={{ fontSize: 14, fontWeight: 800, color: '#C8482E', minWidth: 44, height: 44, borderRadius: '50%', background: 'rgba(223,84,56,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(223,84,56,0.18)', flexShrink: 0 }}
                  whileHover={{ scale: 1.12, rotate: -4, borderColor: 'rgba(223,84,56,0.5)', boxShadow: '0 6px 20px rgba(223,84,56,0.25)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >{s.n}</m.div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10, color: '#F2EDE4' }}>{s.label}</div>
                  <div style={{ color: '#A09890', fontSize: 16, lineHeight: 1.65 }}>{s.sub}</div>
                </div>
              </m.div>
            ))}
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
