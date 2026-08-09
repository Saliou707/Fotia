import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

// Force le rendu dynamique (pas de static generation au build, car on utilise cookies() + Supabase)
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://myfotia.com').replace(/\/$/, '')

  // Pages statiques (routes existantes uniquement)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Galeries publiques dynamiques
  let galleryPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: galleries } = await supabase
      .from('galleries')
      .select('slug, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(500)

    if (galleries) {
      galleryPages = galleries.map((g) => ({
        url: `${baseUrl}/galerie/${g.slug}`,
        lastModified: g.updated_at ? new Date(g.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch {
    // Sitemap non-bloquant : si Supabase est down, on renvoie juste les pages statiques
  }

  return [...staticPages, ...galleryPages]
}
