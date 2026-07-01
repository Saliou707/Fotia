'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Crown, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight, RefreshCw, ArrowUpDown } from 'lucide-react'

type User = {
  id: string
  email: string
  display_name: string | null
  plan: string
  storage_used_bytes: number
  gallery_count: number
  created_at: string
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function PlanBadge({ plan }: { plan: string }) {
  const isPro = plan === 'pro'
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
      style={{
        background: isPro ? 'var(--fotia-orange-muted)' : 'var(--border-subtle)',
        color: isPro ? 'var(--fotia-orange)' : 'var(--text-secondary)',
      }}
    >
      {isPro && <Crown className="w-3 h-3" />}
      {isPro ? 'Premium Pro' : 'Essentiel'}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border-subtle)', width: i === 2 ? '140px' : '80px' }} />
        </td>
      ))}
    </tr>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [plan, setPlan] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const PAGE_SIZE = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (plan) params.set('plan', plan)
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/users?${params}`)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [page, plan, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const changePlan = async (userId: string, newPlan: string) => {
    setActionLoading(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates: { plan: newPlan } }),
    })
    await fetchUsers()
    setActionLoading(null)
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Supprimer définitivement cet utilisateur ?')) return
    setActionLoading(userId)
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    await fetchUsers()
    setActionLoading(null)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Utilisateurs</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {total.toLocaleString()} utilisateurs au total
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ background: 'var(--bg-overlay)', color: 'rgba(247,247,245,0.6)' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Rechercher par email ou nom..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--fotia-orange)', color: '#fff' }}
          >
            Chercher
          </button>
        </form>

        {/* Plan filter tabs */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-default)' }}>
          {[
            { value: '', label: 'Tous' },
            { value: 'free', label: 'Essentiel' },
            { value: 'pro', label: 'Pro' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setPlan(tab.value); setPage(1) }}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: plan === tab.value ? 'var(--fotia-orange-muted)' : 'var(--bg-surface)',
                color: plan === tab.value ? 'var(--fotia-orange)' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Utilisateur', 'Email', 'Plan', 'Galeries', 'Stockage', 'Inscription', 'Actions'].map(col => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'rgba(255,255,255,0.04)' } as any}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'var(--fotia-orange-muted)', color: 'var(--fotia-orange)' }}
                        >
                          {(user.display_name || user.email)?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                          {user.display_name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'rgba(247,247,245,0.6)' }}>
                      <span className="truncate block max-w-[180px]">{user.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={user.plan} />
                    </td>
                    <td className="px-4 py-3 text-center" style={{ color: 'rgba(247,247,245,0.6)' }}>
                      {user.gallery_count}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'rgba(247,247,245,0.6)' }}>
                      {formatBytes(user.storage_used_bytes)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                          title="Voir profil"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </Link>
                        {user.plan === 'free' ? (
                          <button
                            onClick={() => changePlan(user.id, 'pro')}
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded-md transition-colors hover:bg-orange-500/20"
                            title="Passer en Pro"
                            style={{ color: 'var(--fotia-orange)' }}
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => changePlan(user.id, 'free')}
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                            title="Rétrograder en Free"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-1.5 rounded-md transition-colors hover:bg-red-500/20"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--bg-overlay)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Page {page} / {totalPages} — {total} résultats
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md disabled:opacity-30 hover:bg-white/10 transition-colors"
                style={{ color: 'rgba(247,247,245,0.6)' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md disabled:opacity-30 hover:bg-white/10 transition-colors"
                style={{ color: 'rgba(247,247,245,0.6)' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
