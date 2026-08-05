import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { profileSchema, validatePayload } from '@/lib/validations'

// GET /api/profile
// Retourne le profil complet de l'utilisateur connecté (incl. compteur de galeries actives).
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profileRes, countRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, phone, instagram, facebook, tiktok, website, bio, avatar_url, plan, storage_used_bytes, onboarding_completed')
      .eq('id', user.id)
      .single(),
    supabase
      .from('galleries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ])
  const { data: profile } = profileRes
  const { count } = countRes

  return NextResponse.json({
    id: user.id,
    email: user.email ?? '',
    ...(profile ?? {}),
    gallery_count: count ?? 0,
  })
}

// PATCH /api/profile
// Met à jour le profil (infos publiques, avatar, onboarding…).
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const validation = validatePayload(profileSchema, body)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  // Normalisation : chaînes vides → null pour les champs texte
  const fields: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(validation.data)) {
    if (typeof value === 'string' && value.trim() === '') {
      fields[key] = null
    } else {
      fields[key] = value
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', user.id)

  if (error) {
    console.error('[Profile] Update error:', error.message)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
