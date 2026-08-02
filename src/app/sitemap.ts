import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

// Force le rendu dynamique (pas de static generation au build, car on utilise cookies() + Supabase)
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://myfotia.com'

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
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
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(500)

    if (galleries) {
      galleryPages = galleries.map((g) => ({
        url: `${baseUrl}/g/${g.slug}`,
        lastModified: g.updated_at ? new Date(g.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (err) {
    // Sitemap non-bloquant : si Supabase est down, on renvoie juste les pages statiques
    console.warn('[sitemap] Failed to fetch galleries:', err)
  }

  return [...staticPages, ...galleryPages]
}
