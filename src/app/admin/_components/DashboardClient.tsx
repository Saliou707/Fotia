'use client'

import {
  Users, TrendingUp, Image, HardDrive,
  DollarSign, Crown, Activity, UserPlus
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function KPICard({
  label, value, sub, icon: Icon, accent = false, loading = false
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: boolean
  loading?: boolean
}) {
  return (
    <div
      className="relative rounded-xl border p-5 flex flex-col gap-3 overflow-hidden transition-all hover:border-white/10 group"
      style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Glow */}
      {accent && (
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ background: '#C8482E' }} />
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(247,247,245,0.4)' }}>{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: accent ? 'rgba(200,72,46,0.15)' : 'rgba(255,255,255,0.05)' }}
        >
          <Icon className="w-4 h-4" style={{ color: accent ? '#C8482E' : 'rgba(247,247,245,0.5)' }} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 rounded-md animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
      ) : (
        <div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: '#F7F7F5' }}>{value}</div>
          {sub && <div className="text-xs mt-0.5" style={{ color: 'rgba(247,247,245,0.35)' }}>{sub}</div>}
        </div>
      )}
    </div>
  )
}

const CHART_STYLE = {
  background: 'transparent',
  fontSize: 11,
  color: 'rgba(247,247,245,0.4)',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div style={{ color: 'rgba(247,247,245,0.5)' }}>{label}</div>
        <div className="font-semibold mt-0.5" style={{ color: '#F7F7F5' }}>{payload[0].value}</div>
      </div>
    )
  }
  return null
}

export default function AdminDashboardClient({ data }: { data: any }) {
  const kpis = data?.kpis ?? {}
  const charts = data?.charts ?? { signups: [], revenue: [] }
  const loading = !data

  const formatDate = (d: string) => {
    const dt = new Date(d)
    return `${dt.getDate()}/${dt.getMonth() + 1}`
  }

  const signupData = (charts.signups || []).map((d: any) => ({ ...d, date: formatDate(d.date) }))
  const revenueData = (charts.revenue || []).map((d: any) => ({ ...d, date: formatDate(d.date) }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#F7F7F5' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(247,247,245,0.4)' }}>Vue d'ensemble de la plateforme Fotia</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Utilisateurs totaux"
          value={loading ? '...' : kpis.totalUsers?.toLocaleString()}
          sub={`+${kpis.newUsersThisMonth ?? 0} ce mois`}
          icon={Users}
          loading={loading}
        />
        <KPICard
          label="Premium Pro"
          value={loading ? '...' : kpis.proUsers?.toLocaleString()}
          sub={`Taux ${kpis.conversionRate ?? 0}%`}
          icon={Crown}
          accent
          loading={loading}
        />
        <KPICard
          label="Galeries créées"
          value={loading ? '...' : kpis.totalGalleries?.toLocaleString()}
          icon={Image}
          loading={loading}
        />
        <KPICard
          label="Revenu du mois"
          value={loading ? '...' : `${(kpis.monthlyRevenue ?? 0).toLocaleString()} XOF`}
          sub="Paiements réussis"
          icon={DollarSign}
          loading={loading}
        />
        <KPICard
          label="Stockage total"
          value={loading ? '...' : formatBytes(kpis.totalStorageBytes ?? 0)}
          icon={HardDrive}
          loading={loading}
        />
        <KPICard
          label="Utilisateurs Free"
          value={loading ? '...' : kpis.freeUsers?.toLocaleString()}
          icon={UserPlus}
          loading={loading}
        />
        <KPICard
          label="Taux conversion"
          value={loading ? '...' : `${kpis.conversionRate ?? 0}%`}
          sub="Free → Pro"
          icon={TrendingUp}
          loading={loading}
        />
        <KPICard
          label="Activité"
          value={loading ? '...' : 'Live'}
          sub="Données en temps réel"
          icon={Activity}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups chart */}
        <div className="rounded-xl border p-5" style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="mb-5">
            <h3 className="font-semibold text-sm" style={{ color: '#F7F7F5' }}>Nouvelles inscriptions</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(247,247,245,0.4)' }}>30 derniers jours</p>
          </div>
          {loading ? (
            <div className="h-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={signupData} style={CHART_STYLE}>
                <defs>
                  <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8482E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8482E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgba(247,247,245,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(247,247,245,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C8482E"
                  strokeWidth={2}
                  fill="url(#signupGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue chart */}
        <div className="rounded-xl border p-5" style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="mb-5">
            <h3 className="font-semibold text-sm" style={{ color: '#F7F7F5' }}>Revenus (XOF)</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(247,247,245,0.4)' }}>30 derniers jours</p>
          </div>
          {loading ? (
            <div className="h-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={revenueData} style={CHART_STYLE}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgba(247,247,245,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(247,247,245,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

