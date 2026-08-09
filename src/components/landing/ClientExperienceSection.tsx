'use client'
import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'
import { Share2, Heart, Download, Smartphone, ArrowRight } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/animations'
import { CLIENT_FEATURES } from './landing-data'
import { HERO_PHOTOS } from '@/lib/hero-photos'

interface ClientExperienceSectionProps {
  isMobile: boolean
}

const fade = fadeUp

const CLIENT_PHOTOS = [
  '/media__1784566765630.webp',
  '/media__1784567428078.webp',
  '/media__1784567428152.webp',
  '/media__1784567428163.webp',
  '/concert_stage_photo_1784566103244.webp',
  '/corporate_gala_photo_1784566134178.webp',
  '/wedding_reception_photo_1784566087301.webp',
  '/nightclub_party_photo_1784566118666.webp',
]

export default function ClientExperienceSection({ isMobile }: ClientExperienceSectionProps) {
  return (
    <section className="cv-section" style={{ padding: isMobile ? '80px 20px' : '120px 40px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 48 : 80 }}>
        <m.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', minHeight: isMobile ? 500 : 600 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,84,56,0.10) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          {!isMobile && (
            <div style={{ width: 250, height: 520, borderRadius: 42, background: '#0a0a0a', position: 'absolute', left: '10%', top: 30, boxShadow: '0 0 0 2px #333, 0 0 0 6px #151515, 0 20px 40px rgba(0,0,0,0.6)', transform: 'rotate(-5deg)', zIndex: 1 }}>
              <div style={{ width: '100%', height: '100%', background: '#0a0a0a', borderRadius: 40, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 70, height: 20, background: '#000', borderRadius: 10, zIndex: 20 }} />
                <div style={{ padding: '40px 14px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(10,10,10,0.95)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F2EDE4', marginBottom: 2 }}>Studio Session</div>
                    <div style={{ fontSize: 10, color: '#555' }}>58 photos</div>
                  </div>
                  <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Share2 size={10} color="#A09890" />
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#A09890' }}>Partager</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '0 6px', height: '100%', overflowY: 'hidden' }}>
                  {CLIENT_PHOTOS.map((src, i) => (
                    <div key={i} style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '1/1', background: '#1c1c1c', position: 'relative' }}>
                      <Image src={src} alt="" fill sizes="120px" style={{ objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div style={{ width: isMobile ? 260 : 280, height: isMobile ? 540 : 580, borderRadius: 44, background: '#0a0a0a', position: isMobile ? 'relative' : 'absolute', right: isMobile ? 'auto' : '5%', bottom: isMobile ? 'auto' : 0, boxShadow: '0 0 0 2px #444, 0 0 0 6px #1a1a1a, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05)', zIndex: 2 }}>
            <div style={{ width: '100%', height: '100%', background: '#0a0a0a', borderRadius: 42, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 80, height: 24, background: '#000', borderRadius: 12, zIndex: 20 }} />
              <div style={{ flex: 1, position: 'relative' }}>
                <Image src={HERO_PHOTOS[0]} alt="Photo de mariage en haute définition dans une galerie Fotia" fill sizes="280px" style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />
                <div style={{ position: 'absolute', top: 50, right: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={18} color="#C8482E" fill="#C8482E" />
                </div>
              </div>
              <div style={{ padding: '16px 20px 24px', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={18} color="#C8482E" />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#F2EDE4', lineHeight: 1 }}>24</div>
                    <div style={{ fontSize: 11, color: '#A09890', lineHeight: 1, marginTop: 4 }}>Favoris sélectionnés</div>
                  </div>
                </div>
                <div style={{ padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #DF5438, #C8482E)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(223,84,56,0.3)' }}>
                  <Download size={14} color="#fff" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Download</span>
                </div>
              </div>
            </div>
          </div>
        </m.div>

        {/* Right — Text */}
        <m.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ flex: 1, maxWidth: isMobile ? '100%' : 520 }}>
          <m.div variants={fade} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#C8482E', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20, padding: '5px 12px', borderRadius: 99, background: 'rgba(223,84,56,0.08)', border: '1px solid rgba(223,84,56,0.15)' }}>
            <Smartphone size={13} /> Expérience client
          </m.div>
          <m.h2 variants={fade} style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1, color: '#F2EDE4' }}>
            Votre client <span style={{ color: '#C8482E' }}>adore l&apos;expérience</span>
          </m.h2>
          <m.p variants={fade} style={{ fontSize: 17, color: '#A09890', lineHeight: 1.7, marginBottom: 36 }}>
            Vos clients reçoivent un lien WhatsApp, ouvrent la galerie sur leur téléphone et sélectionnent leurs photos préférées en quelques secondes.
          </m.p>
          <m.div variants={fade} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
            {CLIENT_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(223,84,56,0.09)', border: '1px solid rgba(223,84,56,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color="#C8482E" />
                </div>
                <span style={{ fontSize: 15, color: '#A09890', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </m.div>
          <m.div variants={fade}>
            <Link href="#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 24px', borderRadius: 12, background: 'rgba(223,84,56,0.1)', border: '1px solid rgba(223,84,56,0.3)', fontSize: 15, fontWeight: 600, color: '#C8482E', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(223,84,56,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(223,84,56,0.1)' }}
            >
              Découvrir les tarifs <ArrowRight size={16} />
            </Link>
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
