import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getPublicUrl, buildThumbnailKey } from '@/lib/r2/client'
import { verifyOrigin } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { image_id, gallery_id } = body

  if (!image_id || !gallery_id) {
    return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  // Fetch the image
  const { data: image } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('id', image_id)
    .eq('user_id', user.id)
    .single()

  if (!image) return NextResponse.json({ error: 'Image introuvable.' }, { status: 404 })

  const r2_thumbnail_key = buildThumbnailKey(gallery_id, image_id)

  // Compute public URLs
  const url = getPublicUrl(image.r2_key)
  const thumbnail_url = getPublicUrl(r2_thumbnail_key)

  // Update image record
  const { data: updated } = await supabase
    .from('gallery_images')
    .update({
      r2_thumbnail_key,
      updated_at: new Date().toISOString(),
    })
    .eq('id', image_id)
    .select('*')
    .single()

  // Update gallery photo count
  await supabase.rpc('increment_gallery_photo_count', { gallery_id_param: gallery_id })

  // Increment user storage usage (atomique via RPC SECURITY DEFINER)
  if (image.file_size_bytes > 0) {
    await supabase.rpc('adjust_storage_used', { user_id: user.id, delta: image.file_size_bytes })
  }

  return NextResponse.json({
    ...updated,
    url,
    thumbnail_url,
  })
}
