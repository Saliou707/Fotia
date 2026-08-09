'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─── CSS Variables (injectées dans le layout) ─────────────────────────────
export const ADMIN_CSS_VARS = `
  :root {
    --fotia-orange: #C8482E;
    --fotia-orange-muted: rgba(200,72,46,0.12);
    --fotia-orange-hover: rgba(200,72,46,0.2);
    --bg-base: #0B0B0B;
    --bg-surface: #111111;
    --bg-overlay: rgba(255,255,255,0.04);
    --bg-hover: rgba(255,255,255,0.03);
    --border-default: rgba(255,255,255,0.08);
    --border-subtle: rgba(255,255,255,0.05);
    --text-primary: #F2EDE4;
    --text-secondary: rgba(247,247,245,0.65);
    --text-muted: rgba(247,247,245,0.35);
    --green: #22C55E;
    --green-muted: rgba(16,185,129,0.12);
    --red: #EF4444;
    --red-muted: rgba(239,68,68,0.12);
    --yellow: #f59e0b;
    --yellow-muted: rgba(245,158,11,0.12);
    --blue: #3b82f6;
    --blue-muted: rgba(59,130,246,0.12);
  }
`

// ─── Utilities ────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

// ─── AdminCard (KPI card) ─────────────────────────────────────────────────

interface AdminCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: boolean
  loading?: boolean
  trend?: number // positive = up, negative = down, 0 = stable
}

export function AdminCard({ label, value, sub, icon: Icon, accent = false, loading = false, trend }: AdminCardProps) {
  const trendColor = trend === undefined ? '' : trend > 0 ? 'var(--green)' : trend < 0 ? 'var(--red)' : 'var(--text-muted)'
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus

  return (
    <div
      className="relative rounded-xl border p-5 flex flex-col gap-3 overflow-hidden transition-all duration-200 hover:border-white/10 group"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      {accent && (
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'var(--fotia-orange)', transform: 'translate(30%, -30%)' }}
        />
      )}
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: accent ? 'var(--fotia-orange-muted)' : 'var(--bg-overlay)',
          }}
        >
          <Icon
            className="w-4 h-4"
            style={{ color: accent ? 'var(--fotia-orange)' : 'var(--text-secondary)' }}
          />
        </div>
      </div>

      {loading ? (
        <div>
          <div className="h-8 w-28 rounded-md animate-pulse mb-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          {sub && <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />}
        </div>
      ) : (
        <div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {value}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {sub && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
            {TrendIcon && trend !== undefined && (
              <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: trendColor }}>
                <TrendIcon className="w-3 h-3" />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── StatusBadge ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  // Payment
  success: { bg: 'var(--green-muted)', text: 'var(--green)', dot: '#22C55E' },
  failed: { bg: 'var(--red-muted)', text: 'var(--red)', dot: '#EF4444' },
  pending: { bg: 'var(--yellow-muted)', text: 'var(--yellow)', dot: '#f59e0b' },
  // Gallery/Subscription
  active: { bg: 'var(--green-muted)', text: 'var(--green)', dot: '#22C55E' },
  draft: { bg: 'var(--blue-muted)', text: 'var(--blue)', dot: '#3b82f6' },
  archived: { bg: 'var(--bg-overlay)', text: 'var(--text-muted)', dot: '#666' },
  expired: { bg: 'var(--red-muted)', text: 'var(--red)', dot: '#EF4444' },
  canceled: { bg: 'var(--bg-overlay)', text: 'var(--text-muted)', dot: '#666' },
  // Plans
  pro: { bg: 'var(--fotia-orange-muted)', text: 'var(--fotia-orange)', dot: '#C8482E' },
  free: { bg: 'var(--bg-overlay)', text: 'var(--text-secondary)', dot: '#666' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: 'var(--bg-overlay)', text: 'var(--text-muted)', dot: '#666' }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {status}
    </span>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPrev: () => void
  onNext: () => void
}

export function Pagination({ page, totalPages, total, pageSize, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div
      className="px-5 py-3 flex items-center justify-between border-t"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {from}–{to} sur {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="p-1.5 rounded-md disabled:opacity-30 transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1 text-xs rounded" style={{ color: 'var(--text-muted)' }}>
          {page} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={page === totalPages}
          className="p-1.5 rounded-md disabled:opacity-30 transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── TableSkeleton ────────────────────────────────────────────────────────

export function TableSkeleton({ cols = 6, rows = 7 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div
                className="h-4 rounded-md animate-pulse"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  width: j === 0 ? '140px' : j === 1 ? '100px' : '70px',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description }: {
  icon: React.ElementType
  title: string
  description?: string
}) {
  return (
    <tr>
      <td colSpan={99} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-overlay)' }}
          >
            <Icon className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</div>
            {description && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</div>}
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── RefreshButton ────────────────────────────────────────────────────────

export function RefreshButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
      style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
    >
      <svg
        className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Actualiser
    </button>
  )
}

// ─── DataTable wrapper ────────────────────────────────────────────────────

export function DataTable({
  children,
  headers,
}: {
  children: React.ReactNode
  headers: string[]
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

// ─── FilterTabs ───────────────────────────────────────────────────────────

export function FilterTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { value: string; label: string }[]
  active: string
  onChange: (v: string) => void
}) {
  return (
    <div
      className="flex rounded-lg overflow-hidden border w-fit"
      style={{ borderColor: 'var(--border-default)' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className="px-4 py-2 text-xs font-semibold transition-all"
          style={{
            background: active === tab.value ? 'var(--fotia-orange-muted)' : 'var(--bg-surface)',
            color: active === tab.value ? 'var(--fotia-orange)' : 'var(--text-muted)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── SearchBar ────────────────────────────────────────────────────────────

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Rechercher...',
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
}) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      className="flex gap-2"
    >
      <div className="relative flex-1 min-w-[240px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--text-muted)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'var(--fotia-orange)', color: '#fff' }}
      >
        Chercher
      </button>
    </form>
  )
}
