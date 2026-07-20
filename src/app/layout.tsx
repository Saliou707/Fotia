import type { Metadata, Viewport } from 'next'
import { Inter, Big_Shoulders, IBM_Plex_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const bigShoulders = Big_Shoulders({ subsets: ['latin'], variable: '--font-title', display: 'swap', preload: false, fallback: ['system-ui', 'sans-serif'] })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap', preload: false })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', preload: false })

export const metadata: Metadata = {
  metadataBase: new URL('https://myfotia.com'), // Important for resolving relative URLs in og:image, etc.
  title: { default: 'Fotia — Galeries photo professionnelles', template: '%s | Fotia' },
  description: 'Fotia est la plateforme SaaS pour photographes. Créez des galeries élégantes, partagez via WhatsApp et laissez vos clients sélectionner leurs favoris.',
  keywords: ['galerie photo', 'photographe', 'livraison photo', 'WhatsApp', 'galeries clients', 'portfolio photographe', 'partage photo', 'SaaS photographie'],
  authors: [{ name: 'Fotia' }],
  creator: 'Fotia',
  publisher: 'Fotia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'fr-FR': '/fr',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://myfotia.com',
    siteName: 'Fotia',
    title: 'Fotia — Galeries photo professionnelles',
    description: 'Livrez vos photos professionnellement avec Fotia. Galeries élégantes, sélection de favoris et partage facile.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fotia - Plateforme pour photographes',
      },
    ],
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fotia — Galeries photo professionnelles',
    description: 'Créez des galeries élégantes et partagez-les avec vos clients facilement.',
    creator: '@fotia_app', // Assuming a Twitter handle
    images: ['/og-image.png'], // Same image as OG
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  verification: {
    other: {
      'msvalidate.01': '949E8BC00CC6F461F556A6637BA6E37F',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 5, themeColor: '#15171A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${bigShoulders.variable} ${plexMono.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body style={{ margin: 0, padding: 0, background: '#15171A', color: '#F2EDE4', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
