'use client'

import { useState, useEffect, useCallback } from 'react'
import { Image, ExternalLink, EyeOff, Eye, Trash2 } from 'lucide-react'
import {
  PageHeader, RefreshButton, SearchBar, FilterTabs,
  DataTable, TableSkeleton, EmptyState, StatusBadge,
  Pagination, formatDate
} from '../_components/ui'

const PAGE_SIZE = 20

export default function GalleriesPage() {
  const [galleries, setGalleries] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchGalleries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/galleries?${params}`)
    if (res.ok) {
      const data = await res.json()
      setGalleries(data.galleries || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [page, search, statusFilter])

  useEffect(() => { fetchGalleries() }, [fetchGalleries])

  const toggleStatus = async (galleryId: string, currentStatus: string) => {
    setActionLoading(galleryId)
    const newStatus = currentStatus === 'active' ? 'archived' : 'active'
    await fetch('/api/admin/galleries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ galleryId, status: newStatus }),
    })
    await fetchGalleries()
    setActionLoading(null)
  }

  const deleteGallery = async (galleryId: string) => {
    if (!confirm('Supprimer cette galerie et toutes ses photos ?')) return
    setActionLoading(galleryId)
    await fetch('/api/admin/galleries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ galleryId }),
    })
    await fetchGalleries()
    setActionLoading(null)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeries"
        description={`${total.toLocaleString()} galeries au total`}
        actions={<RefreshButton onClick={fetchGalleries} loading={loading} />}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => { setSearch(searchInput); setPage(1) }}
          placeholder="Rechercher par titre..."
        />
        <FilterTabs
          tabs={[
            { value: '', label: 'Toutes' },
            { value: 'active', label: '● Active' },
            { value: 'draft', label: '○ Brouillon' },
            { value: 'archived', label: '✕ Archivée' },
          ]}
          active={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1) }}
        />
      </div>

      <DataTable headers={['Titre', 'Photographe', 'Photos', 'Vues', 'Favoris', 'Statut', 'Créée le', 'Actions']}>
        {loading ? (
          <TableSkeleton cols={8} rows={8} />
        ) : galleries.length === 0 ? (
          <EmptyState icon={Image} title="Aucune galerie trouvée" description="Modifiez vos filtres de recherche" />
        ) : (
          galleries.map(g => (
            <tr
              key={g.id}
              className="border-t transition-colors"
              style={{ borderColor: 'var(--border-subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Cover + Title */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  {g.cover_image_url ? (
                    <img
                      src={g.cover_image_url}
                      alt=""
                      className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                      style={{ border: '1px solid var(--border-subtle)' }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-overlay)' }}
                    >
                      <Image className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <span className="font-medium text-sm truncate max-w-[140px]" style={{ color: 'var(--text-primary)' }}>
                    {g.title}
                  </span>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {g.profiles?.display_name || '—'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {g.profiles?.email}
                </div>
              </td>
              <td className="px-5 py-3.5 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                {g.photo_count}
              </td>
              <td className="px-5 py-3.5 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                {g.view_count}
              </td>
              <td className="px-5 py-3.5 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                {g.favorite_count}
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={g.status} />
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatDate(g.created_at)}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1">
                  <a
                    href={`/galerie/${g.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                    title="Voir la galerie"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => toggleStatus(g.id, g.status)}
                    disabled={actionLoading === g.id}
                    className="p-1.5 rounded-md transition-colors hover:bg-white/10 disabled:opacity-50"
                    title={g.status === 'active' ? 'Archiver' : 'Réactiver'}
                    style={{ color: g.status === 'active' ? 'var(--yellow)' : 'var(--green)' }}
                  >
                    {g.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteGallery(g.id)}
                    disabled={actionLoading === g.id}
                    className="p-1.5 rounded-md transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    title="Supprimer"
                    style={{ color: 'rgba(239,68,68,0.6)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
