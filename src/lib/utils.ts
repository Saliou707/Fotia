import { nanoid } from 'nanoid'

// ============================================================
// Utility helpers
// ============================================================

/** Generate a short URL-safe ID */
export function generateId(size = 21): string {
  return nanoid(size)
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

/** Merge class names */
export function cx(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
