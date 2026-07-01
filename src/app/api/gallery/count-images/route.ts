import { listImages } from '@/lib/r2/client'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')
  const gallery_id = searchParams.get('gallery_id')

  if (!user_id || !gallery_id) {
    return NextResponse.json({ count: 0 })
  }

  try {
    const prefix = `photos/${user_id}/${gallery_id}/`
    const images = await listImages(prefix)
    return NextResponse.json({ count: images.length })
  } catch (err) {
    console.error('[CountImages] Error:', err)
    return NextResponse.json({ count: 0 })
  }
}