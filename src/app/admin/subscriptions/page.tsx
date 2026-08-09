'use client'

import { useState, useEffect, useCallback } from 'react'
import { Crown } from 'lucide-react'
import {
  PageHeader, RefreshButton, FilterTabs,
  DataTable, TableSkeleton, EmptyState, StatusBadge,
  Pagination, formatDate
} from '../_components/ui'

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

const PAGE_SIZE = 20

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchSubs = useCallback(async () => {
    // `loading` démarre à `true` (squelette au premier rendu) ; le refetch conserve l'état courant
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

  // fetch au montage volontaire (pattern admin) — le setState est asynchrone (après await)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSubs() }, [fetchSubs])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abonnements"
        description={`${total.toLocaleString()} abonnements`}
        actions={<RefreshButton onClick={fetchSubs} loading={loading} />}
      />

      <FilterTabs
        tabs={[
          { value: '', label: 'Tous' },
          { value: 'active', label: '✓ Actifs' },
          { value: 'pending', label: '⏳ En attente' },
          { value: 'expired', label: '✕ Expirés' },
          { value: 'canceled', label: '○ Annulés' },
        ]}
        active={status}
        onChange={(v) => { setStatus(v); setPage(1) }}
      />

      <DataTable headers={['Utilisateur', 'Plan', 'Statut', 'Cycle', 'Fournisseur', 'Référence', 'Début', 'Expiration']}>
        {loading ? (
          <TableSkeleton cols={8} rows={8} />
        ) : subs.length === 0 ? (
          <EmptyState icon={Crown} title="Aucun abonnement trouvé" />
        ) : (
          subs.map(sub => (
            <tr
              key={sub.id}
              className="border-t transition-colors"
              style={{ borderColor: 'var(--border-subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td className="px-5 py-3.5">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {sub.profiles?.display_name || '—'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {sub.profiles?.email}
                </div>
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={sub.plan} />
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={sub.status} />
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {sub.billing_cycle || '—'}
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {sub.provider || '—'}
              </td>
              <td className="px-5 py-3.5">
                <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
                  {sub.provider_reference?.slice(0, 16) || '—'}
                </span>
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {sub.started_at ? formatDate(sub.started_at) : '—'}
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: sub.expires_at && new Date(sub.expires_at) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
                {sub.expires_at ? formatDate(sub.expires_at) : '—'}
              </td>
            </tr>
          ))
        )}
      </DataTable>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPrev={() => setPage(p => Math.max(1, p - 1))}
        onNext={() => setPage(p => Math.min(totalPages, p + 1))}
      />
    </div>
  )
}
