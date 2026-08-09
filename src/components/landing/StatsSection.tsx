'use client'
import { useState, useEffect, useRef } from 'react'
import { m, useInView } from 'framer-motion'
import { fadeUp } from '@/lib/animations'
import { STATS } from './landing-data'

interface StatsSectionProps {
  isMobile: boolean
}

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

export default function StatsSection({ isMobile }: StatsSectionProps) {
  return (
    <section className="cv-section" style={{ padding: isMobile ? '60px 20px' : '90px 40px', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <m.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: '#C8482E', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Chiffres clés</div>
          <h2 className="font-title" style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#F2EDE4', marginBottom: 12 }}>
            Des résultats <span style={{ color: '#C8482E' }}>concrets</span>
          </h2>
          {/* Date alignée sur SITE_DATE_MODIFIED (2026-08-07) — à mettre à jour ensemble */}
          <p style={{ color: '#A09890', fontSize: 15, maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
            Les chiffres de la communauté Fotia, mis à jour en août 2026.
          </p>
        </m.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 12 : 0 }}>
          {STATS.map(({ value, suffix, label }, i) => (
            <div key={label as string} style={{ textAlign: 'center', padding: isMobile ? 0 : '0 20px', borderRight: !isMobile && i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: isMobile ? 40 : 52, fontWeight: 800, color: '#C8482E', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value === 0 ? '0€' : <CountUp target={value} suffix={suffix} />}
              </div>
              <div style={{ fontSize: 14, color: '#A09890', marginTop: 10, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
