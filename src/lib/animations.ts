import type { Variants } from 'framer-motion'

// Courbe cinématique "Chambre Noire" (snappy but smooth)
const cinematicEase = [0.16, 1, 0.3, 1]

// Variants correctement typés pour Framer Motion v12
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: cinematicEase } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: cinematicEase } },
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: cinematicEase } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: cinematicEase } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } },
}
