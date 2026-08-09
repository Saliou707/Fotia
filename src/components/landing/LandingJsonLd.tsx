import { STATS, FAQ_ITEMS, SITE_DATE_PUBLISHED, SITE_DATE_MODIFIED } from './landing-data'

// Domaine public (même source que layout.tsx / sitemap.ts)
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://myfotia.com').replace(/\/$/, '')

// JSON-LD Organization + SoftwareApplication + HowTo : résultats enrichis Google sur la landing
// (Pas d'aggregateRating : aucune source de reviews vérifiable → fabriquer des notes est interdit par Google)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Fotia',
      url: siteUrl,
      logo: `${siteUrl}/og-image.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+79962131741',
        url: 'https://wa.me/79962131741',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#softwareapp`,
      name: 'Fotia',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      url: siteUrl,
      description: 'Plateforme SaaS pour photographes : galeries photo élégantes, partage WhatsApp et sélection de favoris par les clients.',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '15',
        priceCurrency: 'EUR',
        offerCount: '2',
        offers: [
          { '@type': 'Offer', name: 'Essentiel', price: '0', priceCurrency: 'EUR' },
          { '@type': 'Offer', name: 'Premium Pro', price: '15', priceCurrency: 'EUR' },
        ],
      },
      featureList: [
        'Import de photos en un clic',
        'Partage de galeries via WhatsApp',
        'Sélection de favoris par les clients',
        'Téléchargement HD',
        'Statistiques en temps réel',
      ],
    },
    {
      '@type': 'HowTo',
      name: 'Comment livrer des photos avec Fotia',
      step: [
        { '@type': 'HowToStep', name: 'Créez votre galerie', text: 'Importez vos photos en quelques secondes.' },
        { '@type': 'HowToStep', name: 'Partagez via WhatsApp', text: 'Un lien sécurisé pour votre client.' },
        { '@type': 'HowToStep', name: 'Le client sélectionne', text: 'Il marque ses photos favorites.' },
        { '@type': 'HowToStep', name: 'Vous livrez', text: 'Téléchargez la sélection finale.' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
    {
      // Page principale : dates de publication/mise à jour + author/publisher → crédibilité E-E-A-T
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: 'Fotia — Galeries photo professionnelles',
      description: 'Plateforme SaaS pour photographes : galeries photo élégantes, partage via WhatsApp et sélection de favoris par les clients.',
      inLanguage: 'fr',
      datePublished: SITE_DATE_PUBLISHED,
      dateModified: SITE_DATE_MODIFIED,
      author: { '@id': `${siteUrl}/#organization` },
      publisher: { '@id': `${siteUrl}/#organization` },
      mainEntity: { '@id': `${siteUrl}/#softwareapp` },
      about: { '@id': `${siteUrl}/#stats` },
    },
    {
      // Chiffres clés citables, alignés sur la section visible (même source STATS)
      '@type': 'ItemList',
      '@id': `${siteUrl}/#stats`,
      name: 'Chiffres clés Fotia',
      numberOfItems: STATS.length,
      itemListElement: STATS.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'PropertyValue',
          name: s.label,
          value: `${s.value}${s.suffix}`,
        },
      })),
    },
  ],
}

export default function LandingJsonLd() {
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  )
}
