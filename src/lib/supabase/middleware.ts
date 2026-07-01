import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Crée la réponse de base une seule fois.
  // IMPORTANT : ne pas recréer supabaseResponse dans setAll pour ne pas
  // perdre les Set-Cookie déjà positionnés lors d'appels successifs.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Propage dans la request (pour les Server Components en aval)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // 2. Recrée la réponse avec la request mutée (cookie lisible côté serveur)
          supabaseResponse = NextResponse.next({ request })
          // 3. Pose les Set-Cookie avec les options complètes (httpOnly, sameSite, etc.)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() est le seul appel qui rafraîchit réellement le token côté serveur.
  // Ne pas remplacer par getSession() qui lit uniquement le cookie sans vérifier
  // la validité du token auprès de Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl
  const isDashboard = url.pathname.startsWith('/dashboard')
  const isAuth =
    url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')

  if (!user && isDashboard) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', url.pathname)
    // On propage les cookies de session même sur redirect pour éviter la boucle
    const redirectResponse = NextResponse.redirect(loginUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  if (user && isAuth) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(dashboardUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  return supabaseResponse
}
