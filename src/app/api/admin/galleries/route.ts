import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import { listImages, downloadObject, uploadBuffer, deleteObject } from '@/lib/r2/client'

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
  const { galleryId, status, title } = await request.json()

  if (!galleryId || (!status && !title)) return NextResponse.json({ error: 'galleryId and at least one of status or title required' }, { status: 400 })

  // Fetch existing gallery to detect title change
  const { data: existingGallery } = await supabase.from('galleries').select('title').eq('id', galleryId).single();
  if (!existingGallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });

  // Update gallery fields (title and status if provided)
  const updates: any = {};
  if (title) updates.title = title;
  if (status) updates.status = status;
  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await supabase.from('galleries').update(updates).eq('id', galleryId);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // If title changed, rename R2 folder and update image keys
  if (title && title !== existingGallery.title) {
    // Helper to create safe folder name (same logic as client)
    const slugToSafeFolder = (slug: string) =>
      slug
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80);

    const oldFolder = slugToSafeFolder(existingGallery.title);
    const newFolder = slugToSafeFolder(title);
    const oldPrefix = `photos/${oldFolder}/`;
    const newPrefix = `photos/${newFolder}/`;

    // List all images under old prefix
    const oldImages = await listImages(oldPrefix);
    for (const img of oldImages) {
      const oldKey = img.key;
      const relativePath = oldKey.replace(oldPrefix, '');
      const newKey = `${newPrefix}${relativePath}`;
      // Download, upload to new key, then delete old key
      const buffer = await downloadObject(oldKey);
      // Infer content type from file extension (fallback to octet-stream)
      const ext = oldKey.split('.').pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
      };
      const contentType = mimeMap[ext ?? ''] || 'application/octet-stream';
      await uploadBuffer(newKey, buffer, contentType);
      await deleteObject(oldKey);
    }

    // Update DB records for gallery_images to new keys
    const { data: images } = await supabase
      .from('gallery_images')
      .select('id, r2_key')
      .eq('gallery_id', galleryId);
    for (const img of images || []) {
      if (img.r2_key && img.r2_key.startsWith(oldPrefix)) {
        const newR2Key = img.r2_key.replace(oldPrefix, newPrefix);
        await supabase.from('gallery_images').update({ r2_key: newR2Key }).eq('id', img.id);
      }
    }
  }

  await logAdminAction(admin.id, `PATCH_GALLERY:${galleryId}`, { title, status });
  return NextResponse.json({ success: true });
}
