import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin(['super_admin', 'admin', 'support'])
  const supabase = createAdminClient()
  const { id } = await params

  const [
    { data: profile },
    { data: galleries },
    { data: subscription },
    { data: payments },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('galleries').select('id, title, photo_count, view_count, status, created_at').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('payments').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const totalPhotos = (galleries || []).reduce((acc: number, g: any) => acc + (g.photo_count || 0), 0)

  return NextResponse.json({
    profile,
    galleries: galleries || [],
    totalGalleries: (galleries || []).length,
    totalPhotos,
    subscription: subscription || null,
    payments: payments || [],
  })
}
