'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Users, Crown, UserCheck, UserX, Trash2 } from 'lucide-react'
import {
  PageHeader, RefreshButton, SearchBar, FilterTabs,
  DataTable, TableSkeleton, EmptyState, StatusBadge,
  Pagination, formatBytes, formatDate
} from '../_components/ui'

type User = {
  id: string
  email: string
  display_name: string | null
  plan: string
  storage_used_bytes: number
  gallery_count: number
  created_at: string
}

const PAGE_SIZE = 20

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [plan, setPlan] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
    setActionLoading(userId)
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setDeleteConfirm(null)
    await fetchUsers()
    setActionLoading(null)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description={`${total.toLocaleString()} utilisateurs inscrits`}
        actions={<RefreshButton onClick={fetchUsers} loading={loading} />}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => { setSearch(searchInput); setPage(1) }}
          placeholder="Rechercher par email ou nom..."
        />
        <FilterTabs
          tabs={[
            { value: '', label: 'Tous' },
            { value: 'free', label: 'Essentiel' },
            { value: 'pro', label: 'Pro' },
          ]}
          active={plan}
          onChange={(v) => { setPlan(v); setPage(1) }}
        />
      </div>

      {/* Table */}
      <DataTable headers={['Utilisateur', 'Email', 'Plan', 'Galeries', 'Stockage', 'Inscription', 'Actions']}>
        {loading ? (
          <TableSkeleton cols={7} rows={8} />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="Aucun utilisateur trouvé" description="Modifiez vos filtres de recherche" />
        ) : (
          users.map(user => (
            <tr
              key={user.id}
              className="border-t transition-colors"
              style={{ borderColor: 'var(--border-subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Avatar + Name */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--fotia-orange-muted)', color: 'var(--fotia-orange)' }}
                  >
                    {(user.display_name || user.email)[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-sm truncate max-w-[130px]" style={{ color: 'var(--text-primary)' }}>
                    {user.display_name || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="truncate block max-w-[180px]">{user.email}</span>
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={user.plan} />
              </td>
              <td className="px-5 py-3.5 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                {user.gallery_count}
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {formatBytes(user.storage_used_bytes)}
              </td>
              <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatDate(user.created_at)}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                    title="Voir profil"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                  </Link>
                  {user.plan === 'free' ? (
                    <button
                      onClick={() => changePlan(user.id, 'pro')}
                      disabled={actionLoading === user.id}
                      className="p-1.5 rounded-md transition-colors hover:bg-orange-500/20 disabled:opacity-50"
                      title="Passer en Pro"
                      style={{ color: 'var(--fotia-orange)' }}
                    >
                      <Crown className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => changePlan(user.id, 'free')}
                      disabled={actionLoading === user.id}
                      className="p-1.5 rounded-md transition-colors hover:bg-white/10 disabled:opacity-50"
                      title="Rétrograder en Free"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(user.id)}
                    disabled={actionLoading === user.id}
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
        {/* Pagination row inside tbody is invalid — handled below */}
      </DataTable>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPrev={() => setPage(p => Math.max(1, p - 1))}
        onNext={() => setPage(p => Math.min(totalPages, p + 1))}
      />

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl border p-6 max-w-sm w-full" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--red-muted)' }}>
              <Trash2 className="w-5 h-5" style={{ color: 'var(--red)' }} />
            </div>
            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Supprimer l&apos;utilisateur ?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Cette action est irréversible. Toutes les galeries et photos seront supprimées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                Annuler
              </button>
              <button
                onClick={() => deleteUser(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--red)', color: '#fff' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
