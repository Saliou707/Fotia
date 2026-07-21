import { createClient } from '@/lib/supabase/server'
import { listImages } from '@/lib/r2/client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ClientGalleryView from './ClientGalleryView'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: gallery } = await supabase
    .from('galleries')
    .select('title, description, cover_image_url, profiles(display_name)')
    .eq('slug', slug)
    .single()

  if (!gallery) {
    return { title: 'Galerie introuvable' }
  }

  const profiles = Array.isArray(gallery.profiles) ? gallery.profiles[0] : gallery.profiles
  const photographerName = (profiles as { display_name?: string } | null)?.display_name || 'Photographe'
  const title = `${gallery.title} | ${photographerName}`
  const description = gallery.description || `Découvrez la galerie "${gallery.title}" par ${photographerName} sur Fotia.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: gallery.cover_image_url ? [{ url: gallery.cover_image_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: gallery.cover_image_url ? [gallery.cover_image_url] : [],
    },
  }
}

// Type for the gallery+profile composite passed to ClientGalleryView
type ProfileShape = {
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  website: string | null
  bio: string | null
}

type GalleryWithProfile = {
  id: string
  title: string
  slug: string
  user_id: string
  status: string
  photo_count: number
  allow_downloads: boolean
  allow_favorites: boolean
  description: string | null
  cover_image_url: string | null
  profiles: ProfileShape | null
}

type SimpleImage = { id: string; r2_key: string; original_filename: string }

export default async function PublicGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Load gallery (full columns needed)
  const { data: rawGallery } = await supabase
    .from('galleries')
    .select('id, title, slug, user_id, status, photo_count, allow_downloads, allow_favorites, description, cover_image_url')
    .eq('slug', slug)
    .single()

  if (!rawGallery) {
    notFound()
  }

  // Load photographer profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, phone, instagram, facebook, tiktok, website, bio')
    .eq('id', rawGallery.user_id)
    .single()

  const gallery: GalleryWithProfile = {
    ...rawGallery,
    profiles: profile ?? { display_name: null, avatar_url: null, phone: null, instagram: null, facebook: null, tiktok: null, website: null, bio: null },
  }

  // Load images
  let images: SimpleImage[] = []
  const { data: dbImages } = await supabase
    .from('gallery_images')
    .select('id, r2_key, original_filename')
    .eq('gallery_id', gallery.id)
    .order('display_order', { ascending: true })

  if (dbImages && dbImages.length > 0) {
    images = dbImages
  } else {
    // Fallback to R2 bucket listing
    const folder = gallery.title ? gallery.title.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 80) : gallery.id
    const prefix = `photos/${folder}/`
    try {
      const r2Images = await listImages(prefix)
      images = r2Images.map((obj, index) => {
        const key = obj.key
        const filename = key.split('/').pop() || `image-${index}.jpg`
        const id = `img-${index}-${key.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15)}`
        return { id, r2_key: key, original_filename: filename }
      })
    } catch (err) {
      console.error('[Page] Error fetching from R2:', err)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ClientGalleryView gallery={gallery as any} images={images as any} />
}