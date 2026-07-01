import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { createPresignedDownloadUrl } from '@/lib/r2/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: gallery_id } = await params
  const body = await request.json()
  const { image_id, client_token } = body

  const supabase = await createClient()

  // Verify gallery exists and downloads are allowed
  const { data: gallery } = await supabase
    .from('galleries')
    .select('allow_downloads')
    .eq('id', gallery_id)
    .single()

  if (!gallery?.allow_downloads) {
    return NextResponse.json({ error: 'Downloads not allowed' }, { status: 403 })
  }

  // Get image
  const { data: image } = await supabase
    .from('gallery_images')
    .select('r2_key, original_filename')
    .eq('id', image_id)
    .eq('gallery_id', gallery_id)
    .single()

  if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

  // Log download
  await supabase.from('downloads').insert({
    gallery_id,
    image_id,
    client_token: client_token ?? null,
    quality: 'compressed',
  })

  // Increment download count
  await supabase.rpc('increment_gallery_download_count', { gallery_id_param: gallery_id })

  // Generate presigned download URL (1 hour)
  const download_url = await createPresignedDownloadUrl(image.r2_key, 3600, image.original_filename)

  return NextResponse.json({ download_url, filename: image.original_filename })
}
