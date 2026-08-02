import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  // ── Rate Limiting pour les routes sensibles ────────────────────────────
  const path = request.nextUrl.pathname

  if (
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')
  ) {
    const identifier = getRateLimitKey(request)
    const { success } = await rateLimit(identifier, 'strict')
    if (!success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans quelques instants.' },
        { status: 429 }
      )
    }
  }

  // Routes API générales
  if (path.startsWith('/api/webhooks/')) {
    // Rate limiting spécifique pour les webhooks entrants
    const identifier = getRateLimitKey(request)
    const { success } = await rateLimit(identifier, 'webhook')
    if (!success) {
      return NextResponse.json(
        { error: 'Trop de requêtes.' },
        { status: 429 }
      )
    }
  } else if (path.startsWith('/api/')) {
    // Rate limiting modéré pour les API utilisateurs
    const identifier = getRateLimitKey(request)
    const { success } = await rateLimit(identifier, 'moderate')
    if (!success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
        { status: 429 }
      )
    }
  }

  // ── Session ────────────────────────────────────────────────────────────
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Exclut les fichiers statiques Next.js, ressources publiques,
     * sitemap et robots (pas besoin de session Supabase pour les crawlers).
     * Couvre toutes les routes applicatives dont /dashboard/:path*.
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
