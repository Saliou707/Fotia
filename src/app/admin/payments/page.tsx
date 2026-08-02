'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, Download } from 'lucide-react'
import {
  PageHeader, RefreshButton, FilterTabs,
  DataTable, TableSkeleton, EmptyState, StatusBadge,
  Pagination, formatDate
} from '../_components/ui'

const PAGE_SIZE = 25

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set('status', status)
    const res = await fetch(`/api/admin/payments?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPayments(data.payments || [])
      setTotal(data.total || 0)
      setTotalRevenue(data.totalRevenue || 0)
    }
    setLoading(false)
  }, [page, status])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const exportCSV = () => {
    const rows = [
      ['Référence', 'Tx Djomy', 'Utilisateur', 'Email', 'Montant', 'Devise', 'Statut', 'Date'],
      ...payments.map(p => [
        p.provider_reference || '',
        p.provider_payment_id || '',
        p.profiles?.display_name || '',
        p.profiles?.email || '',
        p.amount,
        p.currency,
        p.status,
        new Date(p.created_at).toLocaleDateString('fr-FR'),
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fotia-paiements-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description={`${total.toLocaleString()} transactions`}
        actions={
          <>
            <RefreshButton onClick={fetchPayments} loading={loading} />
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ background: 'var(--fotia-orange-muted)', color: 'var(--fotia-orange)', border: '1px solid rgba(200,72,46,0.2)' }}
            >
              <Download className="w-3.5 h-3.5" />
              Exporter CSV
            </button>
          </>
        }
      />

      {/* Revenue summary */}
      <div
        className="rounded-xl border p-5 flex items-center gap-5"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(16,185,129,0.12)' }}
        >
          <DollarSign className="w-6 h-6" style={{ color: '#10b981' }} />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Revenu total cumulé
          </div>
          <div className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {loading ? '...' : `${totalRevenue.toLocaleString()} GNF`}
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={[
          { value: '', label: 'Tous' },
          { value: 'success', label: '✓ Réussis' },
          { value: 'failed', label: '✗ Échoués' },
          { value: 'pending', label: '○ En attente' },
        ]}
        active={status}
        onChange={(v) => { setStatus(v); setPage(1) }}
      />

      <DataTable headers={['Référence', 'Tx Djomy', 'Utilisateur', 'Montant', 'Devise', 'Statut', 'Date']}>
        {loading ? (
          <TableSkeleton cols={7} rows={8} />
        ) : payments.length === 0 ? (
          <EmptyState icon={DollarSign} title="Aucun paiement trouvé" />
        ) : (
          payments.map(p => (
            <tr
              key={p.id}
              className="border-t transition-colors"
              style={{ borderColor: 'var(--border-subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td className="px-5 py-3.5">
                <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
                  {p.provider_reference?.slice(0, 18) || '—'}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded truncate block max-w-[120px]" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
                  {p.provider_payment_id?.slice(0, 14) || '—'}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {p.profiles?.display_name || '—'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {p.profiles?.email}
                </div>
              </td>
              <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {Number(p.amount).toLocaleString()}
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {p.currency}
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatDate(p.created_at)}
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
