'use client'

import { useState, useEffect, useCallback } from 'react'
import { Webhook, CheckCircle2, XCircle, Clock } from 'lucide-react'
import {
  PageHeader, RefreshButton, FilterTabs,
  DataTable, TableSkeleton, EmptyState, StatusBadge,
  Pagination, formatDate
} from '../_components/ui'

type WebhookEvent = {
  id: string
  provider: string
  event_id: string
  event_type: string
  payload: any
  processed_at: string
}

const PAGE_SIZE = 25

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [eventType, setEventType] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalReceived: 0, successCount: 0, failureCount: 0 })
  const [expandedPayload, setExpandedPayload] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (eventType) params.set('eventType', eventType)
    const res = await fetch(`/api/admin/webhooks?${params}`)
    if (res.ok) {
      const data = await res.json()
      setEvents(data.events || [])
      setTotal(data.total || 0)
      if (data.stats) setStats(data.stats)
    }
    setLoading(false)
  }, [page, eventType])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const getEventBadge = (type: string) => {
    if (['payment.success', 'payment.completed', 'payment.captured'].includes(type)) {
      return <StatusBadge status="success" />
    }
    if (['payment.failed', 'payment.cancelled'].includes(type)) {
      return <StatusBadge status="failed" />
    }
    return <StatusBadge status="pending" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks Djomy"
        description={`${total.toLocaleString()} événements reçus`}
        actions={<RefreshButton onClick={fetchEvents} loading={loading} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total reçus', value: stats.totalReceived.toLocaleString(), icon: Webhook, color: '#3b82f6' },
          { label: 'Paiements réussis', value: stats.successCount.toLocaleString(), icon: CheckCircle2, color: '#10b981' },
          { label: 'Échecs / Annulés', value: stats.failureCount.toLocaleString(), icon: XCircle, color: '#ef4444' },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl border p-4 flex items-center gap-4"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {loading ? '...' : s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={[
          { value: '', label: 'Tous' },
          { value: 'payment.success', label: '✓ Succès' },
          { value: 'payment.failed', label: '✗ Échecs' },
          { value: 'payment.created', label: 'Nouveaux' },
        ]}
        active={eventType}
        onChange={(v) => { setEventType(v); setPage(1) }}
      />

      <DataTable headers={['Événement', 'Statut', 'Event ID', 'Reçu le', 'Détails']}>
        {loading ? (
          <TableSkeleton cols={5} rows={8} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Aucun webhook reçu"
            description="Les webhooks apparaîtront ici dès que Djomy enverra des événements. Vérifiez que l'URL est bien configurée dans le dashboard Djomy."
          />
        ) : (
          events.map(evt => (
            <tr
              key={evt.id}
              className="border-t transition-colors"
              style={{ borderColor: 'var(--border-subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td className="px-5 py-3.5">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {evt.event_type}
                </span>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {evt.provider}
                </div>
              </td>
              <td className="px-5 py-3.5">
                {getEventBadge(evt.event_type)}
              </td>
              <td className="px-5 py-3.5">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded block max-w-[140px] truncate" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
                  {evt.event_id?.slice(0, 18) || '—'}
                </span>
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatDate(evt.processed_at)} {new Date(evt.processed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-5 py-3.5">
                <button
                  onClick={() => setExpandedPayload(expandedPayload === evt.id ? null : evt.id)}
                  className="text-xs font-medium px-2 py-1 rounded transition-colors hover:bg-white/10"
                  style={{ color: 'var(--fotia-orange)' }}
                >
                  {expandedPayload === evt.id ? 'Masquer' : 'Voir payload'}
                </button>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      {/* Expanded payload */}
      {expandedPayload && (
        <div
          className="rounded-xl border p-5 overflow-auto max-h-80"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <pre className="text-xs font-mono whitespace-pre-wrap break-all" style={{ color: 'var(--text-secondary)' }}>
            {JSON.stringify(events.find(e => e.id === expandedPayload)?.payload, null, 2)}
          </pre>
        </div>
      )}

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
