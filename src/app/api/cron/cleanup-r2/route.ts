import { NextResponse } from 'next/server'
import { listImages, deleteObject } from '@/lib/r2/client'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 1. Vérification du token de sécurité CRON
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret-fotia'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Initialisation du client Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
