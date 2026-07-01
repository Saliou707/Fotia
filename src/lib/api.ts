// ─── API client centralisé pour Fotia ─────────────────────────────────────
import { createClient } from '@/lib/supabase/client'

export interface Gallery {
  id: string
  title: string
  slug: string
  description: string | null
  status: 'active' | 'draft'
  photo_count: number
  view_count: number
  favorite_count: number
  download_count: number
  created_at: string
  cover_image_url?: string | null
}

export interface GalleryImage {
  id: string
  r2_key: string
  original_filename: string
  display_order: number
  file_size_bytes?: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  plan: string
  storage_used_bytes: number
}

// ─── Galeries ──────────────────────────────────────────────────────────────

export async function fetchGalleries(): Promise<Gallery[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('galleries')
    .select('id, title, slug, description, status, photo_count, view_count, favorite_count, download_count, created_at, cover_image_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) { console.error('[API] fetchGalleries:', error.message); return [] }
  return data ?? []
}

export async function fetchGallery(id: string): Promise<Gallery | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('galleries')
    .select('id, title, slug, description, status, photo_count, view_count, favorite_count, download_count, created_at, cover_image_url')
    .eq('id', id)
    .single()

  if (error) { console.error('[API] fetchGallery:', error.message); return null }
  return data
}

export async function createGallery(title: string, description?: string): Promise<Gallery> {
  const res = await fetch('/api/galleries/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create gallery', { cause: data })
  }
  return data
}

export async function updateGallery(id: string, fields: Partial<{ title: string; description: string; status: 'active' | 'draft' }>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('galleries').update(fields).eq('id', id)
  return !error
}

export async function deleteGallery(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('galleries').delete().eq('id', id)
  return !error
}

// ─── Images d'une galerie ──────────────────────────────────────────────────

export async function fetchGalleryImages(slug: string): Promise<GalleryImage[]> {
  const res = await fetch(`/api/gallery/${slug}/images`)
  if (!res.ok) return []
  const data = await res.json()
  return data.images ?? []
}

export function getImageUrl(r2Key: string): string {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''
  return `${publicUrl}/${r2Key}`
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

// ─── Dashboard stats ───────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<{
  totalGalleries: number
  totalPhotos: number
  totalViews: number
  totalFavorites: number
} | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('galleries')
    .select('photo_count, view_count, favorite_count')
    .eq('user_id', user.id)

  if (error || !data) return null

  return {
    totalGalleries: data.length,
    totalPhotos: data.reduce((s, g) => s + (g.photo_count ?? 0), 0),
    totalViews: data.reduce((s, g) => s + (g.view_count ?? 0), 0),
    totalFavorites: data.reduce((s, g) => s + (g.favorite_count ?? 0), 0),
  }
}

// ─── Profil utilisateur ────────────────────────────────────────────────────

export async function fetchProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('name, plan, storage_used_bytes')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? '',
    name: data?.name ?? user.email?.split('@')[0] ?? 'Utilisateur',
    plan: data?.plan ?? 'free',
    storage_used_bytes: data?.storage_used_bytes ?? 0,
  }
}

// ─── Utilitaire token client (galeries publiques) ─────────────────────────

export function getOrCreateClientToken(): string {
  const KEY = 'fotia_client_token'
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem(KEY)
  if (!token) {
    token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(KEY, token)
  }
  return token
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
