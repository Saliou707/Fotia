import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/galleries/:id/favorites/bulk
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: gallery_id } = await params
  const body = await request.json()
  const { image_ids, client_token } = body

  if (!image_ids || !Array.isArray(image_ids) || !client_token) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = await createClient()

  const payload = image_ids.map(image_id => ({
    gallery_id,
    image_id,
    client_token,
  }))

  const { error } = await supabase.from('favorites').upsert(payload, { onConflict: 'gallery_id,image_id,client_token' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update gallery favorite count multiple times or ideally use a custom RPC to increment by N.
  // Since we might be upserting existing favorites, the count logic could be inaccurate if we blindly increment by N.
  // To be safe, we can trigger a recalculation of the favorite count.
  // We'll write a small query to just get the real count for the gallery and update it.
  
  const { count } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('gallery_id', gallery_id)
  if (count !== null) {
    await supabase.from('galleries').update({ favorite_count: count }).eq('id', gallery_id)
  }

  return NextResponse.json({ ok: true })
}
