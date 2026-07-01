'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfUsePage() {
  return (
    <div style={{ background: '#080808', color: '#F5F0EB', minHeight: '100vh', fontFamily: 'var(--font-inter, Inter, sans-serif)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#A09890', textDecoration: 'none', marginBottom: 40, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
        
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
          Conditions <span style={{ color: '#C8482E' }}>d'utilisation</span>
        </h1>
        <p style={{ color: '#A09890', fontSize: 16, marginBottom: 60 }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, lineHeight: 1.7, fontSize: 16, color: '#D4D4D8' }}>
          
          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>1. Objet</h2>
            <p>
              Les présentes Conditions d'utilisation définissent les règles d'utilisation de la plateforme Fotia. En utilisant nos services, vous (le "Photographe" ou "Utilisateur") acceptez d'être lié par ces conditions. Fotia est une plateforme SaaS conçue pour créer des galeries photo professionnelles, faciliter le partage de liens via WhatsApp et gérer la sélection et le téléchargement des photographies par les clients.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>2. Utilisation du service et Compte Utilisateur</h2>
            <p>
              Pour utiliser Fotia, vous devez créer un compte utilisateur. Vous êtes responsable du maintien de la confidentialité de vos identifiants. Vous vous engagez à ne pas utiliser la plateforme à des fins illégales ou interdites, et à respecter l'ensemble des lois en vigueur concernant la distribution de photographies et la protection de la vie privée de vos clients.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>3. Forfaits et Paiements (Premium Pro)</h2>
            <p>
              Fotia propose un forfait Essentiel (gratuit) ainsi qu'un abonnement <strong>Premium Pro</strong> offrant des fonctionnalités avancées (galeries illimitées, téléchargement HD, personnalisation). 
              Le traitement de ces paiements est opéré de manière sécurisée par notre partenaire financier <strong>Djomy</strong>. En souscrivant au plan Premium Pro, vous acceptez les conditions de prélèvement automatique de cet abonnement, modifiable ou annulable à tout moment depuis votre tableau de bord.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>4. Propriété intellectuelle et Contenus</h2>
            <p>
              <strong>Vos contenus :</strong> Vous conservez l'intégralité de la propriété intellectuelle des photographies que vous uploadez. Vous déclarez posséder tous les droits nécessaires (y compris le droit à l'image des sujets) pour héberger et partager ces photos via Fotia.
            </p>
            <p style={{ marginTop: 12 }}>
              <strong>Plateforme Fotia :</strong> Le code source, le design, l'architecture et l'interface (notamment propulsée par Next.js) de l'application Fotia sont notre propriété exclusive. Il est interdit de copier ou de rétro-ingénierier ces éléments.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>5. Disponibilité et Hébergement</h2>
            <p>
              Nous nous efforçons d'assurer une disponibilité maximale du service. Le stockage de vos fichiers est assuré par <strong>Cloudflare R2</strong> pour une performance optimale. Cependant, nous ne pouvons garantir une plateforme exempte d'erreurs ou sans interruption à 100%. Il est de la responsabilité du Photographe de conserver des sauvegardes locales de ses fichiers originaux.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>6. Limitation de responsabilité</h2>
            <p>
              Dans les limites autorisées par la loi, Fotia ne pourra être tenue responsable de tout dommage indirect, perte de données, perte de revenus ou d'opportunités commerciales liés à l'utilisation ou à l'incapacité d'utiliser la plateforme, ou liés à des litiges entre vous et vos clients.
            </p>
          </section>

          <section style={{ padding: 24, background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F5F0EB', marginBottom: 12 }}>7. Contact & Support</h2>
            <p style={{ marginBottom: 12 }}>
              Pour toute question sur nos conditions d'utilisation, des problèmes techniques ou des questions liées à la facturation, 
              nous sommes à votre écoute :
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#C8482E' }}>
              WhatsApp Support : <a href="https://wa.me/79962131741" target="_blank" rel="noopener noreferrer" style={{ color: '#C8482E', textDecoration: 'underline' }}>+7 996 213 1741</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}

