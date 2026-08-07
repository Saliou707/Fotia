import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl.clone()
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
  }

  // En mode démo (sans Supabase configuré), rediriger vers le dashboard
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

  if (isDemo) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  // Créer la réponse de redirection AVANT l'échange
  const response = NextResponse.redirect(`${requestUrl.origin}${next}`)

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

  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
}
