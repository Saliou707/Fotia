import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/galleries/:id/favorites
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: gallery_id } = await params
  const body = await request.json()
  const { image_id, client_token } = body

  if (!image_id || !client_token) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase.from('favorites').upsert({
    gallery_id,
    image_id,
    client_token,
  }, { onConflict: 'gallery_id,image_id,client_token' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update gallery favorite count
  await supabase.rpc('increment_gallery_favorite_count', { gallery_id_param: gallery_id })

  return NextResponse.json({ ok: true })
}

// DELETE /api/galleries/:id/favorites
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: gallery_id } = await params
  const body = await request.json()
  const { image_id, client_token } = body

  if (!image_id || !client_token) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = await createClient()

  await supabase.from('favorites')
    .delete()
    .eq('gallery_id', gallery_id)
    .eq('image_id', image_id)
    .eq('client_token', client_token)

  // Decrement count
  await supabase.rpc('decrement_gallery_favorite_count', { gallery_id_param: gallery_id })

  return NextResponse.json({ ok: true })
}
