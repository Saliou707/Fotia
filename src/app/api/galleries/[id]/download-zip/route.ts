import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { createPresignedDownloadUrl, downloadObject, uploadBuffer } from '@/lib/r2/client'
import JSZip from 'jszip'
import { verifyOrigin } from '@/lib/csrf'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: gallery_id } = await params
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  let client_token = null

  try {
    const body = await request.json()
    client_token = body.client_token
  } catch {
    // Ignore body parsing errors
  }

  const supabase = await createClient()

  // Verify gallery exists and downloads are allowed
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, title, allow_downloads')
    .eq('id', gallery_id)
    .single()

  if (!gallery) {
    return NextResponse.json({ error: 'Galerie introuvable.' }, { status: 404 })
  }

  if (!gallery.allow_downloads) {
    return NextResponse.json({ error: 'Le téléchargement est désactivé pour cette galerie.' }, { status: 403 })
  }

  // Get all images in the gallery
  const { data: images, error: imagesError } = await supabase
    .from('gallery_images')
    .select('id, r2_key, original_filename')
    .eq('gallery_id', gallery_id)
    .order('display_order', { ascending: true })

  if (imagesError) {
    logger.error('[DownloadZip] Fetch images error:', imagesError)
    return NextResponse.json({ error: "Erreur lors du chargement des photos de la galerie." }, { status: 500 })
  }

  if (!images || images.length === 0) {
    return NextResponse.json({ error: 'Cette galerie ne contient aucune photo.' }, { status: 400 })
  }

  try {
    const zip = new JSZip()
    const seenNames = new Map<string, number>()

    // Download and add each image to the zip
    for (const image of images) {
      try {
        const buffer = await downloadObject(image.r2_key)
        
        let filename = image.original_filename || `photo_${image.id}.jpg`
        // De-duplicate filenames in the ZIP
        if (seenNames.has(filename)) {
          const count = seenNames.get(filename)! + 1
          seenNames.set(filename, count)
          const extIndex = filename.lastIndexOf('.')
          if (extIndex !== -1) {
            filename = `${filename.slice(0, extIndex)}_${count}${filename.slice(extIndex)}`
          } else {
            filename = `${filename}_${count}`
          }
        } else {
          seenNames.set(filename, 0)
        }

        zip.file(filename, buffer)
      } catch (err) {
        logger.error(`[DownloadZip] Failed to download image ${image.id}:`, err)
        // Continue zipping other images even if one fails
      }
    }

    // Generate zip buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // Upload zip to R2
    const zipKey = `temp-zips/${gallery_id}/${gallery_id}.zip`
    await uploadBuffer(zipKey, zipBuffer, 'application/zip')

    // Log download
    await supabase.from('downloads').insert({
      gallery_id,
      client_token: client_token ?? null,
      quality: 'original',
    })

    // Increment download count
    await supabase.rpc('increment_gallery_download_count', { gallery_id_param: gallery_id })

    // Generate presigned URL for the ZIP (valid for 1 hour)
    const download_url = await createPresignedDownloadUrl(zipKey, 3600, 'galerie.zip')

    return NextResponse.json({ download_url })
  } catch (err) {
    logger.error('[DownloadZip] Error creating zip:', err)
    return NextResponse.json({ error: "Erreur lors de la génération de l'archive ZIP." }, { status: 500 })
  }
}
