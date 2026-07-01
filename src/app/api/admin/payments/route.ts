import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status') // 'success' | 'failed' | 'pending' | null
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 25
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('payments')
    .select(`
      id, amount, currency, status, provider, provider_reference, provider_payment_id, created_at,
      profiles:user_id (id, email, display_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (status) query = query.eq('status', status)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Total revenue stats
  const { data: revenueStats } = await supabase
    .from('payments')
    .select('amount, currency')
    .eq('status', 'success')

  const totalRevenue = (revenueStats || []).reduce((acc: number, p: any) => acc + Number(p.amount), 0)

  return NextResponse.json({ payments: data, total: count, page, pageSize, totalRevenue })
}
