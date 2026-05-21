import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const adminPath = process.env.ADMIN_PATH ?? 'panel-x7k2mq'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [`/${adminPath}/`, '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
