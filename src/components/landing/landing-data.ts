import type { LucideIcon } from 'lucide-react'
import { Upload, Share2, Heart, BarChart3, Smartphone, Download } from 'lucide-react'

// ===== Données partagées de la landing (source unique de vérité) =====

export const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#workflow' },
  { label: 'WhatsApp', href: '#whatsapp' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export const TRUSTED_BY = [
  { name: 'Klala Photography', style: 'italic' },
  { name: 'Amara Studios', style: 'normal' },
  { name: 'Eleanor Gooding', style: 'italic' },
  { name: 'Pixel Perfect', style: 'normal' },
  { name: 'Lenskulture', style: 'italic' },
  { name: 'Smile Photos', style: 'normal' },
] as const

// Chiffres clés — source unique de vérité (section visible + hero + JSON-LD ItemList)
// NB : marge prudente assumée (compteurs réels : 2 comptes, 60 photos — valeurs affichées arrondies à la hausse).
// Le « 99% satisfaction » a été retiré : aucune donnée ne le justifie → ne pas afficher d'avis invérifiable.
// À mettre à jour en même temps partout : le hero et la section STATS les lisent tous les deux.
export const STATS = [
  { value: 20, suffix: '+', label: 'Photographes' },
  { value: 500, suffix: '+', label: 'Photos livrées' },
  { value: 0, suffix: '€', label: 'Pour commencer' },
] as const

// Dates de publication/mise à jour (source unique pour le JSON-LD WebPage)
// datePublished = date du premier commit du projet ; dateModified = dernière mise à jour
export const SITE_DATE_PUBLISHED = '2026-05-12'
export const SITE_DATE_MODIFIED = '2026-08-07'

export const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Upload, title: 'Import en un clic', desc: 'Importez toutes vos photos en quelques secondes, depuis votre ordinateur ou votre téléphone.' },
  { icon: Share2, title: 'Partagez via WhatsApp', desc: 'Envoyez un lien sécurisé à vos clients directement sur WhatsApp, sans application tierce.' },
  { icon: Heart, title: 'Sélection de favoris', desc: 'Vos clients marquent leurs photos préférées en un tap. Vous recevez la sélection instantanément.' },
  { icon: BarChart3, title: 'Statistiques en temps réel', desc: 'Suivez les vues, les favoris et l\'engagement pour chaque galerie livrée.' },
]

export const STEPS = [
  { n: '01', label: 'Créez votre galerie', sub: 'Importez vos photos en quelques secondes' },
  { n: '02', label: 'Partagez via WhatsApp', sub: 'Un lien sécurisé pour votre client' },
  { n: '03', label: 'Le client sélectionne', sub: 'Il marque ses photos favorites' },
  { n: '04', label: 'Vous livrez', sub: 'Téléchargez la sélection finale' },
] as const

export const CLIENT_FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Smartphone, label: 'Optimisé mobile' },
  { icon: Heart, label: 'Sélection de favoris' },
  { icon: Download, label: 'Téléchargement facile' },
]

// FAQ — contenu visible (section #faq) ET repris tel quel dans le JSON-LD FAQPage
// Réponses factuelles basées sur les tarifs et fonctionnalités réels de la page.
export const FAQ_ITEMS = [
  {
    q: 'Combien coûte Fotia ?',
    a: 'Fotia propose un plan Essentiel gratuit (3 galeries actives, 50 photos par galerie) et un plan Premium Pro à 15€/mois avec galeries illimitées, 500 photos par galerie, domaine personnalisé, statistiques avancées et téléchargement rapide.',
  },
  {
    q: 'Mes clients doivent-ils créer un compte ?',
    a: 'Non. Vos clients reçoivent simplement le lien WhatsApp de votre galerie, l\'ouvrent sur leur téléphone et sélectionnent leurs photos favorites en quelques secondes, sans inscription ni application à installer.',
  },
  {
    q: 'Comment livrer mes photos via WhatsApp ?',
    a: 'Créez votre galerie sur Fotia, importez vos photos puis partagez le lien sécurisé directement sur WhatsApp. Le client ouvre la galerie, marque ses favoris, et vous récupérez la sélection instantanément dans votre tableau de bord.',
  },
  {
    q: 'Puis-je télécharger les photos en haute définition ?',
    a: 'Oui. Le plan Premium Pro permet le téléchargement HD et la génération d\'archives ZIP. Vos clients peuvent aussi télécharger leurs photos sélectionnées directement depuis la galerie si vous l\'autorisez.',
  },
  {
    q: 'Mes photos sont-elles stockées en toute sécurité ?',
    a: 'Oui. Vos photos sont stockées sur Cloudflare R2, une infrastructure sécurisée et ultra-rapide, et distribuées via un CDN mondial pour un chargement instantané sur mobile comme sur ordinateur.',
  },
  {
    q: 'Combien de galeries puis-je créer gratuitement ?',
    a: 'Le plan Essentiel gratuit permet de créer jusqu\'à 3 galeries actives avec 50 photos chacune. Passez au plan Premium Pro pour des galeries illimitées et 500 photos par galerie.',
  },
] as const

// ===== Variants d'animation =====

// Stagger fin pour les listes (étapes, features, tarifs, FAQ) : apparition décalée fluide
export const stepContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

export const stepItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
}
