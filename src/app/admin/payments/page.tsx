'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, ChevronLeft, ChevronRight, RefreshCw, Download } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
    failed: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    pending: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  }
  const c = colors[status] || { bg: 'var(--border-subtle)', text: 'var(--text-secondary)' }
  return <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: c.bg, color: c.text }}>{status}</span>
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 25

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
      ['Référence', 'Utilisateur', 'Email', 'Montant', 'Devise', 'Statut', 'Date'],
      ...payments.map(p => [
        p.provider_reference || '',
        p.profiles?.display_name || '',
        p.profiles?.email || '',
        p.amount,
        p.currency,
        p.status,
        new Date(p.created_at).toLocaleDateString('fr-FR'),
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fotia-payments-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Paiements</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total.toLocaleString()} transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPayments} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-overlay)', color: 'rgba(247,247,245,0.6)' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--fotia-orange-muted)', color: 'var(--fotia-orange)' }}>
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Revenue summary */}
      <div className="rounded-xl border p-5 flex items-center gap-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
          <DollarSign className="w-6 h-6" style={{ color: '#10b981' }} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Revenu total cumulé</div>
          <div className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {totalRevenue.toLocaleString()} XOF
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex rounded-lg overflow-hidden border w-fit" style={{ borderColor: 'var(--border-default)' }}>
        {[
          { value: '', label: 'Tous' },
          { value: 'success', label: 'Réussis' },
          { value: 'failed', label: 'Échoués' },
          { value: 'pending', label: 'En attente' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1) }}
            className="px-4 py-2 text-sm font-medium"
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
                {['Référence', 'Utilisateur', 'Montant', 'Devise', 'Statut', 'Date'].map(col => (
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
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border-subtle)', width: '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Aucun paiement trouvé
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="border-t hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {p.provider_reference?.slice(0, 20) || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div style={{ color: 'var(--text-primary)' }}>{p.profiles?.display_name || '—'}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.profiles?.email}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.currency}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
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
