import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // En mode démo (sans Supabase configuré), rediriger vers le dashboard
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

  if (isDemo) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  } catch {
    // Pas de Supabase configuré
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
