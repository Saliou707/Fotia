import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

interface RecentUser {
  display_name: string | null
  email: string | null
  plan: string
  created_at: string
}

type EmbeddedProfile = { email: string | null; display_name: string | null } | null

interface RecentPayment {
  amount: number
  currency: string
  status: string
  created_at: string
  profiles: EmbeddedProfile[]
}

interface RecentGallery {
  title: string
  created_at: string
  profiles: EmbeddedProfile[]
}

interface RecentWebhook {
  event_type: string
  processed_at: string
}

function buildRecentActivity(
  recentUsers: RecentUser[] | null,
  recentPayments: RecentPayment[] | null,
  recentGalleries: RecentGallery[] | null,
  recentWebhooks: RecentWebhook[] | null,
) {
  const activity: { type: string; label: string; detail: string; timestamp: string; accent: string; icon: string }[] = []

  ;(recentUsers || []).forEach((u) => {
    activity.push({
      type: 'user',
      label: `${u.display_name || u.email?.split('@')[0]} s'est inscrit`,
      detail: u.plan === 'pro' ? 'Premium Pro' : 'Essentiel',
      timestamp: u.created_at,
      accent: '#3b82f6',
      icon: 'user',
    })
  })

  const profileName = (profiles: EmbeddedProfile[]) =>
    profiles?.[0]?.display_name || profiles?.[0]?.email?.split('@')[0] || 'Utilisateur'

  ;(recentPayments || []).forEach((p) => {
    const name = profileName(p.profiles)
    activity.push({
      type: 'payment',
      label: `Paiement ${p.status === 'success' ? 'réussi' : p.status}`,
      detail: `${name} · ${Number(p.amount).toLocaleString()} ${p.currency}`,
      timestamp: p.created_at,
      accent: p.status === 'success' ? '#22C55E' : '#EF4444',
      icon: 'payment',
    })
  })

  ;(recentGalleries || []).forEach((g) => {
    const name = profileName(g.profiles)
    activity.push({
      type: 'gallery',
      label: `Galerie créée`,
      detail: `${g.title} par ${name}`,
      timestamp: g.created_at,
      accent: '#f59e0b',
      icon: 'gallery',
    })
  })

  ;(recentWebhooks || []).forEach((w) => {
    const isSuccess = ['payment.success', 'payment.completed', 'payment.captured'].includes(w.event_type)
    activity.push({
      type: 'webhook',
      label: `Webhook ${w.event_type}`,
      detail: isSuccess ? 'Succès' : 'Événement',
      timestamp: w.processed_at,
      accent: isSuccess ? '#22C55E' : '#f59e0b',
      icon: 'webhook',
    })
  })

  return activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15)
}

export async function GET() {
  await requireAdmin()
  const supabase = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
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
    { data: recentUsers },
    { data: recentPayments },
    { data: recentGalleries },
    { data: recentWebhooks },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    supabase.from('galleries').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('storage_used_bytes'),
    supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', startOfMonth),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('profiles').select('created_at').gte('created_at', startOfLast30Days).order('created_at'),
    supabase.from('payments').select('amount, created_at').eq('status', 'success').gte('created_at', startOfLast30Days).order('created_at'),
    supabase.from('profiles').select('email, display_name, plan, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('amount, currency, status, created_at, profiles(email, display_name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('galleries').select('title, created_at, profiles(email, display_name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('webhook_events').select('event_type, processed_at').order('processed_at', { ascending: false }).limit(5),
  ])

  const totalStorageBytes = (storageData || []).reduce((acc: number, p: { storage_used_bytes: number | null }) => acc + (p.storage_used_bytes || 0), 0)
  const monthlyRevenue = (revenueData || []).reduce((acc: number, p: { amount: number }) => acc + (Number(p.amount) || 0), 0)
  const freeUsers = (totalUsers || 0) - (proUsers || 0)
  const conversionRate = freeUsers > 0 ? ((proUsers || 0) / (totalUsers || 1)) * 100 : 0

  // Build 30-day daily signup trend
  const signupByDay: Record<string, number> = {}
  ;(signupTrend || []).forEach((p: { created_at: string }) => {
    const day = new Date(p.created_at).toISOString().slice(0, 10)
    signupByDay[day] = (signupByDay[day] || 0) + 1
  })

  // Build 30-day revenue trend
  const revenueByDay: Record<string, number> = {}
  ;(revenueTrend || []).forEach((p: { amount: number; created_at: string }) => {
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
    recentActivity: buildRecentActivity(recentUsers, recentPayments, recentGalleries, recentWebhooks),
  })
}
