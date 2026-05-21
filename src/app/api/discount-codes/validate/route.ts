import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Código no válido' })
    }

    const upper = code.trim().toUpperCase()
    const discount = await prisma.discountCode.findUnique({ where: { code: upper } })

    if (!discount) {
      return NextResponse.json({ valid: false, error: 'Código no encontrado' })
    }
    if (!discount.isActive) {
      return NextResponse.json({ valid: false, error: 'El código está desactivado' })
    }
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'El código ha expirado' })
    }
    if (discount.maxUsages !== null && discount.usageCount >= discount.maxUsages) {
      return NextResponse.json({ valid: false, error: 'El código ha alcanzado el límite de usos' })
    }

    return NextResponse.json({ valid: true, discountPct: discount.discountPct, code: discount.code })
  } catch (error) {
    console.error('[discount-codes validate]', error)
    return NextResponse.json({ valid: false, error: 'Error al validar el código' }, { status: 500 })
  }
}
