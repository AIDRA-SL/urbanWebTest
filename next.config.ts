import type { NextConfig } from 'next'
import path from 'path'

const generatedPrismaPath = path.join(process.cwd(), 'generated', 'prisma')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  devIndicators: false,
  experimental: {
    staleTimes: { dynamic: 30, static: 300 },
  },
  serverExternalPackages: [
    '@prisma/client',
    'geoip-lite',
    'sharp',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize the local generated Prisma client so webpack doesn't try
      // to process node:* imports inside it
      config.externals = config.externals || []
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals]
      externals.push(
        ({ request }: { request: string }, callback: (err: null, result?: string) => void) => {
          if (request?.includes('generated/prisma')) {
            // Use absolute path so Node.js can find it from .next/server at runtime
            return callback(null, `commonjs ${generatedPrismaPath}`)
          }
          callback(null)
        }
      )
      config.externals = externals
    }
    return config
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    localPatterns: [
      { pathname: '/uploads/**', search: '' },
      { pathname: '/*.jpg', search: '' },
      { pathname: '/*.png', search: '' },
      { pathname: '/*.webp', search: '' },
    ],
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
