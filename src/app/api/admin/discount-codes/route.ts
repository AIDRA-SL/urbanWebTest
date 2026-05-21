import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ data: codes })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { code, description, discountPct, expiresAt, maxUsages } = body

    if (!code || !discountPct) {
      return NextResponse.json({ error: 'Código y descuento son obligatorios' }, { status: 400 })
    }

    const upper = String(code).trim().toUpperCase()
    const pct = Number(discountPct)
    if (isNaN(pct) || pct < 1 || pct > 100) {
      return NextResponse.json({ error: 'El descuento debe estar entre 1 y 100' }, { status: 400 })
    }

    const created = await prisma.discountCode.create({
      data: {
        code: upper,
        description: description ?? null,
        discountPct: pct,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUsages: maxUsages ? Number(maxUsages) : null,
      },
    })

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error'
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ya existe un código con ese nombre' }, { status: 409 })
    }
    console.error('[admin/discount-codes POST]', error)
    return NextResponse.json({ error: 'Error al crear el código' }, { status: 500 })
  }
}
