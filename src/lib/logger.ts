/**
 * Logger conditionnel — Fotia
 *
 * En production (NODE_ENV === 'production'), tous les appels sont silencieux
 * sauf les erreurs critiques. En développement, tout est loggé normalement.
 *
 * Usage :
 *   import { logger } from '@/lib/logger'
 *   logger.log('[Module] Message', data)
 *   logger.warn('[Module] Warning:', detail)
 *   logger.error('[Module] Error:', err)
 */

const IS_PROD = process.env.NODE_ENV === 'production'
const IS_SERVER = typeof window === 'undefined'

// En production, on ne log que les erreurs côté serveur.
// Côté client, tout est silencieux en prod (évite de polluer la console utilisateur).

function createLogger(tag: string) {
  return {
    log: (...args: unknown[]) => {
      if (!IS_PROD) console.log(`[${tag}]`, ...args)
    },
    warn: (...args: unknown[]) => {
      if (!IS_PROD) console.warn(`[${tag}]`, ...args)
    },
    error: (...args: unknown[]) => {
      // Toujours logger les erreurs côté serveur, même en prod
      if (IS_SERVER) console.error(`[${tag}]`, ...args)
    },
  }
}

export const logger = createLogger('Fotia')

/**
 * Logger tagué pour un module spécifique.
 */
export function createTaggedLogger(tag: string) {
  return createLogger(tag)
}
