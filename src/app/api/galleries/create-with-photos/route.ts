import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { buildImageKey, uploadBuffer } from '@/lib/r2/client'
import { generateId } from '@/lib/utils'
import { checkCanCreateGallery } from '@/lib/limits'
import { verifyOrigin } from '@/lib/csrf'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

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
    return NextResponse.json({ error: 'Le titre de la galerie est requis.' }, { status: 400 })
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
    logger.error('[CreateGallery] Error:', galleryError)
    return NextResponse.json({ error: 'Erreur lors de la création de la galerie. Veuillez réessayer.' }, { status: 500 })
  }

  // Upload photos if any
  const uploadedImages = []
  const errors = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file || !file.name) continue

    try {
      const image_id = generateId()
      logger.log('[CreateGallery] Processing file:', file.name, 'image_id:', image_id, 'gallery_id:', gallery.id)
      const r2_key = buildImageKey(gallery.id, image_id, file.name)

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await uploadBuffer(r2_key, buffer, file.type)
      logger.log('[CreateGallery] Uploaded:', image_id)

      const { error: insertError } = await supabase.from('gallery_images').insert({
        id: image_id,
        gallery_id: gallery.id,
        user_id: user.id,
        r2_key,
        original_filename: file.name,
        content_type: file.type,
        file_size_bytes: buffer.length,
        display_order: i + 1,
      })

      logger.log('[CreateGallery] Insert ok:', image_id)

      if (insertError) {
        logger.error('[CreateGallery] DB insert error:', insertError)
        errors.push({ filename: file.name, error: "Échec de l'enregistrement de l'image en base." })
        continue
      }

      uploadedImages.push({ id: image_id, filename: file.name })
    } catch (err) {
      logger.error('[CreateGallery] Upload error:', err)
      errors.push({ filename: file.name, error: "Échec de l'envoi de l'image." })
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