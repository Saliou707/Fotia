import type { Metadata, Viewport } from 'next'
import { Inter, Big_Shoulders, IBM_Plex_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const bigShoulders = Big_Shoulders({ subsets: ['latin'], variable: '--font-title', display: 'swap', adjustFontFallback: false, fallback: ['system-ui', 'sans-serif'] })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: { default: 'Fotia — Galeries photo professionnelles', template: '%s | Fotia' },
  description: 'Créez des galeries élégantes, partagez via WhatsApp et laissez vos clients sélectionner leurs favoris.',
  keywords: ['galerie photo', 'photographe', 'livraison photo', 'WhatsApp', 'galeries clients'],
  authors: [{ name: 'Fotia' }],
  openGraph: { type: 'website', siteName: 'Fotia', title: 'Fotia — Galeries photo professionnelles', description: 'Livrez vos photos professionnellement.' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 5, themeColor: '#15171A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${bigShoulders.variable} ${plexMono.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body style={{ margin: 0, padding: 0, background: '#15171A', color: '#F2EDE4', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        {children}
      </body>
    </html>
  )
}
