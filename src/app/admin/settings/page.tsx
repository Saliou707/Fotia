'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, Settings2, Image, HardDrive, Crown } from 'lucide-react'

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function SettingRow({
  label,
  description,
  value,
  onChange,
  type = 'number',
  suffix,
}: {
  label: string
  description?: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  suffix?: string
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b" style={{ borderColor: 'var(--bg-overlay)' }}>
      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
        {description && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</div>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-28 px-3 py-1.5 rounded-lg text-sm text-right outline-none"
          style={{
            background: '#0b0b0b',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-primary)',
          }}
        />
        {suffix && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{suffix}</span>}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/settings')
    if (res.ok) setSettings(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchSettings() }, [])

  const update = (key: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: key.includes('bytes') ? Number(value) * 1024 * 1024 * 1024 : Number(value),
    }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-overlay)' }} />
        ))}
      </div>
    )
  }

  const gbFrom = (bytes: number) => Math.round(bytes / (1024 * 1024 * 1024))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Paramètres</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Configuration de la plateforme</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: saved ? 'rgba(16,185,129,0.2)' : 'var(--fotia-orange)',
            color: saved ? '#10b981' : '#fff',
          }}
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? 'Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Free Plan */}
      <div className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <Settings2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Plan Essentiel (Gratuit)</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Limites applicables aux utilisateurs sur le plan gratuit</p>
        <SettingRow
          label="Galeries max"
          description="Nombre maximum de galeries actives simultanément"
          value={settings?.free_max_galleries ?? 3}
          onChange={v => update('free_max_galleries', v)}
        />
        <SettingRow
          label="Photos max par galerie"
          description="Limite de photos par galerie"
          value={settings?.free_max_photos_per_gallery ?? 100}
          onChange={v => update('free_max_photos_per_gallery', v)}
        />
        <SettingRow
          label="Stockage max"
          description="Espace de stockage total alloué"
          value={gbFrom(settings?.free_max_storage_bytes ?? 5 * 1024 ** 3)}
          onChange={v => update('free_max_storage_bytes', v)}
          suffix="GB"
        />
      </div>

      {/* Pro Plan */}
      <div className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--fotia-orange-muted)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <Crown className="w-4 h-4" style={{ color: 'var(--fotia-orange)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Plan Premium Pro</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Fonctionnalités et limites Premium Pro — (-1 = illimité)</p>
        <SettingRow
          label="Galeries max"
          description="-1 pour illimité"
          value={settings?.pro_max_galleries ?? -1}
          onChange={v => update('pro_max_galleries', v)}
        />
        <SettingRow
          label="Photos max par galerie"
          description="Limite de photos par galerie"
          value={settings?.pro_max_photos_per_gallery ?? 1000}
          onChange={v => update('pro_max_photos_per_gallery', v)}
        />
        <SettingRow
          label="Stockage max"
          description="Espace de stockage total alloué"
          value={gbFrom(settings?.pro_max_storage_bytes ?? 100 * 1024 ** 3)}
          onChange={v => update('pro_max_storage_bytes', v)}
          suffix="GB"
        />
      </div>

      {/* Tarification */}
      <div className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <HardDrive className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Tarification</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Prix de l'abonnement Premium Pro</p>
        <SettingRow
          label="Prix mensuel (XOF)"
          description="Montant débité via Djomy en Francs CFA"
          value={settings?.pro_price_xof ?? 5900}
          onChange={v => update('pro_price_xof', v)}
          suffix="XOF"
        />
        <SettingRow
          label="Prix mensuel (EUR)"
          description="Affiché sur la landing page"
          value={settings?.pro_price_eur ?? 9}
          onChange={v => update('pro_price_eur', v)}
          suffix="€"
        />
      </div>
    </div>
  )
}
