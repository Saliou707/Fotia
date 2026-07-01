'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: '#080808', color: '#F5F0EB', minHeight: '100vh', fontFamily: 'var(--font-inter, Inter, sans-serif)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#A09890', textDecoration: 'none', marginBottom: 40, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
        
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
          Politique de <span style={{ color: '#C8482E' }}>Confidentialité</span>
        </h1>
        <p style={{ color: '#A09890', fontSize: 16, marginBottom: 60 }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, lineHeight: 1.7, fontSize: 16, color: '#D4D4D8' }}>
          
          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>1. Introduction</h2>
            <p>
              Bienvenue sur Fotia. La protection de vos données personnelles est une de nos priorités absolues. 
              Cette Politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations 
              lorsque vous utilisez notre plateforme SaaS, destinée à la gestion et au partage de galeries photographiques.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>2. Données collectées</h2>
            <p style={{ marginBottom: 12 }}>Nous collectons différents types d'informations pour fournir et améliorer nos services :</p>
            <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Données des photographes (Utilisateurs) :</strong> Nom, adresse e-mail, numéro de téléphone (WhatsApp), liens de réseaux sociaux, informations de facturation et données d'authentification.</li>
              <li><strong>Données des clients :</strong> Informations recueillies lors de l'interaction avec les galeries (sélection de favoris, téléchargements, adresses e-mail le cas échéant).</li>
              <li><strong>Contenus photographiques :</strong> Les images téléversées sur nos serveurs pour la création de galeries.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>3. Utilisation de vos données</h2>
            <p style={{ marginBottom: 12 }}>Les informations que nous collectons sont utilisées pour :</p>
            <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Fournir, opérer et maintenir la plateforme Fotia.</li>
              <li>Héberger et distribuer de manière sécurisée vos photographies (via Cloudflare R2).</li>
              <li>Traiter vos abonnements Premium Pro et paiements (via notre partenaire Djomy).</li>
              <li>Gérer l'authentification et sécuriser l'accès à votre compte (via Supabase).</li>
              <li>Communiquer avec vous concernant les mises à jour, le support client ou des informations relatives à la facturation.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>4. Sécurité et Hébergement</h2>
            <p>
              Vos données et vos photos sont stockées dans des infrastructures cloud de confiance. Nous utilisons <strong>Supabase</strong> pour la gestion sécurisée de notre base de données et l'authentification, ainsi que <strong>Cloudflare R2</strong> pour le stockage et la distribution ultra-rapide de vos fichiers en haute définition. Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles (chiffrement, accès restreints) pour prévenir toute perte ou accès non autorisé.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>5. Partage d'informations avec des tiers</h2>
            <p>
              Fotia ne vend jamais vos données personnelles. Les données ne sont partagées qu'avec des fournisseurs de services strictement nécessaires à l'exécution de la plateforme (Djomy pour les transactions financières, Supabase pour les bases de données, Cloudflare pour le stockage). Ces partenaires sont soumis à de strictes obligations de confidentialité.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F0EB', marginBottom: 16 }}>6. Vos Droits</h2>
            <p>
              Conformément à la réglementation applicable (y compris le RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Vous pouvez exercer ces droits à tout moment en nous contactant directement.
            </p>
          </section>

          <section style={{ padding: 24, background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F5F0EB', marginBottom: 12 }}>7. Contact & Support</h2>
            <p style={{ marginBottom: 12 }}>
              Pour toute question concernant cette Politique de confidentialité ou vos données personnelles, 
              notre équipe de support est disponible de manière réactive.
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

