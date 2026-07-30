import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // En mode démo (sans Supabase configuré), rediriger vers le dashboard
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

  if (isDemo) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Créer la réponse de redirection AVANT l'échange pour que les cookies de session
  // (Set-Cookie) soient bien attachés à cette réponse et suivent le navigateur
  // vers le dashboard. Sans cela, `cookies().set()` de `next/headers` ne propage
  // pas les cookies sur un NextResponse.redirect() créé après coup.
  const response = NextResponse.redirect(`${origin}${next}`)

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return response
  } catch {
    // Pas de Supabase configuré
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
