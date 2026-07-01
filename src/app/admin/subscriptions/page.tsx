'use client'

import { useState, useEffect, useCallback } from 'react'
import { Crown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

type Subscription = {
  id: string
  plan: string
  status: string
  billing_cycle: string
  provider: string
  provider_reference: string | null
  started_at: string | null
  expires_at: string | null
  created_at: string
  profiles: { email: string; display_name: string | null } | null
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    active: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
    expired: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    canceled: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' },
    pending: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    failed: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  }
  const c = colors[status] || { bg: 'var(--border-subtle)', text: 'var(--text-secondary)' }
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  )
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 20

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set('status', status)
    const res = await fetch(`/api/admin/subscriptions?${params}`)
    if (res.ok) {
      const data = await res.json()
      setSubs(data.subscriptions || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [page, status])

  useEffect(() => { fetchSubs() }, [fetchSubs])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Abonnements</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total.toLocaleString()} abonnements</p>
        </div>
        <button
          onClick={fetchSubs}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg-overlay)', color: 'rgba(247,247,245,0.6)' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Status filter */}
      <div className="flex rounded-lg overflow-hidden border w-fit" style={{ borderColor: 'var(--border-default)' }}>
        {[
          { value: '', label: 'Tous' },
          { value: 'active', label: 'Actifs' },
          { value: 'expired', label: 'Expirés' },
          { value: 'canceled', label: 'Annulés' },
          { value: 'pending', label: 'En attente' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1) }}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: status === tab.value ? 'var(--fotia-orange-muted)' : 'var(--bg-surface)',
              color: status === tab.value ? 'var(--fotia-orange)' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Utilisateur', 'Plan', 'Statut', 'Fournisseur', 'Début', 'Expiration', 'Référence'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map(j => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border-subtle)', width: '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : subs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Aucun abonnement trouvé
                  </td>
                </tr>
              ) : (
                subs.map(sub => (
                  <tr key={sub.id} className="border-t hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <div style={{ color: 'var(--text-primary)' }}>{sub.profiles?.display_name || '—'}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub.profiles?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: sub.plan === 'pro' ? 'var(--fotia-orange)' : 'var(--text-secondary)' }}>
                        {sub.plan === 'pro' && <Crown className="w-3 h-3" />}
                        {sub.plan === 'pro' ? 'Premium Pro' : 'Essentiel'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={sub.status} /></td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{sub.provider}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {sub.started_at ? new Date(sub.started_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {sub.provider_reference?.slice(0, 16) || '—'}...
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--bg-overlay)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md disabled:opacity-30 hover:bg-white/10" style={{ color: 'rgba(247,247,245,0.6)' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md disabled:opacity-30 hover:bg-white/10" style={{ color: 'rgba(247,247,245,0.6)' }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
