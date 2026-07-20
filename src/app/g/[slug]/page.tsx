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

  const photographerName = gallery.profiles?.display_name || 'Photographe'
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

export default async function PublicGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Load gallery
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, title, slug, user_id, status, photo_count, allow_downloads, allow_favorites, description, cover_image_url')
    .eq('slug', slug)
    .single()

  if (!gallery) {
    notFound()
  }

  // Attempt to load profile with new columns, gracefully degrade if they don't exist yet
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, phone, instagram, facebook, tiktok, website, bio')
    .eq('id', gallery.user_id)
    .single()
  
  ;(gallery as any).profiles = profile || { display_name: null, avatar_url: null }

  // Load images
  let images: any[] = []
  const { data: dbImages } = await supabase
    .from('gallery_images')
    .select('id, r2_key, original_filename')
    .eq('gallery_id', gallery.id)
    .order('display_order', { ascending: true })

  if (dbImages && dbImages.length > 0) {
    images = dbImages
  } else {
    // Fallback to R2 bucket listing
    const folder = gallery.title ? gallery.title.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 80) : gallery.id;
    const prefix = `photos/${folder}/`
    try {
      const r2Images = await listImages(prefix)
      images = r2Images.map((obj, index) => {
        const key = obj.key
        const filename = key.split('/').pop() || `image-${index}.jpg`
        const id = `img-${index}-${key.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15)}`
        return {
          id,
          r2_key: key,
          original_filename: filename,
        }
      })
    } catch (err) {
      console.error('[Page] Error fetching from R2:', err)
    }
  }

  return <ClientGalleryView gallery={gallery as any} images={images as any} />
}