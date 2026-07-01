import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, logAdminAction } from '@/lib/admin'

export async function GET(request: NextRequest) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('galleries')
    .select(`
      id, title, slug, status, photo_count, view_count, favorite_count, download_count, created_at,
      profiles:user_id (id, email, display_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (search) query = query.ilike('title', `%${search}%`)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ galleries: data, total: count, page, pageSize })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(['super_admin', 'admin'])
  const supabase = createAdminClient()
  const { galleryId } = await request.json()

  if (!galleryId) return NextResponse.json({ error: 'galleryId required' }, { status: 400 })

  const { error } = await supabase.from('galleries').delete().eq('id', galleryId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction(admin.id, 'DELETE_GALLERY', galleryId)

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(['super_admin', 'admin'])
  const supabase = createAdminClient()
  const { galleryId, status } = await request.json()

  if (!galleryId || !status) return NextResponse.json({ error: 'galleryId and status required' }, { status: 400 })

  const { error } = await supabase.from('galleries').update({ status }).eq('id', galleryId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction(admin.id, `PATCH_GALLERY_STATUS:${status}`, galleryId)

  return NextResponse.json({ success: true })
}
