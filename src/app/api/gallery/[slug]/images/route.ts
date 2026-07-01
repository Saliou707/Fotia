import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { listImages, getPublicUrl, buildImageKey } from '@/lib/r2/client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get gallery first
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('id, title, slug, user_id, status, photo_count, allow_downloads, allow_favorites, description, cover_image_url')
    .eq('slug', slug)
    .single()

  if (gallery) {
    // Attempt to load profile with new columns, gracefully degrade if they don't exist yet
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, phone, instagram, website, bio')
      .eq('id', gallery.user_id)
      .single()
    
    ;(gallery as any).profiles = profile || { display_name: null, avatar_url: null }
  }

  if (!gallery) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  }

  // Try to get images from Supabase first
  const { data: dbImages } = await supabase
    .from('gallery_images')
    .select('id, r2_key, original_filename')
    .eq('gallery_id', gallery.id)

  // If we have images in DB, return them
  if (dbImages && dbImages.length > 0) {
    return NextResponse.json({ gallery, images: dbImages })
  }

  // Fallback: list images from R2 directly
  // Build prefix to search: photos/{user_id}/{gallery_id}/
  const prefix = `photos/${gallery.user_id}/${gallery.id}/`

  console.log('[API] Listing images from R2 with prefix:', prefix)

  try {
    const r2Images = await listImages(prefix)
    console.log('[API] R2 images found:', r2Images.length)

    const images = r2Images.map((obj, index) => {
      const key = obj.key
      // Extract filename from key
      const filename = key.split('/').pop() || `image-${index}.jpg`
      // Generate a unique ID using index to ensure uniqueness
      const id = `img-${index}-${key.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15)}`

      return {
        id,
        r2_key: key,
        original_filename: filename,
      }
    })

    return NextResponse.json({ gallery, images })
  } catch (err) {
    console.error('[API] Error fetching from R2:', err)
    return NextResponse.json({ gallery, images: [] })
  }
}