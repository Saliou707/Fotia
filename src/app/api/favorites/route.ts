import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface GalleryStat {
  id: string
  title: string
  favorite_count: number
  cover?: string
}

interface FavPhoto {
  id: string
  image_id: string
  gallery_id: string
  created_at: string
  r2_key: string
  original_filename: string
  gallery_title: string
}

// GET /api/favorites
// Retourne les galeries + favoris de l'utilisateur connecté (avec les infos image).
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1. Galeries de l'utilisateur, triées par favoris
  const { data: myGalleries } = await supabase
    .from('galleries')
    .select('id, title, favorite_count')
    .eq('user_id', user.id)
    .order('favorite_count', { ascending: false })

  if (!myGalleries || myGalleries.length === 0) {
    return NextResponse.json({ galleries: [], photos: [] })
  }

  const galleryIds = myGalleries.map(g => g.id)

  // 2. Favoris liés (avec image)
  const { data: favs } = await supabase
    .from('favorites')
    .select('id, image_id, gallery_id, created_at, gallery_images(r2_key, original_filename)')
    .in('gallery_id', galleryIds)
    .order('created_at', { ascending: false })
    .limit(500)

  const photos: FavPhoto[] = (favs ?? [])
    .filter(f => f.gallery_images)
    .map(f => {
      const img = (Array.isArray(f.gallery_images) ? f.gallery_images[0] : f.gallery_images) as { r2_key: string; original_filename: string }
      const galleryTitle = myGalleries.find(g => g.id === f.gallery_id)?.title ?? '–'
      return {
        id: f.id,
        image_id: f.image_id,
        gallery_id: f.gallery_id,
        created_at: f.created_at,
        r2_key: img.r2_key,
        original_filename: img.original_filename,
        gallery_title: galleryTitle,
      }
    })

  // 3. Enrichir les galeries avec la cover (première photo favorite)
  const galleries: GalleryStat[] = myGalleries.map(g => {
    const firstFav = photos.find(p => p.gallery_id === g.id)
    return { ...g, cover: firstFav?.r2_key }
  })

  return NextResponse.json({ galleries, photos })
}
