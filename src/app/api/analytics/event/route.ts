import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGeoFromIp, getClientIp } from '@/lib/geo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, productId, categoryId, orderId, searchQuery, pageUrl, referrer } = body

    const sessionId = request.cookies.get('__session_id')?.value ?? 'anonymous'
    const utmRaw = request.cookies.get('__utm')?.value
    let utmData: { source?: string; medium?: string; campaign?: string } = {}
    if (utmRaw) {
      try { utmData = JSON.parse(utmRaw) } catch { /* ignore */ }
    }

    const ip = getClientIp(request)
    const geo = getGeoFromIp(ip)

    const ua = request.headers.get('user-agent') ?? undefined
    let deviceType = 'desktop'
    if (ua) {
      const mobile = /mobile|android|iphone|ipad/i.test(ua)
      const tablet = /tablet|ipad/i.test(ua)
      deviceType = tablet ? 'tablet' : mobile ? 'mobile' : 'desktop'
    }

    await prisma.analyticsEvent.create({
      data: {
        type,
        sessionId,
        productId: productId ?? null,
        categoryId: categoryId ?? null,
        orderId: orderId ?? null,
        searchQuery: searchQuery ?? null,
        pageUrl: pageUrl ?? null,
        referrer: referrer ?? null,
        utmSource: utmData.source ?? null,
        utmMedium: utmData.medium ?? null,
        utmCampaign: utmData.campaign ?? null,
        ipAddress: ip !== '127.0.0.1' ? ip : null,
        ipCountry: geo.country,
        ipCity: geo.city,
        ipRegion: geo.region,
        userAgent: ua ?? null,
        deviceType,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[analytics/event]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
