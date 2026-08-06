import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { listImages, getPublicUrl, buildImageKey } from '@/lib/r2/client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabaseAuth = await createClient()

  // Use service role key to bypass RLS just in case session is missing/rls blocks it
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get gallery first (active only + limit 1 evite les collisions de slug)
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('id, title, slug, user_id, status, photo_count, allow_downloads, allow_favorites, description, cover_image_url')
    .eq('slug', slug)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (!gallery) {
    console.error('[API images] Gallery not found for slug:', slug, 'Error:', galleryError)
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
  }

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || gallery.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!gallery) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  }

  if (gallery) {
    // Load profile, gracefully degrade if columns don't exist yet
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, phone, instagram, website, bio')
      .eq('id', gallery.user_id)
      .single()
    
    ;(gallery as any).profiles = profile || { display_name: null, avatar_url: null }
  }

  // 1. Fetch images from database first (solves issue when gallery is renamed)
  let images: any[] = []
  const { data: dbImages, error: dbError } = await supabase
    .from('gallery_images')
    .select('id, r2_key, original_filename')
    .eq('gallery_id', gallery.id)
    .order('display_order', { ascending: true })

  if (dbImages && dbImages.length > 0) {
    images = dbImages
    return NextResponse.json({ gallery, images })
  }

  // Fallback for legacy galleries (uploaded before gallery_images was implemented)
  if (gallery.photo_count > 0) {
    const folder = gallery.title ? gallery.title.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 80) : gallery.id;
    const prefix = `photos/${folder}/`;

    console.log('[API] Listing legacy images from R2 with prefix:', prefix)

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('R2 listing timed out after 6s')), 6000)
      )
      const r2Images = await Promise.race([
        listImages(prefix),
        timeoutPromise,
      ]) as Awaited<ReturnType<typeof listImages>>

      console.log('[API] R2 images found:', r2Images.length)

      images = r2Images.map((obj, index) => {
        const key = obj.key
        const filename = key.split('/').pop() || `image-${index}.jpg`
        const id = `img-${index}-${key.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15)}`
        return { id, r2_key: key, original_filename: filename }
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[API] R2 fallback failed/timed out:', msg)
    }
  }

  return NextResponse.json({ gallery, images })
}