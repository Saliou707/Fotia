'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Crown, Image, HardDrive, Calendar, Mail, DollarSign } from 'lucide-react'
import { use } from 'react'

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border p-4 flex items-center gap-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-overlay)' }}>
        <Icon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
      </div>
      <div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  )
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--bg-overlay)' }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--bg-overlay)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data || !data.profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p style={{ color: 'var(--text-muted)' }}>Utilisateur introuvable</p>
        <Link href="/admin/users" className="text-sm px-4 py-2 rounded-lg" style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}>
          Retour
        </Link>
      </div>
    )
  }

  const { profile, galleries, totalGalleries, totalPhotos, subscription, payments } = data

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-4 h-4" />
        Retour aux utilisateurs
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border p-6 flex items-start gap-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ background: 'var(--fotia-orange-muted)', color: 'var(--fotia-orange)' }}
        >
          {(profile.display_name || profile.email)?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {profile.display_name || 'Sans nom'}
            </h1>
            {profile.plan === 'pro' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: 'var(--fotia-orange-muted)', color: 'var(--fotia-orange)' }}>
                <Crown className="w-3 h-3" /> Premium Pro
              </span>
            )}
          </div>
          <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Mail className="w-3.5 h-3.5" /> {profile.email}
          </p>
          <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Calendar className="w-3.5 h-3.5" />
            Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Galeries" value={totalGalleries} icon={Image} />
        <StatCard label="Photos" value={totalPhotos.toLocaleString()} icon={Image} />
        <StatCard label="Stockage" value={formatBytes(profile.storage_used_bytes)} icon={HardDrive} />
        <StatCard label="Plan" value={profile.plan === 'pro' ? 'Premium Pro' : 'Essentiel'} icon={Crown} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Abonnement</h2>
          {subscription ? (
            <div className="space-y-2.5 text-sm">
              {[
                ['Plan', subscription.plan === 'pro' ? 'Premium Pro' : 'Essentiel'],
                ['Statut', subscription.status],
                ['Fournisseur', subscription.provider],
                ['Réf.', subscription.provider_reference || '—'],
                ['Début', subscription.started_at ? new Date(subscription.started_at).toLocaleDateString('fr-FR') : '—'],
                ['Expiration', subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('fr-FR') : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucun abonnement actif</p>
          )}
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <DollarSign className="w-4 h-4" style={{ color: 'var(--fotia-orange)' }} />
            Historique paiements
          </h2>
          {payments && payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b text-sm" style={{ borderColor: 'var(--bg-overlay)' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)' }}>{Number(p.amount).toLocaleString()} {p.currency}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      background: p.status === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: p.status === 'success' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucun paiement</p>
          )}
        </div>
      </div>

      {/* Galleries */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Galeries ({totalGalleries})</h2>
        {galleries && galleries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Titre', 'Photos', 'Vues', 'Statut', 'Date'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {galleries.map((g: any) => (
                  <tr key={g.id} className="border-t hover:bg-white/[0.01] transition-colors" style={{ borderColor: 'var(--bg-overlay)' }}>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-primary)' }}>{g.title}</td>
                    <td className="px-3 py-2.5" style={{ color: 'rgba(247,247,245,0.6)' }}>{g.photo_count}</td>
                    <td className="px-3 py-2.5" style={{ color: 'rgba(247,247,245,0.6)' }}>{g.view_count}</td>
                    <td className="px-3 py-2.5">
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
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(g.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucune galerie</p>
        )}
      </div>
    </div>
  )
}
