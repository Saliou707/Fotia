import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, logAdminAction } from '@/lib/admin'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(['super_admin', 'admin', 'support'])
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const plan = searchParams.get('plan') // 'free' | 'pro' | null
  const status = searchParams.get('status') // 'suspended' | null
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('profiles')
    .select('id, email, display_name, plan, storage_used_bytes, gallery_count, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (plan) query = query.eq('plan', plan)
  if (search) query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ users: data, total: count, page, pageSize })
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(['super_admin', 'admin'])
  const supabase = createAdminClient()
  const { userId, updates } = await request.json()

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const allowedFields = ['plan', 'display_name']
  const filteredUpdates: Record<string, any> = {}
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key]
  }

  const { error } = await supabase.from('profiles').update(filteredUpdates).eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction(admin.id, `PATCH_USER:${JSON.stringify(filteredUpdates)}`, userId)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(['super_admin'])
  const supabase = createAdminClient()
  const { userId } = await request.json()

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  // Delete from auth.users (cascades to profiles)
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction(admin.id, 'DELETE_USER', userId)

  return NextResponse.json({ success: true })
}
