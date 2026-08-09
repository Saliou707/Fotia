import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  await requireAdmin()
  const supabase = createAdminClient()

  type StorageProfile = {
    id: string
    email: string | null
    display_name: string | null
    storage_used_bytes: number | null
    gallery_count: number | null
    plan: string
  }
  type TopGallery = {
    id: string
    title: string
    photo_count: number | null
    view_count: number | null
    status: string
    profiles: { email: string | null; display_name: string | null }[] | null
  }

  const [
    { data: profiles },
    { data: topGalleries },
    { count: totalPhotos },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, display_name, storage_used_bytes, gallery_count, plan')
      .order('storage_used_bytes', { ascending: false })
      .limit(20),
    supabase
      .from('galleries')
      .select(`
        id, title, photo_count, view_count, status,
        profiles:user_id (email, display_name),
        total_size:gallery_images(file_size_bytes.sum())
      `)
      .order('photo_count', { ascending: false })
      .limit(20),
    supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
  ])

  const totalStorageBytes = (profiles || []).reduce((acc: number, p: StorageProfile) => acc + (p.storage_used_bytes || 0), 0)

  // Top 20 users by storage
  const topUsersByStorage = (profiles || []).map((p: StorageProfile) => ({
    id: p.id,
    email: p.email,
    display_name: p.display_name,
    plan: p.plan,
    storage_used_bytes: p.storage_used_bytes || 0,
    gallery_count: p.gallery_count || 0,
  }))

  // Top 20 galleries by photo count
  const topGalleriesBySize = (topGalleries || []).map((g: TopGallery) => ({
    id: g.id,
    title: g.title,
    photo_count: g.photo_count || 0,
    view_count: g.view_count || 0,
    status: g.status,
    owner: g.profiles?.[0] ?? null,
  }))

  return NextResponse.json({
    totalStorageBytes,
    totalPhotos: totalPhotos || 0,
    topUsersByStorage,
    topGalleriesBySize,
  })
}
