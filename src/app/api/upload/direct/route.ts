import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { buildImageKey, buildThumbnailKey, uploadBuffer, getPublicUrl } from '@/lib/r2/client'
import { generateId } from '@/lib/utils'
import { checkCanUploadPhoto } from '@/lib/limits'


export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const gallery_id = formData.get('gallery_id') as string | null

  if (!file || !gallery_id) {
    return NextResponse.json({ error: 'Missing file or gallery_id' }, { status: 400 })
  }

  // Verify gallery ownership
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, user_id, title')
    .eq('id', gallery_id)
    .eq('user_id', user.id)
    .single()

  if (!gallery) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  }

  // Check photo and storage limits
  const uploadCheck = await checkCanUploadPhoto(supabase, user.id, gallery_id, file.size)
  if (!uploadCheck.allowed) {
    return NextResponse.json({ error: uploadCheck.reason, requiresUpgrade: uploadCheck.requiresUpgrade }, { status: 403 })
  }

  // Get current count for display order
  const { count } = await supabase
    .from('gallery_images')
    .select('id', { count: 'exact', head: true })
    .eq('gallery_id', gallery_id)

  const image_id = crypto.randomUUID()
  const r2_key = buildImageKey(user.id, gallery_id, image_id, file.name, gallery.title)

  try {
    // Read file into buffer and upload to R2
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await uploadBuffer(r2_key, buffer, file.type)

    // Register the image in DB
    const { error: insertError } = await supabase.from('gallery_images').insert({
      id: image_id,
      gallery_id,
      user_id: user.id,
      r2_key,
      original_filename: file.name,
      content_type: file.type,
      file_size_bytes: buffer.length,
      display_order: (count ?? 0) + 1,
    })

    if (insertError) {
      console.error('[Upload] DB insert error:', insertError.message)
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 })
    }

    // Increment gallery photo count
    await supabase.rpc('increment_gallery_photo_count', { gallery_id_param: gallery_id })

    // Si c'est la première photo uploadée, on la définit comme couverture
    if ((count ?? 0) === 0) {
      const coverUrl = getPublicUrl(r2_key)
      await supabase.from('galleries').update({ cover_image_url: coverUrl }).eq('id', gallery_id)
    }

    return NextResponse.json({ image_id, r2_key })
  } catch (err) {
    console.error('[Upload] R2 upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}