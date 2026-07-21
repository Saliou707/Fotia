'use client'
/**
 * LanguageContext — Système i18n FR/EN complet pour Fotia
 * Couvre : landing, dashboard, billing, galleries, settings, onboarding
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Lang = 'fr' | 'en'

const TRANSLATIONS = {
  fr: {
    nav: {
      dashboard: 'Tableau de bord',
      galleries: 'Galeries client',
      favorites: 'Favoris',
      clients: 'Mes Clients',
      analytics: 'Statistiques',
      settings: 'Paramètres',
      admin: 'Espace Administrateur',
      logout: 'Déconnexion',
    },
    common: {
      loading: 'Chargement...',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      back: 'Retour',
      confirm: 'Confirmer',
      close: 'Fermer',
      search: 'Rechercher',
      upload: 'Uploader',
      download: 'Télécharger',
      share: 'Partager',
      copy: 'Copier',
      copied: 'Copié !',
      success: 'Succès',
      error: 'Erreur',
      free: 'Gratuit',
      pro: 'Pro',
    },
    // ─── Landing Page ────────────────────────────────────────
    landing: {
      // Navbar
      navFeatures: 'Fonctionnalités',
      navHowItWorks: 'Comment ça marche',
      navWhatsapp: 'WhatsApp',
      navPricing: 'Tarifs',
      login: 'Connexion',
      getStarted: 'Commencer',
      // Hero
      badge: '⚡ La plateforme n°1 pour la livraison photo sur WhatsApp',
      heroTitle1: 'La plateforme de livraison photo',
      heroTitle2: 'nouvelle génération.',
      heroDesc: "Galeries HD sublimées, système de coup de cœur en temps réel et partage WhatsApp instantané. L'outil ultime pour valoriser votre travail.",
      ctaPrimary: 'Tester gratuitement',
      ctaSecondary: 'Tester la galerie démo ✨',
      socialProof: "Adoré par <strong>1 200+</strong> photographes d'élite à travers l'Afrique.",
      // Floating cards
      floatWhatsapp: 'Galerie partagée avec 12 clients',
      floatViews: 'Vues totales',
      floatFavorites: 'Favoris',
      // Phone UI
      phoneOpen: 'Ouvrir',
      phoneLikeAll: 'Tout aimer',
      phoneShare: 'Partager',
      phoneGallery: 'Galerie',
      phoneFilter: 'Filtrer',
      phoneSort: 'Trier',
      phoneDownloadFav: 'Télécharger les favoris',
      phonePowered: 'Propulsé par',
      // Trusted by
      trustedBy: 'Approuvé par les photographes & studios',
      // Features section
      featuresTag: 'Tout ce qu\'il vous faut pour délivrer une',
      featuresTagHighlight: 'expérience inoubliable',
      featuresDesc: 'Des outils conçus pour les photographes professionnels.',
      feature1Title: 'Upload & Créer',
      feature1Desc: 'Uploadez vos photos et créez de belles galeries en quelques minutes.',
      feature2Title: 'Partager Instantanément',
      feature2Desc: 'Partagez instantanément via WhatsApp avec vos clients. Un seul clic.',
      feature3Title: 'Favoris Clients',
      feature3Desc: 'Vos clients sélectionnent leurs meilleures photos. Vous livrez avec confiance.',
      feature4Title: 'Analytics Puissantes',
      feature4Desc: 'Suivez les vues, favoris et téléchargements avec des statistiques détaillées.',
      // Client experience
      clientTag: 'Conçue pour les clients',
      clientTitle1: 'Une expérience galerie que vos clients',
      clientTitle2: 'vont adorer.',
      clientDesc: "Épurée. Élégante. Mobile-first. Vos clients peuvent parcourir, mettre en favoris et télécharger leurs photos avec une facilité déconcertante.",
      clientCta: 'Créer ma première galerie',
      clientFeat1: 'Galerie mobile élégante',
      clientFeat2: 'Favoris faciles',
      clientFeat3: 'Téléchargements HD',
      // How it works
      workflowTag: 'Workflow Intuitif',
      workflowTitle: 'Simple, Fluide, Instantané',
      step1Label: 'Uploadez vos créations',
      step1Sub: 'Glissez-déposez vos photos brutes ou retouchées en haute résolution.',
      step2Label: 'Partagez via WhatsApp',
      step2Sub: 'Copiez le lien élégant et envoyez-le directement sur le chat de votre client.',
      step3Label: 'Sélection client immersive',
      step3Sub: 'Votre client fait son choix sur son mobile grâce à une interface fluide.',
      step4Label: 'Livraison en un clic',
      step4Sub: 'Votre client télécharge sa sélection validée. Vous contrôlez tout.',
      // Stats
      stat1Label: 'Photographes actifs',
      stat2Label: 'Galeries livrées',
      stat3Label: 'Satisfaction client',
      stat4Label: 'Sans carte bancaire',
      // WhatsApp section
      waTag: 'Notification Client Immédiate',
      waTitle1: 'Vos clients accèdent à leur galerie',
      waTitle2: 'directement sur WhatsApp.',
      waDesc: "Oubliez les transferts lourds et les emails perdus dans les spams. Fotia envoie un lien ultra-léger et interactif qui s'ouvre parfaitement sur mobile en une seconde.",
      waCta: 'Créer mon espace gratuit',
      // Pricing
      pricingTag: 'Tarifs',
      pricingTitle1: 'Simple. Clair.',
      pricingTitle2: 'Sans surprise.',
      pricingDesc: "Commencez à livrer des galeries professionnelles à vos clients dès aujourd'hui.",
      pricingRecommended: '⭐ Recommandé',
      planFreeTitle: 'Essentiel',
      planFreePrice: '0€',
      planFreeRecurrence: '/ gratuit à vie',
      planFreeDesc: 'Pour démarrer et tester Fotia sans engagement.',
      planFreeFeatures: [
        '3 galeries actives simultanément',
        '100 photos par galerie',
        '5 GB de stockage sécurisé',
        'Partage WhatsApp optimisé',
        'Sélection des favoris en direct ❤️',
        'Hébergement sécurisé inclus',
      ],
      planFreeBtn: 'Commencer gratuitement',
      planProTitle: 'Premium Pro',
      planProPrice: '1€',
      planProRecurrence: '/ mois',
      planProDesc: 'Pour impressionner vos clients à chaque livraison.',
      planProFeatures: [
        'Galeries illimitées',
        '1 000 photos par galerie',
        '100 GB de stockage optimisé',
        'Téléchargement HD',
        'Filigrane personnalisé',
        'Profil photographe sur les galeries',
        'Statistiques clients en temps réel',
      ],
      planProBtn: 'Devenir Premium Pro',
      planProNote: 'Sans engagement · Annulable à tout moment',
      pricingContact: "Des questions ? <a>Contactez-nous sur WhatsApp</a> — on répond en moins d'une heure.",
      // Final CTA
      ctaBannerTag: 'Démarrez en 2 minutes',
      ctaBannerTitle: 'Prêt à livrer vos photos magnifiquement ?',
      ctaBannerDesc: 'Rejoignez des milliers de photographes qui utilisent Fotia pour impressionner leurs clients.',
      ctaBannerBtn: 'Commencer Gratuitement',
      // Mobile drawer
      drawerStartFree: 'Commencer gratuitement →',
      // Footer
      footerBrand: 'La plateforme de livraison de galeries photo pour les photographes professionnels en Afrique.',
      footerProduct: 'Produit',
      footerLegal: 'Légal',
      footerPrivacy: 'Confidentialité',
      footerTerms: 'Conditions',
      footerSupport: 'Support WhatsApp',
      footerCopy: '© 2026 Fotia. Tous droits réservés.',
      footerMadeIn: 'Fait en Afrique, pour le monde',
    },
    // ─── Dashboard ───────────────────────────────────────────
    dashboard: {
      title: 'Tableau de bord',
      welcome: 'Bienvenue',
      galleries: 'Galeries créées',
      recentGalleries: 'Galeries récentes',
      noGalleries: "Aucune galerie pour l'instant",
      createFirst: 'Créer votre première galerie',
      storageUsed: 'Stockage utilisé',
      plan: 'Plan actuel',
      upgrade: 'Passer au Pro',
      managePlan: 'Gérer mon forfait',
      unlimitedGalleries: 'Galeries illimitées',
    },
    // ─── Billing ─────────────────────────────────────────────
    billing: {
      success: {
        title: 'Paiement Réussi !',
        badge: 'Plan Premium Pro Activé',
        description: (name: string) => `Félicitations ${name} ! Votre compte a été mis à jour vers le plan Premium Pro. Vous disposez désormais de galeries illimitées et de toutes les fonctionnalités avancées.`,
        goToDashboard: 'Aller au Tableau de Bord',
        seeSettings: "Voir les Paramètres d'Abonnement",
        footer: 'Sécurité certifiée par Djomy Africa. Mobile Money accepté.',
      },
      failed: {
        title: 'Paiement Échoué',
        badge: 'Transaction Annulée ou Échouée',
        description: "Désolé, nous n'avons pas pu valider votre paiement via Djomy. Cela peut être dû à un solde insuffisant, à une expiration de session ou à un rejet par votre opérateur Mobile Money.",
        retry: 'Réessayer le Paiement',
        backToDashboard: 'Retour au Dashboard',
        footer: "Besoin d'assistance ? Contactez le support Fotia pour finaliser votre abonnement.",
      },
      modal: {
        title: 'Passer au Plan Pro',
        subtitle: 'Profitez de toutes les fonctionnalités premium !',
        priceLabel: 'GNF /mois',
        features: [
          'Galeries illimitées',
          '1000 photos / galerie',
          'Téléchargement HD',
          'Filigrane personnalisé',
          'Support prioritaire',
        ],
        payWith: 'Payer avec Mobile Money',
        phoneLabel: 'Numéro de téléphone',
        phonePlaceholder: 'Ex: 00224623707722',
        phoneHint: 'Format international : 00224XXXXXXXX',
        phoneTitle: 'Votre numéro Mobile Money',
        phoneSubtitle: 'Entrez le numéro de votre compte (Orange Money, MTN MoMo ou Kulu). Vous serez redirigé vers le portail Djomy.',
        pay: 'Payer 1 000 GNF →',
        paying: 'Redirection...',
      },
    },
    // ─── Galleries ───────────────────────────────────────────
    galleries: {
      title: 'Mes Galeries',
      create: 'Nouvelle galerie',
      empty: 'Aucune galerie',
      emptyDesc: 'Créez votre première galerie pour commencer à partager vos photos.',
      photos: 'photos',
      views: 'vues',
      favorites: 'favoris',
      lastUpdated: 'Mis à jour',
      share: 'Partager',
      open: 'Ouvrir',
    },
    // ─── Settings ────────────────────────────────────────────
    settings: {
      title: 'Paramètres',
      profile: 'Profil',
      subscription: 'Abonnement',
      language: 'Langue',
      notifications: 'Notifications',
      security: 'Sécurité',
      displayName: "Nom d'affichage",
      email: 'Adresse e-mail',
      saveChanges: 'Sauvegarder',
    },
    // ─── Onboarding ──────────────────────────────────────────
    onboarding: {
      welcome: 'Bienvenue sur Fotia !',
      step1: 'Votre nom',
      namePlaceholder: 'Ex: Jean-Baptiste Diallo',
      nameLabel: 'Quel nom voulez-vous afficher ?',
    },
    // ─── Auth (Login / Signup) ───────────────────────────────
    auth: {
      loginTitle: 'Connexion',
      signupTitle: 'Créer un compte',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'votre@email.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: '••••••••',
      nameLabel: 'Votre nom',
      namePlaceholder: 'Jean-Baptiste Diallo',
      loginBtn: 'Se connecter',
      signupBtn: "S'inscrire gratuitement",
      forgotPassword: 'Mot de passe oublié ?',
      noAccount: "Pas encore de compte ?",
      alreadyAccount: 'Déjà un compte ?',
      signupLink: 'Créer un compte',
      loginLink: 'Se connecter',
      sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
      loading: 'Chargement...',
      backHome: 'Retour à l\'accueil',
    },
  },

  en: {
    nav: {
      dashboard: 'Dashboard',
      galleries: 'Client Galleries',
      favorites: 'Favorites',
      clients: 'My Clients',
      analytics: 'Analytics',
      settings: 'Settings',
      admin: 'Admin Panel',
      logout: 'Sign Out',
    },
    common: {
      loading: 'Loading...',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      back: 'Back',
      confirm: 'Confirm',
      close: 'Close',
      search: 'Search',
      upload: 'Upload',
      download: 'Download',
      share: 'Share',
      copy: 'Copy',
      copied: 'Copied!',
      success: 'Success',
      error: 'Error',
      free: 'Free',
      pro: 'Pro',
    },
    // ─── Landing Page ────────────────────────────────────────
    landing: {
      navFeatures: 'Features',
      navHowItWorks: 'How it works',
      navWhatsapp: 'WhatsApp',
      navPricing: 'Pricing',
      login: 'Login',
      getStarted: 'Get Started',
      badge: '⚡ The #1 photo delivery platform for WhatsApp',
      heroTitle1: 'Next-generation photo',
      heroTitle2: 'delivery platform.',
      heroDesc: 'Stunning HD galleries, real-time favorite selection, and instant WhatsApp sharing. The ultimate tool to elevate your work.',
      ctaPrimary: 'Try for free',
      ctaSecondary: 'Try demo gallery ✨',
      socialProof: 'Loved by <strong>1,200+</strong> top photographers across Africa and beyond.',
      floatWhatsapp: 'Gallery shared with 12 clients',
      floatViews: 'Total views',
      floatFavorites: 'Favorites',
      phoneOpen: 'Open',
      phoneLikeAll: 'Like all',
      phoneShare: 'Share',
      phoneGallery: 'Gallery',
      phoneFilter: 'Filter',
      phoneSort: 'Sort',
      phoneDownloadFav: 'Download favorites',
      phonePowered: 'Powered by',
      trustedBy: 'Trusted by photographers & studios',
      featuresTag: 'Everything you need to deliver an',
      featuresTagHighlight: 'unforgettable experience',
      featuresDesc: 'Tools designed for professional photographers.',
      feature1Title: 'Upload & Create',
      feature1Desc: 'Upload your photos and create beautiful galleries in minutes.',
      feature2Title: 'Share Instantly',
      feature2Desc: 'Share instantly via WhatsApp with your clients. One click.',
      feature3Title: 'Client Favorites',
      feature3Desc: 'Your clients select their best photos. You deliver with confidence.',
      feature4Title: 'Powerful Analytics',
      feature4Desc: 'Track views, favorites and downloads with detailed statistics.',
      clientTag: 'Designed for clients',
      clientTitle1: 'A gallery experience your clients',
      clientTitle2: 'will love.',
      clientDesc: 'Clean. Elegant. Mobile-first. Your clients can browse, favorite and download their photos with effortless ease.',
      clientCta: 'Create my first gallery',
      clientFeat1: 'Elegant mobile gallery',
      clientFeat2: 'Easy favorites',
      clientFeat3: 'HD Downloads',
      workflowTag: 'Intuitive Workflow',
      workflowTitle: 'Simple, Smooth, Instant',
      step1Label: 'Upload your work',
      step1Sub: 'Drag and drop your raw or edited photos in high resolution.',
      step2Label: 'Share via WhatsApp',
      step2Sub: 'Copy the elegant link and send it directly to your client chat.',
      step3Label: 'Immersive client selection',
      step3Sub: 'Your client makes their choice on their phone with a smooth interface.',
      step4Label: 'One-click delivery',
      step4Sub: 'Your client downloads their validated selection. You control everything.',
      stat1Label: 'Active photographers',
      stat2Label: 'Galleries delivered',
      stat3Label: 'Client satisfaction',
      stat4Label: 'No credit card needed',
      waTag: 'Instant Client Notification',
      waTitle1: 'Your clients access their gallery',
      waTitle2: 'directly on WhatsApp.',
      waDesc: "Forget heavy transfers and emails lost in spam. Fotia sends an ultra-light, interactive link that opens perfectly on mobile in one second.",
      waCta: 'Create my free space',
      pricingTag: 'Pricing',
      pricingTitle1: 'Simple. Clear.',
      pricingTitle2: 'No surprises.',
      pricingDesc: 'Start delivering professional galleries to your clients today.',
      pricingRecommended: '⭐ Recommended',
      planFreeTitle: 'Essential',
      planFreePrice: '0€',
      planFreeRecurrence: '/ free forever',
      planFreeDesc: 'To start and test Fotia without commitment.',
      planFreeFeatures: [
        '3 active galleries at a time',
        '100 photos per gallery',
        '5 GB secure storage',
        'Optimized WhatsApp sharing',
        'Live favorites selection ❤️',
        'Secure hosting included',
      ],
      planFreeBtn: 'Start for free',
      planProTitle: 'Premium Pro',
      planProPrice: '9€',
      planProRecurrence: '/ month',
      planProDesc: 'To impress your clients at every delivery.',
      planProFeatures: [
        'Unlimited galleries',
        '1,000 photos per gallery',
        '100 GB optimized storage',
        'HD Download',
        'Custom watermark',
        'Photographer profile on galleries',
        'Real-time client analytics',
      ],
      planProBtn: 'Become Premium Pro',
      planProNote: 'No commitment · Cancel anytime',
      pricingContact: 'Questions? <a>Contact us on WhatsApp</a> — we reply in under an hour.',
      ctaBannerTag: 'Get started in 2 minutes',
      ctaBannerTitle: 'Ready to deliver your photos beautifully?',
      ctaBannerDesc: 'Join thousands of photographers using Fotia to impress their clients.',
      ctaBannerBtn: 'Start for Free',
      drawerStartFree: 'Start for free →',
      footerBrand: 'The photo gallery delivery platform for professional photographers in Africa.',
      footerProduct: 'Product',
      footerLegal: 'Legal',
      footerPrivacy: 'Privacy',
      footerTerms: 'Terms',
      footerSupport: 'WhatsApp Support',
      footerCopy: '© 2026 Fotia. All rights reserved.',
      footerMadeIn: 'Made in Africa, for the world',
    },
    // ─── Dashboard ───────────────────────────────────────────
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome',
      galleries: 'Galleries created',
      recentGalleries: 'Recent Galleries',
      noGalleries: 'No galleries yet',
      createFirst: 'Create your first gallery',
      storageUsed: 'Storage used',
      plan: 'Current plan',
      upgrade: 'Upgrade to Pro',
      managePlan: 'Manage my plan',
      unlimitedGalleries: 'Unlimited galleries',
    },
    // ─── Billing ─────────────────────────────────────────────
    billing: {
      success: {
        title: 'Payment Successful!',
        badge: 'Premium Pro Plan Activated',
        description: (name: string) => `Congratulations ${name}! Your account has been upgraded to Premium Pro. You now have unlimited galleries and all advanced features.`,
        goToDashboard: 'Go to Dashboard',
        seeSettings: 'Subscription Settings',
        footer: 'Secured by Djomy Africa. Mobile Money accepted.',
      },
      failed: {
        title: 'Payment Failed',
        badge: 'Transaction Cancelled or Failed',
        description: "Sorry, we couldn't validate your payment through Djomy. This may be due to insufficient balance, session timeout, or rejection by your Mobile Money operator.",
        retry: 'Retry Payment',
        backToDashboard: 'Back to Dashboard',
        footer: 'Need help? Contact Fotia support to complete your subscription.',
      },
      modal: {
        title: 'Upgrade to Pro Plan',
        subtitle: 'Enjoy all premium features!',
        priceLabel: 'GNF /month',
        features: [
          'Unlimited galleries',
          '1000 photos / gallery',
          'HD Download',
          'Custom watermark',
          'Priority support',
        ],
        payWith: 'Pay with Mobile Money',
        phoneLabel: 'Phone number',
        phonePlaceholder: 'Ex: 00224623707722',
        phoneHint: 'International format: 00224XXXXXXXX',
        phoneTitle: 'Your Mobile Money number',
        phoneSubtitle: 'Enter your account number (Orange Money, MTN MoMo or Kulu). You will be redirected to the Djomy portal.',
        pay: 'Pay 1,000 GNF →',
        paying: 'Redirecting...',
      },
    },
    // ─── Galleries ───────────────────────────────────────────
    galleries: {
      title: 'My Galleries',
      create: 'New gallery',
      empty: 'No galleries',
      emptyDesc: 'Create your first gallery to start sharing your photos.',
      photos: 'photos',
      views: 'views',
      favorites: 'favorites',
      lastUpdated: 'Updated',
      share: 'Share',
      open: 'Open',
    },
    // ─── Settings ────────────────────────────────────────────
    settings: {
      title: 'Settings',
      profile: 'Profile',
      subscription: 'Subscription',
      language: 'Language',
      notifications: 'Notifications',
      security: 'Security',
      displayName: 'Display name',
      email: 'Email address',
      saveChanges: 'Save changes',
    },
    // ─── Onboarding ──────────────────────────────────────────
    onboarding: {
      welcome: 'Welcome to Fotia!',
      step1: 'Your name',
      namePlaceholder: 'E.g.: Jean-Baptiste Diallo',
      nameLabel: 'What name do you want to display?',
    },
    // ─── Auth (Login / Signup) ───────────────────────────────
    auth: {
      loginTitle: 'Sign In',
      signupTitle: 'Create an account',
      emailLabel: 'Email address',
      emailPlaceholder: 'your@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      nameLabel: 'Your name',
      namePlaceholder: 'Jean-Baptiste Diallo',
      loginBtn: 'Sign In',
      signupBtn: 'Sign up for free',
      forgotPassword: 'Forgot password?',
      noAccount: 'No account yet?',
      alreadyAccount: 'Already have an account?',
      signupLink: 'Create account',
      loginLink: 'Sign In',
      sessionExpired: 'Your session has expired. Please sign in again.',
      loading: 'Loading...',
      backHome: 'Back to home',
    },
  },
} as const

// ── Context ───────────────────────────────────────────────────────────────
type TranslationsType = typeof TRANSLATIONS.fr | typeof TRANSLATIONS.en

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  translations: TranslationsType
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
  translations: TRANSLATIONS.fr,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const saved = (typeof window !== 'undefined' ? localStorage.getItem('fotia_lang') : null) as Lang | null
    if (saved === 'fr' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem('fotia_lang', l)
    if (typeof document !== 'undefined') document.documentElement.lang = l
  }, [])

  const t = useCallback((key: string): string => {
    const keys = key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = TRANSLATIONS[lang]
    for (const k of keys) {
      if (current === undefined || current === null) return key
      current = current[k]
    }
    if (typeof current === 'function') return current
    return typeof current === 'string' ? current : key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translations: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export { TRANSLATIONS }
