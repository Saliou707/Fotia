import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/galleries
// Liste les galeries de l'utilisateur connecté (authentification serveur).
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('galleries')
    // NB : password_hash volontairement exclu de la réponse
    .select('id, user_id, title, description, slug, cover_image_url, status, is_password_protected, allow_downloads, allow_favorites, watermark_enabled, view_count, download_count, favorite_count, photo_count, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Galleries] List error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
