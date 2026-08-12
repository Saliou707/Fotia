'use client'
import Image from 'next/image'
import { m } from 'framer-motion'
import {
  MessageSquare, Heart, Download,
  Smartphone, Camera, Share2,
} from 'lucide-react'

interface HeroPhoneMockupDesktopProps {
  isDesktop: boolean
}

const GRID_PHOTOS = [
  { src: '/media__1784566765630.webp', liked: true },                                    // Mariage Banquet & Gâteau
  { src: '/media__1784567428078.webp', liked: false },                                   // Arche de fleurs & lumières
  { src: '/media__1784567428152.webp', liked: true },                                    // Fête Amis & Rires
  { src: '/media__1784567428163.webp', liked: false },                                   // Nightclub & DJ Selfie
  { src: '/concert_stage_photo_1784566103244.webp', liked: true },                       // Concert Live Lasers
  { src: '/corporate_gala_photo_1784566134178.webp', liked: false },                      // Gala Corporate
  { src: '/wedding_reception_photo_1784566087301.webp', liked: true },                    // Réception Mariage Luxe
  { src: '/nightclub_party_photo_1784566118666.webp', liked: false },                    // Party VIP Champagne
  { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop', liked: true },  // Portrait Événementiel
]

export default function HeroPhoneMockupDesktop({ isDesktop }: HeroPhoneMockupDesktopProps) {
  return (
    <m.div
      className="hero-mockup-desktop"
      initial={{ opacity: 0, x: 60, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 10, paddingTop: 40 }}
    >
        {isDesktop && (
          <m.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '8%', left: '-2%', zIndex: 20,
              padding: '10px 16px', borderRadius: 14,
              background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={15} color="#25D366" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>WhatsApp · now</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F2EDE4' }}>Galerie partagée ✓</div>
            </div>
          </m.div>
        )}

        {isDesktop && (
          <m.div
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            style={{
              position: 'absolute', top: '45%', right: '-4%', zIndex: 20,
              padding: '12px 18px', borderRadius: 14,
              background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>Vues cette semaine</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#C8482E', letterSpacing: '-0.02em', lineHeight: 1 }}>3.6K</div>
          </m.div>
        )}

        {isDesktop && (
          <m.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            style={{
              position: 'absolute', bottom: '14%', left: '-4%', zIndex: 20,
              padding: '12px 18px', borderRadius: 14,
              background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(223,84,56,0.2)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <Heart size={11} color="#C8482E" fill="#C8482E" />
              <div style={{ fontSize: 10, color: '#555' }}>Favoris sélectionnés</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.02em', lineHeight: 1 }}>1.2K</div>
          </m.div>
        )}

        {/* Phone Frame */}
        <div style={{
          width: 288, height: 620, borderRadius: 46,
          background: '#0d0d0d', border: '8px solid #1a1a1a',
          boxShadow: [
            '0 0 0 1px rgba(255,255,255,0.06)',
            '0 50px 120px rgba(0,0,0,0.8)',
            '0 20px 60px rgba(223,84,56,0.08)',
            'inset 0 1px 0 rgba(255,255,255,0.08)',
          ].join(', '),
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, borderRadius: 14, background: '#0d0d0d', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1d1d1d' }} />
            <div style={{ width: 50, height: 18, borderRadius: 9, background: '#1d1d1d' }} />
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 18px 6px', zIndex: 25 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
                {[3, 5, 8, 11].map((h, i) => (
                  <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: i < 3 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }} />
                ))}
              </div>
              <div style={{ width: 22, height: 11, borderRadius: 3, border: '1px solid rgba(255,255,255,0.5)', position: 'relative', marginLeft: 2 }}>
                <div style={{ position: 'absolute', left: 2, top: 2, bottom: 2, width: '70%', borderRadius: 1.5, background: 'rgba(255,255,255,0.8)' }} />
                <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 3, height: 5, borderRadius: '0 2px 2px 0', background: 'rgba(255,255,255,0.5)' }} />
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'hidden', background: '#0f0f0f' }}>
            <div style={{ padding: '48px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f0f0f' }}>
              <Image src="/logo.png" alt="Fotia" width={400} height={267} style={{ height: 18, width: 'auto', objectFit: 'contain', filter: 'brightness(1.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Smartphone size={9} color="#A09890" />
                  <span style={{ fontSize: 9, color: '#A09890', fontWeight: 600 }}>Galerie ouverte</span>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, color: '#A09890', lineHeight: 1 }}>···</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', margin: '0 14px', borderRadius: 14, overflow: 'hidden', height: 120 }}>
              <Image src="/media__1784566765630.webp" alt="Aperçu de la galerie de mariage Love in Accra dans l'application Fotia" fill sizes="260px" style={{ objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,15,15,0.1) 0%, rgba(15,15,15,0.75) 100%)' }} />
            </div>

            <div style={{ padding: '10px 14px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #DF5438, #C8482E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Camera size={11} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#F2EDE4', lineHeight: 1.2 }}>Amara Studios</div>
                  <div style={{ fontSize: 9, color: '#555' }}>Wedding Photographer</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#F2EDE4', letterSpacing: '-0.02em' }}>Love in Accra</span>
                <span style={{ color: '#C8482E', fontSize: 13 }}>✦</span>
              </div>
              <div style={{ fontSize: 9, color: '#555', lineHeight: 1.4, marginBottom: 8 }}>Une belle union d&apos;amour et de culture.</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                {[{ icon: '📷', label: '152 photos' }, { icon: '📅', label: '12 mai 2024' }, { icon: '👁', label: '3.6K vues' }].map(({ icon, label }) => (
                   <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 8 }}>{icon}</span>
                    <span style={{ fontSize: 8, color: '#555', fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 0', borderRadius: 8, background: 'rgba(223,84,56,0.12)', border: '1px solid rgba(223,84,56,0.25)' }}>
                  <Heart size={9} color="#C8482E" fill="#C8482E" />
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#C8482E' }}>Tout aimer</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 0', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  <Share2 size={9} color="#A09890" />
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#A09890' }}>Partager</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '0 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#F2EDE4' }}>Galerie photos</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 8, color: '#555' }}>Filtrer</span>
                <span style={{ fontSize: 8, color: '#555' }}>Trier</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, padding: '0 2px' }}>
              {GRID_PHOTOS.map(({ src, liked }, i) => (
                <div key={i} style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', borderRadius: 4, background: '#1a1a1a' }}>
                  <Image src={src} alt="" fill sizes="96px" style={{ objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: liked ? '#C8482E' : 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: liked ? 'none' : 'blur(4px)', border: liked ? 'none' : '1px solid rgba(255,255,255,0.15)' }}>
                    <Heart size={9} color="#fff" fill={liked ? '#fff' : 'transparent'} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px 0 4px', textAlign: 'center' }}>
              <span style={{ fontSize: 8, color: '#333' }}>Propulsé par </span>
              <span style={{ fontSize: 8, color: '#C8482E', fontWeight: 700 }}>Fotia</span>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px 22px', background: 'linear-gradient(to top, rgba(10,10,10,1) 60%, rgba(10,10,10,0.95) 80%, transparent 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Heart size={13} color="#C8482E" fill="#C8482E" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#F2EDE4', lineHeight: 1 }}>24</div>
                <div style={{ fontSize: 9, color: '#555', lineHeight: 1 }}>Favoris</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 16px', borderRadius: 20, background: 'linear-gradient(135deg, #DF5438, #C8482E)', boxShadow: '0 4px 14px rgba(223,84,56,0.45)' }}>
              <Download size={11} color="#fff" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Télécharger</span>
            </div>
          </div>
        </div>
      </m.div>
  )
}
