import type { Gallery, GalleryImage } from '@/types'

export type GalleryProfile = {
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  website: string | null
  bio: string | null
}

export type GalleryWithProfile = Gallery & { profiles: GalleryProfile | null }

export interface ClientGalleryProps {
  gallery: GalleryWithProfile
  images: GalleryImage[]
}
