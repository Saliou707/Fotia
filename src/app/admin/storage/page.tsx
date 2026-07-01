'use client'

import { useState, useEffect } from 'react'
import { HardDrive, Image, Crown, RefreshCw } from 'lucide-react'

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function StorageBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
        <span>{label}</span>
        <span>{formatBytes(used)}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : 'var(--fotia-orange)',
          }}
        />
      </div>
    </div>
  )
}

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

  const MAX_STORAGE = 100 * 1024 * 1024 * 1024 * 1000 // 100 TB conceptual max

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Stockage</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Consommation Cloudflare R2</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-overlay)', color: 'rgba(247,247,245,0.6)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Stockage total utilisé',
            value: loading ? '...' : formatBytes(data?.totalStorageBytes || 0),
            icon: HardDrive,
            accent: true,
          },
          {
            label: 'Photos hébergées',
            value: loading ? '...' : (data?.totalPhotos || 0).toLocaleString(),
            icon: Image,
            accent: false,
          },
          {
            label: 'Utilisateurs avec stockage',
            value: loading ? '...' : (data?.topUsersByStorage || []).length,
            icon: Crown,
            accent: false,
          },
        ].map(card => (
          <div key={card.label} className="rounded-xl border p-5 flex items-center gap-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: card.accent ? 'var(--fotia-orange-muted)' : 'var(--bg-overlay)' }}>
              <card.icon className="w-5 h-5" style={{ color: card.accent ? 'var(--fotia-orange)' : 'var(--text-secondary)' }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
              <div className="font-bold text-lg mt-0.5" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="font-semibold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>Top 20 utilisateurs (stockage)</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--bg-overlay)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.topUsersByStorage || []).map((u: any, idx: number) => (
                <div key={u.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-right" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: 'var(--fotia-orange-muted)', color: 'var(--fotia-orange)' }}
                      >
                        {(u.display_name || u.email)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-primary)' }}>{u.display_name || u.email}</span>
                        {u.plan === 'pro' && <Crown className="w-3 h-3 inline ml-1" style={{ color: 'var(--fotia-orange)' }} />}
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatBytes(u.storage_used_bytes)}</span>
                  </div>
                  <div className="ml-7 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${data.topUsersByStorage[0]?.storage_used_bytes > 0 ? (u.storage_used_bytes / data.topUsersByStorage[0].storage_used_bytes) * 100 : 0}%`,
                        background: 'var(--fotia-orange)',
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              ))}
              {(!data?.topUsersByStorage || data.topUsersByStorage.length === 0) && (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Aucune donnée</p>
              )}
            </div>
          )}
        </div>

        {/* Top Galleries */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="font-semibold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>Top 20 galeries (photos)</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--bg-overlay)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.topGalleriesBySize || []).map((g: any, idx: number) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-right" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                      <div className="min-w-0">
                        <div className="truncate max-w-[140px]" style={{ color: 'var(--text-primary)' }}>{g.title}</div>
                        <div className="text-[10px] truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>{g.owner?.email}</div>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>{g.photo_count} photos</span>
                  </div>
                  <div className="ml-7 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${data.topGalleriesBySize[0]?.photo_count > 0 ? (g.photo_count / data.topGalleriesBySize[0].photo_count) * 100 : 0}%`,
                        background: '#10b981',
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              ))}
              {(!data?.topGalleriesBySize || data.topGalleriesBySize.length === 0) && (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Aucune donnée</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
