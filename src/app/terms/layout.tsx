import type { Metadata } from 'next'

// Métadonnées SEO propres à /terms (page client : les metadata ne peuvent pas y être exportées)
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://myfotia.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Conditions d'utilisation de Fotia : règles d'utilisation de la plateforme SaaS pour photographes, abonnement Premium Pro, propriété intellectuelle et limites de responsabilité.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/terms`,
    title: "Conditions d'utilisation | Fotia",
    description:
      "Conditions d'utilisation de la plateforme Fotia : comptes, forfaits Premium Pro, contenus et responsabilité.",
  },
  twitter: {
    card: 'summary',
    title: "Conditions d'utilisation | Fotia",
    description:
      "Conditions d'utilisation de la plateforme Fotia : comptes, forfaits Premium Pro, contenus et responsabilité.",
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
