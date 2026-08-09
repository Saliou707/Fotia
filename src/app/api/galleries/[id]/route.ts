import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'
import { galleryUpdateSchema, validatePayload } from '@/lib/validations'
import { getUserPlan } from '@/lib/limits'
import { verifyOrigin } from '@/lib/csrf'
import { logger } from '@/lib/logger'

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
    return NextResponse.json({ error: 'Galerie introuvable.' }, { status: 404 })
  }

  return NextResponse.json(gallery)
}

// PATCH /api/galleries/:id
// Met à jour une galerie (titre, statut, options…) — validation Zod + propriété.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

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
    return NextResponse.json({ error: 'Galerie introuvable.' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  const validation = validatePayload(galleryUpdateSchema, body)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const fields = validation.data

  // Slug personnalise : reserve aux plans Pro et Studio
  if (fields.slug) {
    const plan = await getUserPlan(supabase, user.id)
    if (plan !== 'pro' && plan !== 'studio') {
      return NextResponse.json({ error: 'La personnalisation du slug est reservee aux plans Pro et Studio.' }, { status: 403 })
    }

    // Verifier l'unicite du slug
    const { data: conflict } = await supabase
      .from('galleries')
      .select('id')
      .eq('slug', fields.slug)
      .neq('id', id)
      .maybeSingle()

    if (conflict) {
      return NextResponse.json({ error: 'Ce slug est deja utilise par une autre galerie.' }, { status: 409 })
    }
  }

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
    logger.error('[Galleries] Update error:', error.message)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la galerie. Veuillez réessayer." }, { status: 500 })
  }

  return NextResponse.json(gallery)
}

// DELETE /api/galleries/:id
// Supprime une galerie (les images DB sont supprimées en cascade ; le nettoyage R2 est assuré par le cron).
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const csrfError = verifyOrigin(_request)
  if (csrfError) return csrfError

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
    return NextResponse.json({ error: 'Galerie introuvable.' }, { status: 404 })
  }

  // Récupérer la taille totale des images AVANT la suppression en cascade
  // (nécessaire pour décrémenter le compteur de stockage du profil).
  // Agrégat PostgREST `sum()` : correct même pour les galeries > 1000 photos
  // (la limite par défaut de `.select()` est de 1000 lignes).
  const { data: sizeData } = await supabase
    .from('gallery_images')
    .select('freed_bytes:sum(file_size_bytes)')
    .eq('gallery_id', id)
    .single()

  const freedBytes = Number(sizeData?.freed_bytes ?? 0)

  const { error } = await supabase
    .from('galleries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    logger.error('[Galleries] Delete error:', error.message)
    return NextResponse.json({ error: "Erreur lors de la suppression de la galerie. Veuillez réessayer." }, { status: 500 })
  }

  // Décrémenter le stockage utilisé du profil (atomique via RPC, plancher 0).
  // Client admin (service_role) obligatoire : le RPC refuse les décréments
  // émanant d'utilisateurs pour éviter de zéroter le compteur (bypass de la
  // limite de stockage). Meilleur effort — ne bloque jamais la suppression.
  if (freedBytes > 0) {
    try {
      const admin = createAdminClient()
      const { error: storageErr } = await admin.rpc('adjust_storage_used', {
        user_id: user.id,
        delta: -freedBytes,
      })

      if (storageErr) {
        logger.warn('[Galleries] Failed to decrement storage_used_bytes:', storageErr.message)
      }
    } catch (err) {
      logger.warn('[Galleries] Failed to decrement storage_used_bytes:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
