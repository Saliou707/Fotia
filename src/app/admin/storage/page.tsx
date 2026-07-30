'use client'

import { useState, useEffect } from 'react'
import { HardDrive, Image, Users, Crown } from 'lucide-react'
import { PageHeader, RefreshButton, AdminCard, formatBytes } from '../_components/ui'

export default function StoragePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/storage')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const topUsers: any[] = data?.topUsersByStorage || []
  const topGalleries: any[] = data?.topGalleriesBySize || []
  const maxUserStorage = topUsers[0]?.storage_used_bytes || 1
  const maxGalleryPhotos = topGalleries[0]?.photo_count || 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stockage"
        description="Consommation Cloudflare R2"
        actions={<RefreshButton onClick={fetchData} loading={loading} />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminCard
          label="Stockage total utilisé"
          value={loading ? '...' : formatBytes(data?.totalStorageBytes || 0)}
          icon={HardDrive}
          accent
          loading={loading}
        />
        <AdminCard
          label="Photos hébergées"
          value={loading ? '...' : (data?.totalPhotos || 0).toLocaleString()}
          icon={Image}
          loading={loading}
        />
        <AdminCard
          label="Utilisateurs actifs"
          value={loading ? '...' : topUsers.length.toString()}
          icon={Users}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Users by Storage */}
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="font-semibold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>
            Top utilisateurs — Stockage
          </h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--bg-overlay)' }} />
              ))}
            </div>
          ) : topUsers.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Aucune donnée</p>
          ) : (
            <div className="space-y-4">
              {topUsers.map((u: any, idx: number) => {
                const pct = (u.storage_used_bytes / maxUserStorage) * 100
                return (
                  <div key={u.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ background: 'var(--fotia-orange-muted)', color: 'var(--fotia-orange)' }}
                        >
                          {(u.display_name || u.email)?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-medium truncate block max-w-[140px]" style={{ color: 'var(--text-primary)' }}>
                            {u.display_name || u.email}
                          </span>
                        </div>
                        {u.plan === 'pro' && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--fotia-orange)' }} />}
                      </div>
                      <span className="text-xs font-mono flex-shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
                        {formatBytes(u.storage_used_bytes)}
                      </span>
                    </div>
                    <div className="ml-[3.25rem] h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: 'var(--fotia-orange)', opacity: 0.65 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Galleries by Photos */}
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="font-semibold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>
            Top galeries — Nombre de photos
          </h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--bg-overlay)' }} />
              ))}
            </div>
          ) : topGalleries.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Aucune donnée</p>
          ) : (
            <div className="space-y-4">
              {topGalleries.map((g: any, idx: number) => {
                const pct = (g.photo_count / maxGalleryPhotos) * 100
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate max-w-[160px]" style={{ color: 'var(--text-primary)' }}>
                            {g.title}
                          </div>
                          <div className="text-[10px] truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>
                            {g.owner?.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono flex-shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
                        {g.photo_count} photos
                      </span>
                    </div>
                    <div className="ml-[3.25rem] h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: '#10b981', opacity: 0.65 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
