interface GeoResult {
  country: string | null
  city: string | null
  region: string | null
}

export function getGeoFromIp(ip: string): GeoResult {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const geoip = require('geoip-lite')
    const geo = geoip.lookup(ip)
    if (!geo) return { country: null, city: null, region: null }
    return {
      country: geo.country ?? null,
      city: geo.city ?? null,
      region: geo.region ?? null,
    }
  } catch {
    return { country: null, city: null, region: null }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return '127.0.0.1'
}
