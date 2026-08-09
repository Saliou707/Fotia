'use client'
import Image from 'next/image'
import { m } from 'framer-motion'
import { Heart, Download, Share2, Camera } from 'lucide-react'

const GRID_PHOTOS = [
  { src: '/media__1784566765630.webp', liked: true },
  { src: '/media__1784567428078.webp', liked: false },
  { src: '/media__1784567428152.webp', liked: true },
  { src: '/media__1784567428163.webp', liked: false },
  { src: '/concert_stage_photo_1784566103244.webp', liked: true },
  { src: '/corporate_gala_photo_1784566134178.webp', liked: false },
  { src: '/wedding_reception_photo_1784566087301.webp', liked: true },
  { src: '/nightclub_party_photo_1784566118666.webp', liked: false },
  { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop', liked: true },
]

export default function HeroPhoneMockupMobile() {
  return (
    <m.div
      className="hero-mockup-mobile"
      initial={{ y: 40, scale: 0.96 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative', paddingBottom: 16 }}
    >
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 60%, rgba(200,72,46,0.18) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{
          width: 240, height: 510, borderRadius: 46,
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 40%, #222 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: ['0 0 0 6px #1c1c1e', '0 0 0 7px rgba(255,255,255,0.08)', '0 30px 80px rgba(0,0,0,0.85)', '0 10px 40px rgba(200,72,46,0.12)', 'inset 0 1px 0 rgba(255,255,255,0.1)', 'inset 0 -1px 0 rgba(0,0,0,0.5)'].join(', '),
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', right: -3, top: '28%', width: 3, height: 60, borderRadius: '0 2px 2px 0', background: 'linear-gradient(to right, #2a2a2a, #1a1a1a)', zIndex: 40 }} />
          <div style={{ position: 'absolute', left: -3, top: '22%', width: 3, height: 36, borderRadius: '2px 0 0 2px', background: 'linear-gradient(to left, #2a2a2a, #1a1a1a)', zIndex: 40 }} />
          <div style={{ position: 'absolute', left: -3, top: '32%', width: 3, height: 36, borderRadius: '2px 0 0 2px', background: 'linear-gradient(to left, #2a2a2a, #1a1a1a)', zIndex: 40 }} />
          <div style={{ position: 'absolute', left: -3, top: '16%', width: 3, height: 22, borderRadius: '2px 0 0 2px', background: 'linear-gradient(to left, #3a3a3a, #2a2a2a)', zIndex: 40 }} />
          <div style={{ position: 'absolute', inset: 6, borderRadius: 42, background: '#0a0a0a', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 90, height: 26, borderRadius: 13, background: '#0a0a0a', zIndex: 30, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a1a1a' }} />
              <div style={{ width: 42, height: 16, borderRadius: 8, background: '#1a1a1a' }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, top: 0, background: '#0f0f0f', overflowY: 'hidden' }}>
              <div style={{ padding: '50px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,15,15,0.95)' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.01em' }}>Love in Accra</div>
                  <div style={{ fontSize: 9, color: '#555' }}>152 photos · Amara Studios</div>
                </div>
                <div style={{ padding: '4px 9px', background: 'rgba(255,255,255,0.05)', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Share2 size={8} color="#A09890" />
                  <span style={{ fontSize: 8.5, fontWeight: 600, color: '#A09890' }}>Partager</span>
                </div>
              </div>
              <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
                <Image src="/media__1784566765630.webp" alt="Galerie photo de mariage sur mobile avec l'application Fotia" fill sizes="220px" priority style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(15,15,15,0.9) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#DF5438,#C8482E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={9} color="#fff" />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#F2EDE4' }}>Amara Studios</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, padding: '8px 2px 2px' }}>
                {GRID_PHOTOS.map(({ src, liked }, i) => (
                  <div key={i} style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
                    <Image src={src} alt="" fill sizes="80px" style={{ objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', top: 3, right: 3, width: 16, height: 16, borderRadius: '50%', background: liked ? '#C8482E' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: liked ? 'none' : 'blur(4px)' }}>
                      <Heart size={8} color="#fff" fill={liked ? '#fff' : 'transparent'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 12px 16px', background: 'linear-gradient(to top, rgba(8,8,8,1) 55%, rgba(8,8,8,0.96) 75%, transparent 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Heart size={11} color="#C8482E" fill="#C8482E" />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#F2EDE4', lineHeight: 1 }}>24</div>
                  <div style={{ fontSize: 8, color: '#555', lineHeight: 1 }}>Favoris</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 18, background: 'linear-gradient(135deg, #DF5438, #C8482E)', boxShadow: '0 3px 12px rgba(223,84,56,0.5)' }}>
                <Download size={9} color="#fff" />
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff' }}>Télécharger</span>
              </div>
            </div>
          </div>
        </div>
      </m.div>
  )
}
