import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { uploadBuffer } from '@/lib/r2/client'
import { verifyOrigin } from '@/lib/csrf'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Données du formulaire invalides.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const key = `avatars/${user.id}/avatar_${Date.now()}.${ext}`

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    await uploadBuffer(key, buffer, file.type)
    
    return NextResponse.json({ key })
  } catch (err) {
    logger.error('[Avatar Upload] error:', err)
    return NextResponse.json({ error: "Échec de l'envoi de la photo. Veuillez réessayer." }, { status: 500 })
  }
}
