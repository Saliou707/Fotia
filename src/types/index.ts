// ============================================================
// FOTIA — Core Types
// ============================================================

// ---- Gallery ----
export interface Gallery {
  id: string
  user_id: string
  title: string
  description: string | null
  slug: string
  cover_image_url: string | null
  status: 'draft' | 'active' | 'archived'
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

// ---- Client-side upload state ----
export interface UploadFile {
  id: string // local uuid
  file: File
  preview_url: string
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  progress: number
  error?: string
  image_id?: string
}
