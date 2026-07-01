import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { buildImageKey, createPresignedUploadUrl } from '@/lib/r2/client'
import { generateId } from '@/lib/utils'
import { checkCanUploadPhoto } from '@/lib/limits'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { filename, content_type, file_size_bytes, gallery_id } = body

  if (!filename || !content_type || !gallery_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify gallery ownership
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, user_id, title')
    .eq('id', gallery_id)
    .eq('user_id', user.id)
    .single()

  if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })

  // Check photo and storage limits
  const uploadCheck = await checkCanUploadPhoto(supabase, user.id, gallery_id, file_size_bytes ?? 0)
  if (!uploadCheck.allowed) {
    return NextResponse.json({ error: uploadCheck.reason, requiresUpgrade: uploadCheck.requiresUpgrade }, { status: 403 })
  }

  // Get current count for display order
  const { count } = await supabase
    .from('gallery_images')
    .select('id', { count: 'exact', head: true })
    .eq('gallery_id', gallery_id)

  const image_id = generateId()
  const r2_key = buildImageKey(user.id, gallery_id, image_id, filename, gallery.title)

  // Create a presigned upload URL
  const upload_url = await createPresignedUploadUrl(r2_key, content_type)

  // Pre-register the image in DB (pending state)
  await supabase.from('gallery_images').insert({
    id: image_id,
    gallery_id,
    user_id: user.id,
    r2_key,
    original_filename: filename,
    content_type,
    file_size_bytes: file_size_bytes ?? 0,
    display_order: (count ?? 0) + 1,
  })

  return NextResponse.json({ image_id, upload_url, r2_key })
}
