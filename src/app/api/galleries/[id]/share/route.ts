import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyOrigin } from '@/lib/csrf'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: gallery_id } = await params
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const body = await request.json()
  const { platform } = body

  const supabase = await createClient()

  await supabase.from('share_logs').insert({
    gallery_id,
    platform: platform ?? 'whatsapp',
  })

  return NextResponse.json({ ok: true })
}
