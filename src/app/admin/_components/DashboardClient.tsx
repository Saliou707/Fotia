'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Users, TrendingUp, Image, HardDrive,
  DollarSign, Crown, Activity, UserPlus,
  AlertCircle, RefreshCw, Clock, UserCheck, CreditCard, ImageIcon
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { AdminCard, formatBytes, formatNumber } from './ui'

// ─── Types ─────────────────────────────────────────────────────────────────

interface DashboardData {
  kpis: {
    totalUsers: number
    proUsers: number
    freeUsers: number
    totalGalleries: number
    totalStorageBytes: number
    monthlyRevenue: number
    conversionRate: number
    newUsersThisMonth: number
  }
  charts: {
    signups: { date: string; value: number }[]
    revenue: { date: string; value: number }[]
  }
  recentActivity?: {
    type: string
    label: string
    detail: string
    timestamp: string
    accent: string
    icon: string
  }[]
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label, unit = '' }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  unit?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div style={{ color: 'rgba(247,247,245,0.45)' }}>{label}</div>
      <div className="font-bold mt-0.5" style={{ color: '#F2EDE4' }}>
        {payload[0].value.toLocaleString()}{unit}
      </div>
    </div>
  )
}

// ─── Error State ───────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.1)' }}
      >
        <AlertCircle className="w-7 h-7" style={{ color: '#EF4444' }} />
      </div>
      <div className="text-center">
        <div className="font-semibold" style={{ color: '#F2EDE4' }}>Données indisponibles</div>
        <div className="text-sm mt-1" style={{ color: 'rgba(247,247,245,0.4)' }}>
          Impossible de charger les données du dashboard.
        </div>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
        style={{ background: 'var(--fotia-orange)', color: '#fff' }}
      >
        <RefreshCw className="w-4 h-4" />
        Réessayer
      </button>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminDashboardClient({ data: initialData }: { data: DashboardData | null }) {
  const [data, setData] = useState<DashboardData | null>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    // `loading` démarre à `true` (squelette au premier rendu) ; le refetch conserve l'état courant
    setError(false)
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed')
      setData(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch on mount — client-side ensures cookies are properly sent
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch au montage volontaire
    refresh()
  }, [refresh])

  const kpis = data?.kpis
  const charts = data?.charts ?? { signups: [], revenue: [] }
  const isLoading = loading

  const formatChartDate = (d: string) => {
    const dt = new Date(d)
    return `${dt.getDate()}/${dt.getMonth() + 1}`
  }

  const signupData = charts.signups.map(d => ({ ...d, date: formatChartDate(d.date) }))
  const revenueData = charts.revenue.map(d => ({ ...d, date: formatChartDate(d.date) }))

  const recentActivity = data?.recentActivity || []

  const activityIcons: Record<string, React.ElementType> = {
    user: UserCheck, payment: CreditCard, gallery: ImageIcon, webhook: Clock,
  }

  const AXIS_TICK = { fill: 'rgba(247,247,245,0.25)', fontSize: 10, fontFamily: 'Inter' }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Vue d&apos;ensemble de la plateforme Fotia
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/5 disabled:opacity-50"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {error ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AdminCard
              label="Utilisateurs"
              value={isLoading ? '—' : formatNumber(kpis!.totalUsers)}
              sub={`+${kpis?.newUsersThisMonth ?? 0} ce mois`}
              icon={Users}
              loading={isLoading}
            />
            <AdminCard
              label="Premium Pro"
              value={isLoading ? '—' : formatNumber(kpis!.proUsers)}
              sub={`Taux ${kpis?.conversionRate ?? 0}%`}
              icon={Crown}
              accent
              loading={isLoading}
            />
            <AdminCard
              label="Galeries créées"
              value={isLoading ? '—' : formatNumber(kpis!.totalGalleries)}
              icon={Image}
              loading={isLoading}
            />
            <AdminCard
              label="Revenu du mois"
              value={isLoading ? '—' : `${(kpis!.monthlyRevenue ?? 0).toLocaleString()} GNF`}
              sub="Paiements réussis"
              icon={DollarSign}
              loading={isLoading}
            />
            <AdminCard
              label="Stockage utilisé"
              value={isLoading ? '—' : formatBytes(kpis!.totalStorageBytes ?? 0)}
              icon={HardDrive}
              loading={isLoading}
            />
            <AdminCard
              label="Utilisateurs Free"
              value={isLoading ? '—' : formatNumber(kpis!.freeUsers)}
              icon={UserPlus}
              loading={isLoading}
            />
            <AdminCard
              label="Taux conversion"
              value={isLoading ? '—' : `${kpis!.conversionRate ?? 0}%`}
              sub="Free → Pro"
              icon={TrendingUp}
              loading={isLoading}
            />
            <AdminCard
              label="Activité"
              value={isLoading ? '—' : 'Live'}
              sub="Données temps réel"
              icon={Activity}
              loading={isLoading}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Signups */}
            <div
              className="rounded-xl border p-5"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Nouvelles inscriptions
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>30 derniers jours</p>
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: 'var(--fotia-orange)' }}
                >
                  {isLoading ? '—' : signupData.reduce((s, d) => s + d.value, 0)}
                </div>
              </div>
              {isLoading ? (
                <div className="h-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={signupData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C8482E" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#C8482E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#C8482E"
                      strokeWidth={2}
                      fill="url(#signupGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#C8482E', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue */}
            <div
              className="rounded-xl border p-5"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Revenus (GNF)
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>30 derniers jours</p>
                </div>
                <div className="text-lg font-bold" style={{ color: '#22C55E' }}>
                  {isLoading ? '—' : `${revenueData.reduce((s, d) => s + d.value, 0).toLocaleString()} GNF`}
                </div>
              </div>
              {isLoading ? (
                <div className="h-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip unit=" GNF" />} />
                    <Bar dataKey="value" fill="#22C55E" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                label: 'Revenu moyen / utilisateur Pro',
                value: kpis && kpis.proUsers > 0 ? `${Math.round(kpis.monthlyRevenue / kpis.proUsers).toLocaleString()} GNF` : '—',
                icon: '💰',
              },
              {
                label: 'Galeries par utilisateur (moy.)',
                value: kpis && kpis.totalUsers > 0 ? (kpis.totalGalleries / kpis.totalUsers).toFixed(1) : '—',
                icon: '📸',
              },
              {
                label: 'Stockage moyen / utilisateur',
                value: kpis && kpis.totalUsers > 0 ? formatBytes(kpis.totalStorageBytes / kpis.totalUsers) : '—',
                icon: '💾',
              },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-xl border p-4 flex items-center gap-4"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="text-2xl">{stat.icon}</div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                  <div className="font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {isLoading ? '...' : stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Feed */}
          {recentActivity.length > 0 && (
            <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--fotia-orange)' }} />
                Activité récente
              </h2>
              <div className="space-y-2">
                {recentActivity.slice(0, 12).map((a, i) => {
                  const Icon = activityIcons[a.icon] || Clock
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 text-sm border-b last:border-0" style={{ borderColor: 'var(--bg-overlay)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.accent}15` }}>
                        <Icon className="w-4 h-4" style={{ color: a.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span style={{ color: 'var(--text-primary)' }}>{a.label}</span>
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{a.detail}</span>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {new Date(a.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}{' '}
                        {new Date(a.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
