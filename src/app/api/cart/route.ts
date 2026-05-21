import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIp, getGeoFromIp } from '@/lib/geo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartData, itemCount, totalValue } = body

    const sessionId = request.cookies.get('__session_id')?.value
    if (!sessionId) return NextResponse.json({ ok: true })

    const utmRaw = request.cookies.get('__utm')?.value
    let utmData: { source?: string; medium?: string; campaign?: string } = {}
    if (utmRaw) {
      try { utmData = JSON.parse(utmRaw) } catch { /* ignore */ }
    }

    const geo = getGeoFromIp(getClientIp(request))

    await prisma.cartSession.upsert({
      where: { sessionId },
      update: {
        cartData: JSON.stringify(cartData),
        itemCount,
        totalValue,
        lastSeenAt: new Date(),
      },
      create: {
        sessionId,
        cartData: JSON.stringify(cartData),
        itemCount,
        totalValue,
        utmSource: utmData.source ?? null,
        utmMedium: utmData.medium ?? null,
        utmCampaign: utmData.campaign ?? null,
        ipCountry: geo.country,
        ipCity: geo.city,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[cart]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
