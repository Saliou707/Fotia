/**
 * CSRF Protection — Fotia
 *
 * Vérifie que l'en-tête Origin (ou Referer) correspond au domaine autorisé.
 * À utiliser sur les routes API sensibles (POST, PUT, DELETE).
 *
 * Usage :
 *   import { verifyOrigin } from '@/lib/csrf'
 *   const error = verifyOrigin(request)
 *   if (error) return error
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://myfotia.com',
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : []),
])

/**
 * Vérifie que la requête provient d'un domaine autorisé.
 * Retourne une NextResponse d'erreur si invalide, ou null si OK.
 */
export function verifyOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Les requêtes sans Origin (ex: curl, fetch interne) sont ignorées
  if (!origin && !referer) return null

  const url = origin || referer || ''
  let hostname: string

  try {
    hostname = new URL(url).hostname
  } catch {
    return NextResponse.json({ error: 'Origin invalide' }, { status: 400 })
  }

  // Permettre les requêtes sans origine (outils internes, cron)
  // Vérifier l'origine uniquement si elle est fournie
  if (origin) {
    const isAllowed =
      ALLOWED_ORIGINS.has(origin) ||
      hostname === 'localhost' ||
      hostname.endsWith('.myfotia.com')

    if (!isAllowed) {
      logger.warn('[CSRF] Origin bloquée:', origin)
      return NextResponse.json(
        { error: 'Requête non autorisée' },
        { status: 403 }
      )
    }
  }

  return null
}
