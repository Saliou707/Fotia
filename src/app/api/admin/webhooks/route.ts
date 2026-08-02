import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const eventType = searchParams.get('eventType') || ''
  const pageSize = 25
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('webhook_events')
    .select('*', { count: 'exact' })
    .order('processed_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (eventType) query = query.eq('event_type', eventType)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Stats : total reçus, succès, échecs
  const { count: totalReceived } = await supabase
    .from('webhook_events')
    .select('id', { count: 'exact', head: true })

  const { count: successCount } = await supabase
    .from('webhook_events')
    .select('id', { count: 'exact', head: true })
    .in('event_type', ['payment.success', 'payment.completed', 'payment.captured'])

  const { count: failureCount } = await supabase
    .from('webhook_events')
    .select('id', { count: 'exact', head: true })
    .in('event_type', ['payment.failed', 'payment.cancelled'])

  return NextResponse.json({
    events: data,
    total: count,
    page,
    pageSize,
    stats: {
      totalReceived: totalReceived || 0,
      successCount: successCount || 0,
      failureCount: failureCount || 0,
    },
  })
}
