import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { createPresignedDownloadUrl, downloadObject, uploadBuffer } from '@/lib/r2/client'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { favoriteIds } = await request.json()
    if (!favoriteIds || !Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      return NextResponse.json({ error: 'No favorites selected' }, { status: 400 })
    }

    // 1. Fetch details of the requested favorites
    const { data: favs, error: favsError } = await supabase
      .from('favorites')
      .select('id, image_id, gallery_images(r2_key, original_filename)')
      .in('id', favoriteIds)

    if (favsError || !favs) {
      console.error('[DownloadFavsZip] Fetch favs error:', favsError)
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
    }

    if (favs.length === 0) {
      return NextResponse.json({ error: 'No valid favorites found' }, { status: 400 })
    }

    const zip = new JSZip()
    const seenNames = new Map<string, number>()

    // 2. Download and add each image to the zip
    for (const fav of favs) {
      try {
        const img = Array.isArray(fav.gallery_images) ? fav.gallery_images[0] : fav.gallery_images
        if (!img) continue;
        
        const buffer = await downloadObject(img.r2_key)
        
        let filename = img.original_filename || `photo_${fav.image_id}.jpg`
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
        console.error(`[DownloadFavsZip] Failed to download image ${fav.image_id}:`, err)
      }
    }

    // 3. Generate zip buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // 4. Upload zip to R2 (temp folder)
    const timestamp = Date.now()
    const zipKey = `temp-zips/favorites_${user.id}_${timestamp}.zip`
    await uploadBuffer(zipKey, zipBuffer, 'application/zip')

    // 5. Generate presigned URL for the ZIP (valid for 1 hour)
    const download_url = await createPresignedDownloadUrl(zipKey, 3600, 'favoris.zip')

    return NextResponse.json({ download_url })
  } catch (err) {
    console.error('[DownloadFavsZip] Error creating zip:', err)
    return NextResponse.json({ error: 'Failed to generate ZIP archive' }, { status: 500 })
  }
}
