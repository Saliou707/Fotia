// ============================================================
// FOTIA — Core Types
// ============================================================

export type UserRole = 'photographer' | 'client'
export type GalleryStatus = 'draft' | 'active' | 'archived'
export type DownloadQuality = 'compressed' | 'original'
export type PlanTier = 'free' | 'pro' | 'studio'

// ---- User ----
export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  plan: PlanTier
  storage_used_bytes: number
  gallery_count: number
  created_at: string
  updated_at: string
}

// ---- Gallery ----
export interface Gallery {
  id: string
  user_id: string
  title: string
  description: string | null
  slug: string
  cover_image_url: string | null
  status: GalleryStatus
  is_password_protected: boolean
  password_hash: string | null
  allow_downloads: boolean
  allow_favorites: boolean
  watermark_enabled: boolean
  view_count: number
  download_count: number
  favorite_count: number
  photo_count: number
  created_at: string
  updated_at: string
  // Joined
  photographer?: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
}

export interface GalleryWithStats extends Gallery {
  views_last_7_days: number
  favorites_last_7_days: number
}

// ---- Gallery Image ----
export interface GalleryImage {
  id: string
  gallery_id: string
  user_id: string
  // Storage
  r2_key: string
  r2_thumbnail_key: string | null
  original_filename: string
  content_type: string
  file_size_bytes: number
  // Image metadata
  width: number | null
  height: number | null
  // Display
  display_order: number
  caption: string | null
  // Computed URLs (not in DB)
  url?: string
  thumbnail_url?: string
  // Timestamps
  created_at: string
  updated_at: string
  // Client-side state
  is_favorited?: boolean
}

// ---- Favorites ----
export interface Favorite {
  id: string
  gallery_id: string
  image_id: string
  client_token: string
  created_at: string
}

// ---- Gallery View ----
export interface GalleryView {
  id: string
  gallery_id: string
  client_token: string | null
  ip_hash: string | null
  user_agent: string | null
  referrer: string | null
  created_at: string
}

// ---- Download ----
export interface Download {
  id: string
  gallery_id: string
  image_id: string | null
  client_token: string | null
  quality: DownloadQuality
  created_at: string
}

// ---- Share Log ----
export interface ShareLog {
  id: string
  gallery_id: string
  platform: 'whatsapp' | 'copy_link' | 'email' | 'other'
  created_at: string
}

// ============================================================
// API / REQUEST / RESPONSE TYPES
// ============================================================

export interface CreateGalleryInput {
  title: string
  description?: string
  allow_downloads?: boolean
  allow_favorites?: boolean
  is_password_protected?: boolean
  password?: string
}

export interface UpdateGalleryInput extends Partial<CreateGalleryInput> {
  status?: GalleryStatus
  cover_image_id?: string
}

export interface UploadInitInput {
  filename: string
  content_type: string
  file_size_bytes: number
  gallery_id: string
}

export interface UploadInitResponse {
  image_id: string
  upload_url: string
  r2_key: string
}

export interface GalleryListItem {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  photo_count: number
  view_count: number
  favorite_count: number
  status: GalleryStatus
  created_at: string
}

// ============================================================
// CLIENT-SIDE STATE
// ============================================================

export interface UploadFile {
  id: string // local uuid
  file: File
  preview_url: string
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  progress: number
  error?: string
  image_id?: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
}
