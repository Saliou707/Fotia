import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { buildImageKey, uploadBuffer } from '@/lib/r2/client'
import { generateId } from '@/lib/utils'
import { checkCanCreateGallery, checkCanUploadPhoto } from '@/lib/limits'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()

  const title = formData.get('title') as string | null
  const clientName = formData.get('client_name') as string | null
  const files = formData.getAll('files') as File[]

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  // Check gallery creation limits
  const galleryCheck = await checkCanCreateGallery(supabase, user.id)
  if (!galleryCheck.allowed) {
    return NextResponse.json({ error: galleryCheck.reason, requiresUpgrade: galleryCheck.requiresUpgrade }, { status: 403 })
  }

  // Create gallery first
  const slug = generateId(12)

  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: clientName?.trim() || null,
      slug,
      status: 'active',
    })
    .select('id, slug, title, created_at')
    .single()

  if (galleryError) {
    console.error('[CreateGallery] Error:', galleryError)
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
  }

  // Upload photos if any
  const uploadedImages = []
  const errors = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file || !file.name) continue

    try {
      const image_id = generateId()
      console.log('[CreateGallery] Processing file:', file.name, 'image_id:', image_id, 'gallery_id:', gallery.id)
      const r2_key = buildImageKey(user.id, gallery.id, image_id, file.name, gallery.title)

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await uploadBuffer(r2_key, buffer, file.type)
      console.log('[CreateGallery] Uploaded to R2:', r2_key)

      const { data: insertData, error: insertError } = await supabase.from('gallery_images').insert({
        id: image_id,
        gallery_id: gallery.id,
        user_id: user.id,
        r2_key,
        original_filename: file.name,
        content_type: file.type,
        file_size_bytes: buffer.length,
        display_order: i + 1,
      }).select()

      console.log('[CreateGallery] Insert result:', insertData, 'Error:', insertError)

      if (insertError) {
        console.error('[CreateGallery] DB insert error:', insertError)
        errors.push({ filename: file.name, error: 'Database insert failed: ' + insertError.message })
        continue
      }

      uploadedImages.push({ id: image_id, filename: file.name })
    } catch (err) {
      console.error('[CreateGallery] Upload error:', err)
      errors.push({ filename: file.name, error: 'Upload failed' })
    }
  }

  // Update photo count
  if (uploadedImages.length > 0) {
    await supabase
      .from('galleries')
      .update({ photo_count: uploadedImages.length, updated_at: new Date().toISOString() })
      .eq('id', gallery.id)
  }

  return NextResponse.json({
    gallery: {
      id: gallery.id,
      slug: gallery.slug,
      title: gallery.title,
      photo_count: uploadedImages.length,
    },
    uploaded: uploadedImages,
    errors,
  })
}