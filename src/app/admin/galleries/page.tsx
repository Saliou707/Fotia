'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react'

export default function GalleriesPage() {
  const [galleries, setGalleries] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const PAGE_SIZE = 20

  const fetchGalleries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/galleries?${params}`)
    if (res.ok) {
      const data = await res.json()
      setGalleries(data.galleries || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchGalleries() }, [fetchGalleries])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

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
    if (!confirm('Supprimer définitivement cette galerie et toutes ses photos ?')) return
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Galeries</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total.toLocaleString()} galeries au total</p>
        </div>
        <button onClick={fetchGalleries} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-overlay)', color: 'rgba(247,247,245,0.6)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher par titre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--fotia-orange)', color: '#fff' }}>
          Chercher
        </button>
      </form>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Titre', 'Photographe', 'Photos', 'Vues', 'Favoris', 'Statut', 'Date', 'Actions'].map(col => (
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
                    {[1,2,3,4,5,6,7,8].map(j => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border-subtle)', width: '70px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : galleries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Aucune galerie trouvée
                  </td>
                </tr>
              ) : (
                galleries.map(g => (
                  <tr key={g.id} className="border-t hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <span className="font-medium truncate block max-w-[160px]" style={{ color: 'var(--text-primary)' }}>{g.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate max-w-[120px]" style={{ color: 'rgba(247,247,245,0.6)' }}>{g.profiles?.display_name || '—'}</div>
                      <div className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>{g.profiles?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center" style={{ color: 'rgba(247,247,245,0.6)' }}>{g.photo_count}</td>
                    <td className="px-4 py-3 text-center" style={{ color: 'rgba(247,247,245,0.6)' }}>{g.view_count}</td>
                    <td className="px-4 py-3 text-center" style={{ color: 'rgba(247,247,245,0.6)' }}>{g.favorite_count}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: g.status === 'active' ? 'rgba(16,185,129,0.12)' : 'var(--bg-overlay)',
                          color: g.status === 'active' ? '#10b981' : 'var(--text-muted)',
                        }}
                      >
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(g.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`/g/${g.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                          title="Voir la galerie"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => toggleStatus(g.id, g.status)}
                          disabled={actionLoading === g.id}
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                          title={g.status === 'active' ? 'Désactiver' : 'Réactiver'}
                          style={{ color: g.status === 'active' ? '#f59e0b' : '#10b981' }}
                        >
                          {g.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => deleteGallery(g.id)}
                          disabled={actionLoading === g.id}
                          className="p-1.5 rounded-md hover:bg-red-500/20 transition-colors"
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
