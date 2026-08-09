'use client'
import Link from 'next/link'
import { m } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { stepContainer, stepItem } from './landing-data'

interface PricingSectionProps {
  isMobile: boolean
}

const fade = fadeUp

const ESSENTIEL_FEATURES = ['3 galeries actives', '50 photos par galerie', 'Lien de partage WhatsApp', 'Sélection de favoris']
const PRO_FEATURES = ['Galeries illimitées', '500 photos par galerie', 'Domaine personnalisé', 'Statistiques avancées', 'Support prioritaire', 'Téléchargement rapide']

export default function PricingSection({ isMobile }: PricingSectionProps) {
  return (
    <section id="pricing" className="cv-section" style={{ padding: isMobile ? '80px 20px' : '140px 40px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,84,56,0.05) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(80px)' }} />
      <div style={{ maxWidth: 1020, margin: '0 auto', position: 'relative' }}>
        <m.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <m.div variants={fade} style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 99, background: 'rgba(223,84,56,0.08)', border: '1px solid rgba(223,84,56,0.2)', marginBottom: 24, fontSize: 12, color: '#C8482E', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Tarifs
            </div>
            <h2 className="font-title" style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, color: '#F2EDE4' }}>
              Simple et <span style={{ color: '#C8482E' }}>transparent</span>
            </h2>
            <p style={{ fontSize: 18, color: '#A09890', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
              Commencez gratuitement, passez au Pro quand vous êtes prêt.
            </p>
          </m.div>

          {/* Le parent (stagger) pilote l'apparition ; le container répartit le delay entre les cartes */}
          <m.div variants={stepContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28, alignItems: 'stretch' }}>
            {/* ESSENTIEL */}
            <m.div
              variants={stepItem}
              whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
              style={{ padding: '44px 40px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.07)', background: '#111', display: 'flex', flexDirection: 'column', transition: 'border-color 0.25s ease, boxShadow 0.25s ease, background 0.25s ease' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(223,84,56,0.3)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(223,84,56,0.04)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(223,84,56,0.1)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLDivElement).style.background = '#111'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
              }}
            >
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#A09890', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Essentiel</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 58, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.04em', lineHeight: 1 }}>0€</span>
                  <span style={{ fontSize: 16, color: '#A09890', marginBottom: 10 }}>/mois</span>
                </div>
                <p style={{ fontSize: 15, color: '#A09890', lineHeight: 1.55 }}>Parfait pour découvrir Fotia et livrer vos premières galeries.</p>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 28 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36, flex: 1 }}>
                {ESSENTIEL_FEATURES.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <CheckCircle size={11} color="#555" />
                    </div>
                    <span style={{ fontSize: 15, color: '#A09890', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px 24px', borderRadius: 14, textDecoration: 'none', fontWeight: 600, fontSize: 16, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
              >
                Créer mon compte gratuit
              </Link>
            </m.div>

            {/* PREMIUM PRO */}
            <m.div
              variants={stepItem}
              whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
              style={{ padding: '52px 44px', borderRadius: 24, border: '1.5px solid rgba(223,84,56,0.4)', background: 'linear-gradient(155deg, rgba(223,84,56,0.07) 0%, #111 45%)', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 32px 80px rgba(223,84,56,0.12)', transition: 'border-color 0.25s ease, boxShadow 0.25s ease' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(223,84,56,0.75)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 40px 100px rgba(223,84,56,0.22)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(223,84,56,0.4)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 32px 80px rgba(223,84,56,0.12)'
              }}
            >
              <div style={{ position: 'absolute', top: -17, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 22px', borderRadius: 99, letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 6px 20px rgba(223,84,56,0.45)', whiteSpace: 'nowrap' }}>
                Recommandé
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180, borderRadius: '24px 24px 0 0', background: 'radial-gradient(ellipse at 50% 0%, rgba(223,84,56,0.10) 0%, transparent 75%)', pointerEvents: 'none' }} />
              <div style={{ marginBottom: 32, position: 'relative' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#DF5438', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Premium Pro</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 58, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.04em', lineHeight: 1 }}>15€</span>
                  <span style={{ fontSize: 16, color: '#A09890', marginBottom: 10 }}>/mois</span>
                </div>
                <p style={{ fontSize: 15, color: '#A09890', lineHeight: 1.55 }}>Pour les photographes professionnels qui veulent le meilleur.</p>
              </div>
              <div style={{ height: 1, background: 'rgba(223,84,56,0.18)', marginBottom: 28 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36, flex: 1, position: 'relative' }}>
                {PRO_FEATURES.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(223,84,56,0.13)', border: '1px solid rgba(223,84,56,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <CheckCircle size={11} color="#C8482E" />
                    </div>
                    <span style={{ fontSize: 15, color: '#F2EDE4', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '17px 28px', borderRadius: 14, textDecoration: 'none', fontWeight: 700, fontSize: 17, background: 'linear-gradient(135deg, #DF5438 0%, #C8482E 100%)', color: '#fff', boxShadow: '0 8px 32px rgba(223,84,56,0.42)', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 44px rgba(223,84,56,0.58)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(223,84,56,0.42)' }}
              >
                Essayer Premium Pro <ArrowRight size={18} />
              </Link>

            </m.div>
          </m.div>

          <m.p variants={fade} style={{ textAlign: 'center', marginTop: 56, fontSize: 15, color: '#A09890', lineHeight: 1.6 }}>
            Des questions ? <a href="https://wa.me/79962131741" target="_blank" rel="noopener noreferrer" style={{ color: '#C8482E', textDecoration: 'none', fontWeight: 600 }}>Contactez-nous sur WhatsApp</a>.
          </m.p>
        </m.div>
      </div>
    </section>
  )
}
