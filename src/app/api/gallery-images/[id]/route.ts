import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'
import { deleteObject } from '@/lib/r2/client'
import { verifyOrigin } from '@/lib/csrf'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

// DELETE /api/gallery-images/:id
// Supprime une image (ligne DB + objet R2 best-effort).
// Utilisé pour :
//  - nettoyer les uploads abandonnés (ligne pré-enregistrée à l'init mais PUT R2 échoué),
//  - la suppression d'une photo individuelle d'une galerie.
// Les compteurs (photo_count, storage_used_bytes) ne sont décrémentés que si
// l'image avait été confirmée (r2_thumbnail_key défini) — sinon rien n'avait
// été compté, et décrémenter fausserait les compteurs.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const csrfError = verifyOrigin(_request)
  if (csrfError) return csrfError

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: image } = await supabase
    .from('gallery_images')
    .select('id, gallery_id, user_id, r2_key, r2_thumbnail_key, file_size_bytes')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!image) return NextResponse.json({ error: 'Image introuvable.' }, { status: 404 })

  // Suppression best-effort de l'objet R2 — ne bloque jamais la suppression DB
  try {
    await deleteObject(image.r2_key)
  } catch (err) {
    logger.warn('[GalleryImages] R2 delete failed (orphan cleanup):', err)
  }

  const { error } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    logger.error('[GalleryImages] DB delete error:', error.message)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'image. Veuillez réessayer." }, { status: 500 })
  }

  // Décrémenter les compteurs uniquement si l'image était confirmée (comptée).
  // NB : r2_thumbnail_key sert de proxy « image comptée » — la route /api/upload/confirm
  // le pose AU MOMENT où elle incrémente photo_count et storage_used_bytes. Les lignes
  // orphelines (PUT R2 échoué après l'init) n'ont jamais été comptées → pas de décrément.
  // Limite connue : les images importées via les anciens chemins /api/upload/direct et
  // create-with-photos avaient été comptées sans jamais recevoir de clé de miniature ;
  // les supprimer ici ne décrémentera pas leurs compteurs (impact nul aujourd'hui :
  // ces chemins sont obsolètes et aucune UI de suppression d'image n'existe encore).
  if (image.r2_thumbnail_key) {
    await supabase.rpc('decrement_gallery_photo_count', { gallery_id_param: image.gallery_id })

    const sizeBytes = Number(image.file_size_bytes ?? 0)
    if (sizeBytes > 0) {
      try {
        // Client admin (service_role) obligatoire : le RPC refuse les décréments
        // émanant d'utilisateurs (anti-bypass de la limite de stockage).
        const admin = createAdminClient()
        await admin.rpc('adjust_storage_used', { user_id: user.id, delta: -sizeBytes })
      } catch (err) {
        logger.warn('[GalleryImages] Failed to decrement storage_used_bytes:', err)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
