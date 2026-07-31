import { NextResponse } from 'next/server'
import { listImages, deleteObject } from '@/lib/r2/client'
import { createClient } from '@supabase/supabase-js'
import { createHash, timingSafeEqual } from 'node:crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 1. Vérification du token de sécurité CRON
    // ⚠️ Fail-closed : pas de secret par défaut. CRON_SECRET DOIT être défini
    // sur le serveur (Vercel Dashboard → Environment Variables).
    // .trim() : défense contre un espace/saut de ligne accidentel collé avec la valeur
    // (Vercel refuse le déploiement si l'env var contient du whitespace aux extrémités).
    const rawSecret = process.env.CRON_SECRET ?? ''
    const cronSecret = rawSecret.trim()
    if (cronSecret !== rawSecret) {
      console.warn('[CRON R2 Cleanup] CRON_SECRET contient des espaces/sauts de ligne aux extrémités (nettoyés automatiquement — corrigez la valeur dans Vercel)')
    }
    if (!cronSecret) {
      console.error('[CRON R2 Cleanup] CRON_SECRET non défini sur le serveur')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('authorization')
    const expected = `Bearer ${cronSecret}`

    // Comparaison en temps constant (anti timing attack).
    // On compare des hash SHA-256 des deux côtés : normalise la longueur
    // (pas de fuite de la taille du secret par timing) et permet à
    // timingSafeEqual de fonctionner sans pré-vérification de longueur.
    const actualHash = createHash('sha256').update(authHeader ?? '').digest()
    const expectedHash = createHash('sha256').update(expected).digest()
    const isAuthorized = timingSafeEqual(actualHash, expectedHash)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Initialisation du client Supabase
    // ⚠️ Clé service_role OBLIGATOIRE — jamais de fallback vers la clé anon :
    // la politique RLS "Anyone can view images in active galleries" ne renverrait
    // que les images des galeries actives → le cron supprimerait TOUTES les
    // photos des galeries draft/archivées (perte de données).
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[CRON R2 Cleanup] SUPABASE_SERVICE_ROLE_KEY non définie sur le serveur')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Récupération de toutes les clés d'images enregistrées en base
    const { data: dbImages, error: dbError } = await supabase
      .from('gallery_images')
      .select('r2_key, r2_thumbnail_key')

    if (dbError) {
      console.error('[CRON R2 Cleanup] Erreur lors de la lecture DB :', dbError)
      return NextResponse.json({ error: 'Erreur lors de la lecture DB' }, { status: 500 })
    }

    const registeredKeys = new Set<string>()
    dbImages?.forEach((img) => {
      if (img.r2_key) registeredKeys.add(img.r2_key)
      if (img.r2_thumbnail_key) registeredKeys.add(img.r2_thumbnail_key)
    })

    // 3. Scan des fichiers stockés sur Cloudflare R2
    const photoObjects = await listImages('photos/')
    const thumbnailObjects = await listImages('thumbnails/')
    const allR2Objects = [...photoObjects, ...thumbnailObjects]

    // 4. Identification des fichiers orphelins (absents de la DB)
    const orphanKeys: string[] = []
    for (const obj of allR2Objects) {
      if (obj.key && !registeredKeys.has(obj.key)) {
        orphanKeys.push(obj.key)
      }
    }

    // 5. Suppression des objets orphelins
    let deletedCount = 0
    const errors: string[] = []

    for (const key of orphanKeys) {
      try {
        await deleteObject(key)
        deletedCount++
      } catch (err: any) {
        console.error(`[CRON R2 Cleanup] Échec de la suppression de ${key} :`, err)
        errors.push(key)
      }
    }

    return NextResponse.json({
      success: true,
      scannedTotal: allR2Objects.length,
      orphansFound: orphanKeys.length,
      deletedCount,
      failedKeys: errors,
    })
  } catch (err: any) {
    console.error('[CRON R2 Cleanup] Erreur inattendue :', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}
