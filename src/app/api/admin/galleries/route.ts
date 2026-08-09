import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import { verifyOrigin } from '@/lib/csrf'

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
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

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
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const admin = await requireAdmin(['super_admin', 'admin'])
  const supabase = createAdminClient()
  const { galleryId, status, title } = await request.json()

  if (!galleryId || (!status && !title)) return NextResponse.json({ error: 'galleryId and at least one of status or title required' }, { status: 400 })

  // Fetch existing gallery to detect title change
  const { data: existingGallery } = await supabase.from('galleries').select('title').eq('id', galleryId).single();
  if (!existingGallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });

  // Update gallery fields (title and status if provided)
  const updates: { title?: string; status?: string } = {};
  if (title) updates.title = title;
  if (status) updates.status = status;
  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await supabase.from('galleries').update(updates).eq('id', galleryId);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  await logAdminAction(admin.id, 'PATCH_GALLERY', galleryId);
  return NextResponse.json({ success: true });
}
