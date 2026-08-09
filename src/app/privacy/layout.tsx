import type { Metadata } from 'next'

// Métadonnées SEO propres à /privacy (page client : les metadata ne peuvent pas y être exportées)
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://myfotia.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité de Fotia : quelles données sont collectées (photographes, clients, photos), comment elles sont utilisées, sécurisées et vos droits RGPD.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/privacy`,
    title: 'Politique de confidentialité | Fotia',
    description:
      'Comment Fotia collecte, utilise et protège vos données personnelles. Droits RGPD et contact support.',
  },
  twitter: {
    card: 'summary',
    title: 'Politique de confidentialité | Fotia',
    description:
      'Comment Fotia collecte, utilise et protège vos données personnelles. Droits RGPD et contact support.',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
