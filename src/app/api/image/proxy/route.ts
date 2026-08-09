import { getPublicUrl } from '@/lib/r2/client'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

// En production, restreindre l'origine aux domaines autorisés
// Les images doivent pouvoir être chargées depuis n'importe quelle galerie
// → on utilise le domaine parent comme origine dynamique
// ATTENTION : utiliser hostname exact, jamais startsWith() sur l'URL complète
// pour éviter les attaques de type 'myfotia.com.evil.com'
function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      const hostname = new URL(origin).hostname
      const isAllowed =
        hostname === 'myfotia.com' ||
        hostname === 'cdn.fotia.app' ||
        hostname === 'localhost' ||
        hostname === 'localhost:3000' ||
        hostname.endsWith('.myfotia.com') ||
        hostname === new URL(process.env.NEXT_PUBLIC_APP_URL || '').hostname
      if (isAllowed) return origin
    } catch {
      // URL invalide -> fallback
    }
  }
  return 'https://myfotia.com'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
  }

  const imageUrl = getPublicUrl(key)

  // Fetch the image from R2 and return with CORS headers
  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const corsOrigin = getCorsOrigin(request)

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    logger.error('[Image Proxy] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsOrigin = getCorsOrigin(request)
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}