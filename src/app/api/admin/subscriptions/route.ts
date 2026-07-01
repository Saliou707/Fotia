import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status') // 'active' | 'expired' | 'canceled' | 'pending' | null
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('subscriptions')
    .select(`
      id, plan, status, billing_cycle, provider, provider_reference,
      started_at, expires_at, created_at, updated_at,
      profiles:user_id (id, email, display_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (status) query = query.eq('status', status)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ subscriptions: data, total: count, page, pageSize })
}
