import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyOrigin } from '@/lib/csrf'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/galleries/:id/view
// Appelé par le client lors du premier chargement de la galerie.
// Utilise client_token pour garantir l'unicité : 1 vue par session.
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: gallery_id } = await params

  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const body = await request.json().catch(() => ({}))
  const { client_token } = body as { client_token?: string }

  if (!client_token) {
    return NextResponse.json({ error: 'Missing client_token' }, { status: 400 })
  }

  // Validation basique du format UUID de gallery_id
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gallery_id)) {
    return NextResponse.json({ error: 'Invalid gallery id' }, { status: 400 })
  }

  const supabase = await createClient()

  // Appel de la fonction RPC qui gère l'unicité et l'incrément atomiquement.
  // Elle ne retourne pas d'erreur si le client a déjà vu la galerie.
  const { error } = await supabase.rpc('increment_gallery_view_count', {
    gallery_id_param: gallery_id,
    client_token_param: client_token,
  })

  if (error) {
    console.error('[Track View] RPC error:', error.message)
    // Ne pas bloquer le client si le tracking échoue
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
