import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get gallery (server-side, bypasses RLS)
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, title, description, photo_count, status')
    .eq('slug', slug)
    .single()

  if (!gallery) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
  }

  return NextResponse.json({ gallery })
}