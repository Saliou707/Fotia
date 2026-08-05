import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { galleryUpdateSchema, validatePayload } from '@/lib/validations'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/galleries/:id
// Récupère une galerie (uniquement si elle appartient à l'utilisateur connecté).
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // NB : password_hash volontairement exclu de la réponse
  const { data: gallery, error } = await supabase
    .from('galleries')
    .select('id, user_id, title, description, slug, cover_image_url, status, is_password_protected, allow_downloads, allow_favorites, watermark_enabled, view_count, download_count, favorite_count, photo_count, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !gallery) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  }

  return NextResponse.json(gallery)
}

// PATCH /api/galleries/:id
// Met à jour une galerie (titre, statut, options…) — validation Zod + propriété.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Vérifier la propriété avant toute écriture
  const { data: existing } = await supabase
    .from('galleries')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  const validation = validatePayload(galleryUpdateSchema, body)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const fields = validation.data

  // Normalisation : description vide → null
  const cleanFields: Record<string, unknown> = { ...fields }
  if ('description' in cleanFields) {
    const d = cleanFields.description
    cleanFields.description = typeof d === 'string' && d.trim() === '' ? null : d
  }

  const { data: gallery, error } = await supabase
    .from('galleries')
    .update(cleanFields)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, user_id, title, description, slug, cover_image_url, status, is_password_protected, allow_downloads, allow_favorites, watermark_enabled, view_count, download_count, favorite_count, photo_count, created_at, updated_at')
    .single()

  if (error) {
    console.error('[Galleries] Update error:', error.message)
    return NextResponse.json({ error: 'Failed to update gallery' }, { status: 500 })
  }

  return NextResponse.json(gallery)
}

// DELETE /api/galleries/:id
// Supprime une galerie (les images DB sont supprimées en cascade ; le nettoyage R2 est assuré par le cron).
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Vérifier la propriété avant toute suppression
  const { data: existing } = await supabase
    .from('galleries')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('galleries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[Galleries] Delete error:', error.message)
    return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
