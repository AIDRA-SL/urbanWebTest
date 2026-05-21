import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const pageSize = Number(request.nextUrl.searchParams.get('pageSize') ?? 20)

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count(),
  ])

  return NextResponse.json({
    data: orders,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, items, notes, shippingAddress, discountCode, discountAmount } = body

    const sessionId = request.cookies.get('__session_id')?.value ?? null
    const utmRaw = request.cookies.get('__utm')?.value
    let utmData: { source?: string; medium?: string; campaign?: string } = {}
    if (utmRaw) {
      try { utmData = JSON.parse(utmRaw) } catch { /* ignore */ }
    }

    const rawTotal = (items as { price: number; quantity: number }[]).reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    )
    const totalAmount = discountAmount ? rawTotal - Number(discountAmount) : rawTotal

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        totalAmount,
        customerName: customerName ?? null,
        customerEmail: customerEmail ?? null,
        customerPhone: customerPhone ?? null,
        shippingAddress: shippingAddress ?? null,
        notes: notes ?? null,
        discountCode: discountCode ?? null,
        discountAmount: discountAmount ? Number(discountAmount) : null,
        sessionId,
        utmSource: utmData.source ?? null,
        utmMedium: utmData.medium ?? null,
        utmCampaign: utmData.campaign ?? null,
        items: {
          create: (items as { productId: string; name: string; price: number; quantity: number; size?: string; variantId?: string }[]).map((item) => ({
            productId: item.productId,
            productName: item.name,
            unitPrice: item.price,
            quantity: item.quantity,
            size: item.size ?? null,
            variantId: item.variantId ?? null,
          })),
        },
      },
      include: { items: true },
    })

    // Mark cart session as converted
    if (sessionId) {
      await prisma.cartSession.updateMany({
        where: { sessionId },
        data: { isConverted: true, isAbandoned: false },
      })
    }

    // Increment discount code usage counter
    if (discountCode) {
      await prisma.discountCode.updateMany({
        where: { code: String(discountCode) },
        data: { usageCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error('[orders POST]', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
