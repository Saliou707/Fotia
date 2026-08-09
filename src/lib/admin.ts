import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'

export type AdminRole = 'super_admin' | 'admin' | 'support'

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    logger.log('[Admin] No authenticated user found. Error:', userError?.message, 'User:', user?.id)
    return null
  }

  // Use the admin (service-role) client to bypass RLS on admin_users
  const supabaseAdmin = createAdminClient()

  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (adminError || !adminUser) {
    logger.log('[Admin] User is not an admin:', user.id, adminError?.message)
    return null
  }

  logger.log('[Admin] Admin verified:', user.id, '→', adminUser.role)
  return adminUser
}

export async function requireAdmin(allowedRoles?: AdminRole[]) {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    redirect('/login')
  }

  if (allowedRoles && !allowedRoles.includes(adminUser.role as AdminRole)) {
    redirect('/dashboard')
  }

  return adminUser
}

export async function logAdminAction(adminId: string, action: string, targetId?: string) {
  const supabaseAdmin = createAdminClient()
  
  const { error } = await supabaseAdmin
    .from('admin_logs')
    .insert({
      admin_id: adminId,
      action: action,
      target_id: targetId ?? null,
    })

  if (error) {
    logger.error('[Admin Log Error]', error)
  }
}
