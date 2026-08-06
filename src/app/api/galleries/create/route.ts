import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateId, slugify } from '@/lib/utils'
import { checkCanCreateGallery, getUserPlan } from '@/lib/limits'
import { gallerySchema, validatePayload } from '@/lib/validations'
import { verifyOrigin } from '@/lib/csrf'

/**
 * Génère un slug unique à partir du titre.
 * Si le slug est déjà pris, ajoute un suffixe -2, -3, etc.
 */
async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const { data: existing } = await supabase
      .from('galleries')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) return slug

    // Slug déjà pris → ajouter un suffixe numérique
    slug = `${baseSlug}-${suffix}`
    suffix++

    // Sécurité : éviter une boucle infinie
    if (suffix > 100) {
      return `${baseSlug}-${generateId(8)}`
    }
  }
}

export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const validation = validatePayload(gallerySchema, body)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { title, description, slug: customSlug } = validation.data

  // Check gallery creation limits
  const galleryCheck = await checkCanCreateGallery(supabase, user.id)
  if (!galleryCheck.allowed) {
    return NextResponse.json({ error: galleryCheck.reason, requiresUpgrade: galleryCheck.requiresUpgrade }, { status: 403 })
  }

  // Slug : technique (nanoid) pour Free, lisible depuis le titre pour Pro/Studio
  const plan = await getUserPlan(supabase, user.id)
  const isPro = plan === 'pro' || plan === 'studio'
  const baseSlug = slugify(title.trim()) || generateId(8)

  const targetSlug = isPro
    ? (customSlug ? (slugify(customSlug) || baseSlug) : baseSlug)
    : generateId(12)

  // Créer la galerie avec retry en cas de collision unique (race condition)
  let slug = await generateUniqueSlug(supabase, targetSlug)
  let retries = 0
  const MAX_RETRIES = 5

  while (retries <= MAX_RETRIES) {
    const { data: gallery, error } = await supabase
      .from('galleries')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        slug,
        status: 'active',
      })
      .select('id, slug, title, created_at')
      .single()

    if (!error) {
      return NextResponse.json({
        id: gallery.id,
        slug: gallery.slug,
        title: gallery.title,
        created_at: gallery.created_at,
      })
    }

    // Si violation de contrainte unique → retry avec un nouveau suffixe
    if (error.code === '23505') {
      retries++
      slug = `${targetSlug}-${generateId(6)}`
      continue
    }

    console.error('[Galleries] Create error:', error)
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
  }

  return NextResponse.json({ error: 'Failed to create gallery after retries' }, { status: 500 })
}