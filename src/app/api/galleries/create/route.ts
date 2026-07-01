import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateId } from '@/lib/utils'
import { checkCanCreateGallery } from '@/lib/limits'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description } = body

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  // Check gallery creation limits
  const galleryCheck = await checkCanCreateGallery(supabase, user.id)
  if (!galleryCheck.allowed) {
    return NextResponse.json({ error: galleryCheck.reason, requiresUpgrade: galleryCheck.requiresUpgrade }, { status: 403 })
  }

  // Generate unique slug
  const slug = generateId(12)

  // Create gallery
  const { data: gallery, error } = await supabase
    .from('galleries')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      slug,
      status: 'active',
    })
    .select('id, slug, title, created_at')
    .single()

  if (error) {
    console.error('[Galleries] Create error:', error)
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
  }

  return NextResponse.json({
    id: gallery.id,
    slug: gallery.slug,
    title: gallery.title,
    created_at: gallery.created_at,
  })
}