import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  await requireAdmin()
  const supabase = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const startOfLast30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: totalGalleries },
    { data: storageData },
    { data: revenueData },
    { count: newUsersThisMonth },
    { data: signupTrend },
    { data: revenueTrend },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    supabase.from('galleries').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('storage_used_bytes'),
    supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', startOfMonth),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('profiles').select('created_at').gte('created_at', startOfLast30Days).order('created_at'),
    supabase.from('payments').select('amount, created_at').eq('status', 'success').gte('created_at', startOfLast30Days).order('created_at'),
  ])

  const totalStorageBytes = (storageData || []).reduce((acc: number, p: any) => acc + (p.storage_used_bytes || 0), 0)
  const monthlyRevenue = (revenueData || []).reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0)
  const freeUsers = (totalUsers || 0) - (proUsers || 0)
  const conversionRate = freeUsers > 0 ? ((proUsers || 0) / (totalUsers || 1)) * 100 : 0

  // Build 30-day daily signup trend
  const signupByDay: Record<string, number> = {}
  ;(signupTrend || []).forEach((p: any) => {
    const day = new Date(p.created_at).toISOString().slice(0, 10)
    signupByDay[day] = (signupByDay[day] || 0) + 1
  })

  // Build 30-day revenue trend
  const revenueByDay: Record<string, number> = {}
  ;(revenueTrend || []).forEach((p: any) => {
    const day = new Date(p.created_at).toISOString().slice(0, 10)
    revenueByDay[day] = (revenueByDay[day] || 0) + Number(p.amount)
  })

  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
  })

  const signupChart = days30.map(day => ({ date: day, value: signupByDay[day] || 0 }))
  const revenueChart = days30.map(day => ({ date: day, value: revenueByDay[day] || 0 }))

  return NextResponse.json({
    kpis: {
      totalUsers: totalUsers || 0,
      proUsers: proUsers || 0,
      freeUsers,
      totalGalleries: totalGalleries || 0,
      totalStorageBytes,
      monthlyRevenue,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      newUsersThisMonth: newUsersThisMonth || 0,
    },
    charts: {
      signups: signupChart,
      revenue: revenueChart,
    },
  })
}
