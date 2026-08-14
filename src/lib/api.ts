import type { Gallery, GalleryImage } from '@/types'

export type { Gallery, GalleryImage }

export interface UserProfile {
  id: string
  email: string
  plan: string
  storage_used_bytes: number
  gallery_count?: number
  display_name?: string | null
  phone?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  website?: string | null
  bio?: string | null
  avatar_url?: string | null
  onboarding_completed?: boolean
  has_used_beta?: boolean
}

export interface FavoritePhoto {
  id: string
  image_id: string
  gallery_id: string
  created_at: string
  r2_key: string
  original_filename: string
  gallery_title: string
}

export interface FavoriteGalleryStat {
  id: string
  title: string
  favorite_count: number
  cover?: string
}

// ─── Galeries ──────────────────────────────────────────────────────────────

export async function fetchGalleries(): Promise<Gallery[]> {
  const res = await fetch('/api/galleries')
  if (!res.ok) return []
  return res.json()
}

export async function fetchGallery(id: string): Promise<Gallery | null> {
  const res = await fetch(`/api/galleries/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function createGallery(title: string, description?: string, slug?: string): Promise<Gallery> {
  const res = await fetch('/api/galleries/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, slug }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || "Erreur lors de la création de la galerie.", { cause: data })
  }
  return data
}

export async function updateGallery(id: string, fields: Partial<{ title: string; description: string | null; slug: string; status: 'draft' | 'active' | 'archived'; is_password_protected: boolean; allow_downloads: boolean; allow_favorites: boolean; watermark_enabled: boolean }>): Promise<boolean> {
  const res = await fetch(`/api/galleries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  return res.ok
}

export async function deleteGallery(id: string): Promise<boolean> {
  const res = await fetch(`/api/galleries/${id}`, { method: 'DELETE' })
  return res.ok
}

// ─── Images d'une galerie ──────────────────────────────────────────────────

export async function fetchGalleryImages(slug: string): Promise<GalleryImage[]> {
  const res = await fetch(`/api/galerie/${slug}/images`)
  if (!res.ok) return []
  const data = await res.json()
  return data.images ?? []
}

export function getImageUrl(r2Key: string): string {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''
  return `${publicUrl}/${r2Key}`
}

// ─── Favoris (dashboard photographe) ───────────────────────────────────────

export async function fetchFavorites(): Promise<{ galleries: FavoriteGalleryStat[]; photos: FavoritePhoto[] } | null> {
  const res = await fetch('/api/favorites')
  if (!res.ok) return null
  return res.json()
}

// ─── Profil ────────────────────────────────────────────────────────────────

export async function fetchProfile(): Promise<UserProfile | null> {
  const res = await fetch('/api/profile')
  if (!res.ok) return null
  return res.json()
}

export async function updateProfile(fields: Partial<{
  display_name: string
  phone: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  website: string | null
  bio: string | null
  avatar_url: string | null
  onboarding_completed: boolean
}>): Promise<boolean> {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  return res.ok
}

// ─── Upload ────────────────────────────────────────────────────────────────

export async function initUpload(params: {
  filename: string
  content_type: string
  file_size_bytes: number
  gallery_id: string
}): Promise<{ image_id: string; upload_url: string; r2_key: string } | null> {
  const res = await fetch('/api/upload/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) return null
  return res.json()
}

export async function confirmUpload(image_id: string, r2_key: string, gallery_id: string): Promise<boolean> {
  const res = await fetch('/api/upload/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id, r2_key, gallery_id }),
  })
  return res.ok
}

export async function uploadFileToR2(uploadUrl: string, file: File): Promise<boolean> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  return res.ok
}

// ─── Favoris (galerie publique) ────────────────────────────────────────────

export async function addFavorite(galleryId: string, imageId: string, clientToken: string): Promise<boolean> {
  const res = await fetch(`/api/galleries/${galleryId}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: imageId, client_token: clientToken }),
  })
  return res.ok
}

export async function removeFavorite(galleryId: string, imageId: string, clientToken: string): Promise<boolean> {
  const res = await fetch(`/api/galleries/${galleryId}/favorites`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: imageId, client_token: clientToken }),
  })
  return res.ok
}

// ─── Formatage ────────────────────────────────────────────────────────────

export function fmtNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}

export function fmtBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' Go'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' Mo'
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' Ko'
  return bytes + ' o'
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
