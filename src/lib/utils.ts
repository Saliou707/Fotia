import { nanoid } from 'nanoid'

// ============================================================
// Utility helpers
// ============================================================

/** Generate a short URL-safe ID */
export function generateId(size = 21): string {
  return nanoid(size)
}

/** Generate a short gallery slug */
export function generateGallerySlug(): string {
  return nanoid(10)
}

/** Format bytes to human-readable */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/** Format number with K/M suffix */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

/** Format date relative (e.g. "2 days ago") */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Format absolute date */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Clamp number between min/max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

/** Get client token from localStorage (or create one) */
export function getClientToken(): string {
  if (typeof window === 'undefined') return ''
  const key = 'fotia_client_token'
  let token = localStorage.getItem(key)
  if (!token) {
    token = nanoid(24)
    localStorage.setItem(key, token)
  }
  return token
}

/** Build WhatsApp share URL */
export function buildWhatsAppUrl(galleryUrl: string, photographerName?: string): string {
  const name = photographerName ?? 'your photographer'
  const message = `Hi! ${name} has shared a photo gallery with you through Fotia 📸\n\nView your photos here:\n${galleryUrl}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/** Validate file is an image */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  return validTypes.includes(file.type.toLowerCase())
}

/** Get file extension */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? 'jpg'
}

/** Merge class names (simple utility, no tailwind-merge dependency needed here) */
export function cx(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
