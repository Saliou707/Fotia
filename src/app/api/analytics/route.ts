import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Récupérer toutes les galeries avec stats
  const { data: galleries } = await supabase
    .from('galleries')
    .select('id, title, view_count, favorite_count, download_count, photo_count, created_at, cover_image_url')
    .eq('user_id', user.id)
    .order('view_count', { ascending: false })

  if (!galleries) return NextResponse.json({ galleries: [], totals: null })

  const totals = {
    views: galleries.reduce((s, g) => s + (g.view_count ?? 0), 0),
    favorites: galleries.reduce((s, g) => s + (g.favorite_count ?? 0), 0),
    downloads: galleries.reduce((s, g) => s + (g.download_count ?? 0), 0),
    photos: galleries.reduce((s, g) => s + (g.photo_count ?? 0), 0),
  }

  // Activité récente : vues
  const { data: recentViews } = await supabase
    .from('gallery_views')
    .select('gallery_id, created_at')
    .in('gallery_id', galleries.map(g => g.id))
    .order('created_at', { ascending: false })
    .limit(10)

  // Activité récente : favoris
  const { data: recentFavorites } = await supabase
    .from('favorites')
    .select('gallery_id, created_at')
    .in('gallery_id', galleries.map(g => g.id))
    .order('created_at', { ascending: false })
    .limit(10)

  // Enrichir avec les titres de galeries (lookup local)
  const galleryMap = Object.fromEntries(galleries.map(g => [g.id, { title: g.title }]))

  const enrichedViews = (recentViews ?? []).map(v => ({ ...v, galleries: galleryMap[v.gallery_id] ?? null }))
  const enrichedFavorites = (recentFavorites ?? []).map(f => ({ ...f, galleries: galleryMap[f.gallery_id] ?? null }))

  return NextResponse.json({ galleries, totals, recentViews: enrichedViews, recentFavorites: enrichedFavorites })
}
