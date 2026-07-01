'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/lib/utils'

// ============================================================
// BUTTON
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }[variant]

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size]

  return (
    <button
      className={cx('btn', variantClass, sizeClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="spinner" style={{ width: 16, height: 16 }} />
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  )
}

// ============================================================
// INPUT
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  large?: boolean
}

export function Input({ label, error, hint, large, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cx('input', large ? 'input-lg' : '', className)}
        style={error ? { borderColor: 'var(--error)', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' } : {}}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 13, color: 'var(--error)' }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  )
}

// ============================================================
// BADGE
// ============================================================

interface BadgeProps {
  children: React.ReactNode
  variant?: 'orange' | 'green' | 'subtle'
}

export function Badge({ children, variant = 'subtle' }: BadgeProps) {
  const cls = { orange: 'badge-orange', green: 'badge-green', subtle: 'badge-subtle' }[variant]
  return <span className={cx('badge', cls)}>{children}</span>
}

// ============================================================
// SPINNER / LOADING
// ============================================================

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <FotiaLogo size={32} />
        <Spinner size={24} />
      </div>
    </div>
  )
}

// ============================================================
// FOTIA LOGO
// ============================================================

export function FotiaLogo({ size = 24 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="Fotia Logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  )
}

export function FotiaWordmark({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center gap-2', className)}>
      <img
        src="/logo.png"
        alt="Fotia Logo"
        width={100}
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

// ============================================================
// MODAL / DIALOG
// ============================================================

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  maxWidth?: number
}

export function Modal({ open, onClose, title, description, children, maxWidth = 480 }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const content = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="animate-fade-in-scale"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth,
          padding: '28px 28px 24px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {title && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h2>
            {description && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '6px 0 0' }}>
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}

// ============================================================
// SKELETON
// ============================================================

export function Skeleton({ width, height, rounded = false }: {
  width?: string | number
  height?: string | number
  rounded?: boolean
}) {
  return (
    <span
      className="skeleton"
      style={{
        display: 'block',
        width: width ?? '100%',
        height: height ?? 20,
        borderRadius: rounded ? '50%' : 'var(--radius-sm)',
      }}
    />
  )
}

// ============================================================
// TOAST SYSTEM
// ============================================================

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

type ToastListener = (toasts: Toast[]) => void
const listeners: ToastListener[] = []
let toasts: Toast[] = []

function notify(listeners: ToastListener[], toasts: Toast[]) {
  listeners.forEach((l) => l([...toasts]))
}

export const toast = {
  show(type: ToastType, title: string, description?: string) {
    const id = Math.random().toString(36).slice(2)
    const t: Toast = { id, type, title, description }
    toasts = [t, ...toasts].slice(0, 5)
    notify(listeners, toasts)
    setTimeout(() => {
      toasts = toasts.filter((x) => x.id !== id)
      notify(listeners, toasts)
    }, 4000)
  },
  success: (title: string, description?: string) => toast.show('success', title, description),
  error: (title: string, description?: string) => toast.show('error', title, description),
  info: (title: string, description?: string) => toast.show('info', title, description),
}

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

const toastColors: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--error)',
  info: 'var(--fotia-orange)',
  warning: 'var(--warning)',
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    const listener: ToastListener = (t) => setItems(t)
    listeners.push(listener)
    return () => {
      const idx = listeners.indexOf(listener)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  }, [])

  if (items.length === 0) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360,
      }}
    >
      {items.map((t) => (
        <div key={t.id} className="toast">
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: `${toastColors[t.type]}22`,
              color: toastColors[t.type],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {toastIcons[t.type]}
          </span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{t.title}</div>
            {t.description && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {t.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>,
    document.body
  )
}

// ============================================================
// PROGRESS BAR
// ============================================================

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cx('progress-bar', className)}>
      <div
        className="progress-bar-fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '64px 24px',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
        {description && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 280, margin: '0 auto' }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

// ============================================================
// STAT CARD
// ============================================================

export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: string
}) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-label">{label}</span>
        {icon && (
          <span style={{ color: 'var(--fotia-orange)', opacity: 0.8 }}>{icon}</span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{trend}</div>
      )}
    </div>
  )
}

// ============================================================
// COPY BUTTON
// ============================================================

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  return (
    <button className="btn btn-secondary btn-sm" onClick={copy}>
      {copied ? '✓ Copied' : label}
    </button>
  )
}

// ============================================================
// DROPDOWN MENU
// ============================================================

interface DropdownItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
}

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownItem[]
}

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '6px',
            minWidth: 180,
            zIndex: 100,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false) }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'none',
                border: 'none',
                color: item.destructive ? 'var(--error)' : 'var(--text-primary)',
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'none'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
