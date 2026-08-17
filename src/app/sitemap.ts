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
      lastModified: new Date('2026-08-07'), // Correspond au SITE_DATE_MODIFIED
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  return staticPages
}

