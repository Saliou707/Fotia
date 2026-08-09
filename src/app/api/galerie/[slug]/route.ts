import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get gallery (server-side, bypasses RLS)
  // .eq('status','active') evite les collisions de slug entre comptes
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, title, description, photo_count, status')
    .eq('slug', slug)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!gallery) {
    return NextResponse.json({ error: 'Galerie introuvable.' }, { status: 404 })
  }

  return NextResponse.json({ gallery })
}