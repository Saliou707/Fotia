import type { NextConfig } from 'next'

// 'unsafe-eval' n'est nécessaire qu'en développement (hot-reload SWC).
// En production on le retire pour durcir la CSP contre les attaques XSS.
const IS_PROD = process.env.NODE_ENV === 'production'

const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src':  ["'self'", "'unsafe-inline'", ...(IS_PROD ? [] : ["'unsafe-eval'"])],
  'style-src':   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src':     ["'self'", 'https:', 'data:', 'blob:'],
  'font-src':    ["'self'", 'https://fonts.gstatic.com', 'data:'],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://hbntvpgxypwwkgiupves.supabase.co',
    'wss://hbntvpgxypwwkgiupves.supabase.co',
    'https://api.djomy.africa',
    'https://sandbox-api.djomy.africa',
    'https://*.r2.dev',
    'https://*.r2.cloudflarestorage.com',
    'https://cdn.fotia.app',
  ],
  'frame-src':      ["'none'"],
  'object-src':     ["'none'"],
  'base-uri':       ["'self'"],
  'form-action':    ["'self'"],
  'frame-ancestors': ["'none'"],
}

function formatCsp(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([key, vals]) => `${key} ${vals.join(' ')}`)
    .join('; ')
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-f7996a23cc4a4ebb87cf43113dd5a3c9.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'cdn.fotia.app',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: formatCsp(CSP_DIRECTIVES),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site',
          },
        ],
      },
    ]
  },
  // Redirect 301 : ancien schema /g/[slug] → /galerie/[slug]
  async redirects() {
    return [
      {
        source: '/g/:slug',
        destination: '/galerie/:slug',
        permanent: true,
      },
    ]
  },

  // Allow server actions + gros fichiers (photos)
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '0.0.0.0:3000',
        '127.0.0.1:3000',
        '*.ngrok-free.app',
        '*.ngrok.app'
      ],
      bodySizeLimit: '50mb',
    },
  },
}

export default nextConfig
