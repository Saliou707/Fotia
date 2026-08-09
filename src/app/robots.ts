import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://myfotia.com').replace(/\/$/, '')

  // Zones privées : le disallow doit être répété dans CHAQUE groupe spécifique,
  // sinon la règle la plus spécifique (ex: GPTBot) prime sur `*` et le blocage est levé.
  const privateDisallow = ['/dashboard/', '/admin/', '/api/']

  return {
    rules: [
      {
        // Règle générale
        userAgent: '*',
        allow: '/',
        disallow: privateDisallow,
      },
      // ── Crawlers des moteurs IA (GEO : Generative Engine Optimization) ──
      // Explicitement autorisés sur les pages publiques pour être cités par
      // ChatGPT, Perplexity, Claude et les AI Overviews de Google/Apple.
      // (le disallow des zones privées est répété — un groupe spécifique prime sur `*`)
      { userAgent: 'GPTBot', allow: '/', disallow: privateDisallow },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: privateDisallow },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: privateDisallow },
      { userAgent: 'PerplexityBot', allow: '/', disallow: privateDisallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow: privateDisallow },
      { userAgent: 'Google-Extended', allow: '/', disallow: privateDisallow },
      { userAgent: 'Applebot-Extended', allow: '/', disallow: privateDisallow },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
