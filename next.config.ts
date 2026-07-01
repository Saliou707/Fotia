import type { NextConfig } from 'next'

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
    ],
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
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
