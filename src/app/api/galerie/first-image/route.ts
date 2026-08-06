import { listImages } from '@/lib/r2/client'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')
  const gallery_id = searchParams.get('gallery_id')

  if (!user_id || !gallery_id) {
    return NextResponse.json({ key: null })
  }

  try {
    const prefix = `photos/${user_id}/${gallery_id}/`
    const images = await listImages(prefix)
    // Return the first image key if exists
    return NextResponse.json({ key: images.length > 0 ? images[0].key : null })
  } catch (err) {
    console.error('[FirstImage] Error:', err)
    return NextResponse.json({ key: null })
  }
}