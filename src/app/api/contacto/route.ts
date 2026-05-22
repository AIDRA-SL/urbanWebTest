import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, email, asunto, mensaje } = body

  if (!nombre || !email || !asunto || !mensaje) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  // Log the contact request (extend here with email provider like Resend/Nodemailer)
  console.log('[CONTACTO]', { nombre, email, asunto, mensaje })

  return NextResponse.json({ ok: true })
}
