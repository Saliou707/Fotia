'use client'

import React from 'react'
/* eslint-disable @next/next/no-img-element */
import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X, AlertCircle } from 'lucide-react'
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
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cx('input', large ? 'input-lg' : '', className)}
          style={error
            ? { borderColor: 'var(--error)', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)', paddingRight: error ? 38 : undefined }
            : {}}
          {...props}
        />
        {error && (
          <AlertCircle
            size={16}
            aria-hidden
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--error)', pointerEvents: 'none' }}
          />
        )}
      </div>
      <FieldError id={`${inputId}-error`} message={error} />
      {hint && !error && (
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  )
}

// ============================================================
// FIELD ERROR (message de validation inline)
// ============================================================

export function FieldError({ message, id }: { message?: string; id?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.span
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          style={{ fontSize: 12.5, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', lineHeight: 1.35 }}
        >
          <AlertCircle size={12} style={{ flexShrink: 0 }} />
          {message}
        </motion.span>
      )}
    </AnimatePresence>
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
let idCounter = 0

function notify() {
  listeners.forEach((l) => l([...toasts]))
}

export const toast = {
  show(type: ToastType, title: string, description?: string) {
    const id = `${Date.now().toString(36)}-${(++idCounter).toString(36)}`
    const t: Toast = { id, type, title, description }
    toasts = [t, ...toasts].slice(0, 5)
    notify()
    setTimeout(() => {
      toasts = toasts.filter((x) => x.id !== id)
      notify()
    }, 4500)
    return id
  },
  success: (title: string, description?: string) => toast.show('success', title, description),
  error: (title: string, description?: string) => toast.show('error', title, description),
  info: (title: string, description?: string) => toast.show('info', title, description),
  dismiss: (id: string) => {
    toasts = toasts.filter((x) => x.id !== id)
    notify()
  },
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={15} />,
  error: <XCircle size={15} />,
  info: <Info size={15} />,
  warning: <AlertTriangle size={15} />,
}

const toastColors: Record<ToastType, string> = {
  success: '#22C55E',
  error: '#EF4444',
  info: 'var(--fotia-orange)',
  warning: '#F59E0B',
}

// Détection client-only sans setState dans un effect (évite le mismatch d'hydratation)
// et la règle react-hooks/set-state-in-effect.
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function Toaster() {
  // Lazy initializer : récupère les toasts déjà émis avant le montage du composant
  // (ex: effet d'une page sœur) sans setState dans un effect.
  const [items, setItems] = useState<Toast[]>(() => [...toasts])
  const isClient = useIsClient()

  useEffect(() => {
    const listener: ToastListener = (t) => setItems(t)
    listeners.push(listener)
    return () => {
      const idx = listeners.indexOf(listener)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  }, [])

  // Verrou anti-mismatch d'hydratation : le portal n'est monté qu'une fois
  // côté client (rien n'est rendu côté serveur ni pendant l'hydratation).
  if (!isClient) return null

  return createPortal(
    <div
      className="toaster-container"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: 'calc(100% - 32px)',
        maxWidth: 360,
        pointerEvents: 'none',
      }}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="toast"
            role={t.type === 'error' ? 'alert' : 'status'}
            style={{ pointerEvents: 'auto' }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: `${toastColors[t.type]}1f`,
                color: toastColors[t.type],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {toastIcons[t.type]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{t.title}</div>
              {t.description && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.45 }}>
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              aria-label="Fermer la notification"
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                padding: 4, borderRadius: 6, flexShrink: 0, display: 'flex',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-overlay)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}

// ============================================================
// CONFIRM DIALOG
// ============================================================

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  loading = false,
  icon,
}: ConfirmDialogProps) {
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
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
    >
      <div
        className="animate-fade-in-scale"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 420,
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: danger ? 'rgba(239,68,68,0.12)' : 'var(--bg-overlay)',
              border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'var(--border-default)'}`,
              color: danger ? 'var(--error)' : 'var(--fotia-orange)',
            }}
          >
            {icon ?? <AlertTriangle size={19} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 id="confirm-dialog-title" style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              {title}
            </h3>
            {description && (
              <p id="confirm-dialog-desc" style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.5 }}>
                {description}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
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
