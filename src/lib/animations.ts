import type { Variants, Easing } from 'framer-motion'

// Courbe cinématique "Chambre Noire" (snappy but smooth)
const cinematicEase: Easing = [0.16, 1, 0.3, 1]

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: cinematicEase } },
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
